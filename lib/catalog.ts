import { unstable_cache } from "next/cache";
import { connectDB } from "@/lib/db";
import Product from "@/models/Product";
import Category from "@/models/Category";
import type {
  CategoryOption,
  Product as ProductView,
} from "@/data/products";
import { Types } from "mongoose";

type ProductFilters = {
  q?: string;
  category?: string;
  location?: string;
  minPrice?: number;
  maxPrice?: number;
};

export type ProductPage = {
  products: ProductView[];
  nextCursor: string | null;
  hasMore: boolean;
};

type MongoCursor = {
  createdAt: string | null;
  id: string;
};

function fromMongo(doc: any): ProductView & { _id?: string } {
  return {
    id: doc.legacyId || doc._id?.toString(),
    name: doc.name,
    category: doc.categorySlug,
    description: doc.description,
    price: doc.price,
    currency: doc.currency,
    image: doc.image,
    deals: doc.deals ?? 0,
    vendorName: doc.vendorName || "LMP",
    vendorLevel: doc.vendorLevel ?? 1,
    verified: Boolean(doc.verified),
    location: doc.location ?? "",
    details: Array.isArray(doc.details) ? doc.details : [],
    disputes: doc.disputes ?? 0,
    _id: doc._id?.toString(),
  };
}

function encodeCursor(value: MongoCursor): string {
  return Buffer.from(
    JSON.stringify(value),
    "utf8",
  ).toString("base64url");
}

function decodeCursor(
  cursor?: string,
): MongoCursor | null {
  if (!cursor) return null;

  try {
    const value = JSON.parse(
      Buffer.from(cursor, "base64url").toString("utf8"),
    );

    if (
      value &&
      typeof value === "object" &&
      (typeof value.createdAt === "string" ||
        value.createdAt === null) &&
      typeof value.id === "string" &&
      Types.ObjectId.isValid(value.id)
    ) {
      return value as MongoCursor;
    }

    return null;
  } catch {
    return null;
  }
}

function buildFilter(
  options: ProductFilters,
): Record<string, any> {
  const filter: Record<string, any> = {
    status: { $ne: "archived" },
  };

  if (options.category?.trim()) {
    const escapedCategory = options.category
      .trim()
      .replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

    filter.categorySlug = {
      $regex: `^${escapedCategory}$`,
      $options: "i",
    };
  }

  if (options.location?.trim()) {
    const escapedLocation = options.location
      .trim()
      .replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

    filter.location = {
      $regex: escapedLocation,
      $options: "i",
    };
  }

  if (options.q?.trim()) {
    const escaped = options.q
      .trim()
      .replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

    filter.name = {
      $regex: escaped,
      $options: "i",
    };
  }

  const hasMin =
    typeof options.minPrice === "number" &&
    Number.isFinite(options.minPrice);

  const hasMax =
    typeof options.maxPrice === "number" &&
    Number.isFinite(options.maxPrice);

  if (hasMin || hasMax) {
    filter.price = {
      ...(hasMin
        ? { $gte: options.minPrice }
        : {}),
      ...(hasMax
        ? { $lte: options.maxPrice }
        : {}),
    };
  }

  return filter;
}

async function getProductsPageUncached(
  options: ProductFilters & {
    limit?: number;
    cursor?: string;
  } = {},
): Promise<ProductPage> {
  if (!process.env.MONGODB_URI) {
    throw new Error(
      "MONGODB_URI is required to load products.",
    );
  }

  const limit = Math.min(
    Math.max(options.limit ?? 12, 1),
    24,
  );

  const decodedCursor = decodeCursor(
    options.cursor,
  );

  await connectDB();

  const filter = buildFilter(options);

  if (options.cursor && !decodedCursor) {
    throw new Error(
      "Invalid product pagination cursor.",
    );
  }

  if (decodedCursor) {
    const cursorId = new Types.ObjectId(
      decodedCursor.id,
    );

    if (decodedCursor.createdAt === null) {
      filter.createdAt = null;
      filter._id = {
        $lt: cursorId,
      };
    } else {
      const createdAt = new Date(
        decodedCursor.createdAt,
      );

      if (Number.isNaN(createdAt.getTime())) {
        throw new Error(
          "Invalid product pagination cursor.",
        );
      }

      filter.$or = [
        {
          createdAt: {
            $lt: createdAt,
          },
        },
        {
          createdAt,
          _id: {
            $lt: cursorId,
          },
        },
        {
          createdAt: null,
        },
      ];
    }
  }

  const docs = await Product.find(filter)
    .select(
      "legacyId name categorySlug description price currency image deals vendorName vendorLevel verified location details disputes createdAt _id",
    )
    .sort({
      createdAt: -1,
      _id: -1,
    })
    .limit(limit + 1)
    .lean();

  const hasMore = docs.length > limit;

  const pageDocs = hasMore
    ? docs.slice(0, limit)
    : docs;

  const page = pageDocs.map(fromMongo);

  const last = pageDocs[pageDocs.length - 1];

  const nextCursor =
    hasMore && last?._id
      ? encodeCursor({
        createdAt: last.createdAt
          ? new Date(
            last.createdAt,
          ).toISOString()
          : null,
        id: last._id.toString(),
      })
      : null;

  return {
    products: page,
    hasMore,
    nextCursor,
  };
}

const getCachedCategoryPage =
  unstable_cache(
    async (
      category: string,
      cursor: string | undefined,
      limit: number,
    ) =>
      getProductsPageUncached({
        category,
        cursor,
        limit,
      }),
    ["catalog-category-products"],
    {
      revalidate: 60,
    },
  );

export async function getProductsPage(
  options: ProductFilters & {
    limit?: number;
    cursor?: string;
  } = {},
): Promise<ProductPage> {
  const hasOnlyCategoryFilter =
    Boolean(options.category?.trim()) &&
    !options.q?.trim() &&
    !options.location?.trim() &&
    options.minPrice === undefined &&
    options.maxPrice === undefined;

  if (hasOnlyCategoryFilter) {
    return getCachedCategoryPage(
      options.category!.trim().toLowerCase(),
      options.cursor,
      Math.min(
        Math.max(options.limit ?? 12, 1),
        24,
      ),
    );
  }

  return getProductsPageUncached(
    options,
  );
}

export async function getProducts(
  options: ProductFilters & {
    limit?: number;
  } = {},
): Promise<ProductView[]> {
  const page = await getProductsPage(options);

  return page.products;
}

export async function getProduct(
  id: string,
): Promise<ProductView | null> {
  if (!process.env.MONGODB_URI) {
    throw new Error(
      "MONGODB_URI is required to load products.",
    );
  }

  await connectDB();

  const doc = await Product.findOne({
    $or: [
      { legacyId: id },
      { slug: id },
    ],
  })
    .select(
      "legacyId slug name categorySlug description price currency image deals vendorName vendorLevel verified location details disputes",
    )
    .lean();

  return doc
    ? fromMongo(doc)
    : null;
}

const getCategoriesCached =
  unstable_cache(
    async (): Promise<CategoryOption[]> => {
      if (!process.env.MONGODB_URI) {
        throw new Error(
          "MONGODB_URI is required to load categories.",
        );
      }

      await connectDB();

      const docs = await Category.find()
        .select(
          "slug title description image productCount -_id",
        )
        .sort({
          title: 1,
        })
        .lean();

      return docs.map(
        (category) => ({
          slug: category.slug,
          title: category.title,
          description: category.description,
          image: category.image,
          productCount:
            category.productCount ?? 0,
        }),
      );
    },
    ["site-categories"],
    {
      revalidate: 300,
    },
  );

export async function getCategories(): Promise<
  CategoryOption[]
> {
  return getCategoriesCached();
}

export async function getCategoryBySlug(
  slug: string,
): Promise<CategoryOption | null> {
  const normalizedSlug = slug.trim().toLowerCase();

  if (!normalizedSlug) {
    return null;
  }

  const categories = await getCategoriesCached();

  return (
    categories.find(
      (category) => category.slug.trim().toLowerCase() === normalizedSlug,
    ) ?? null
  );
}
