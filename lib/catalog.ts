import { cache } from "react";
import { connectDB } from "@/lib/db";
import Product from "@/models/Product";
import Category from "@/models/Category";
import type { CategoryOption, Product as ProductView } from "@/data/products";
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
  // A null timestamp means the record has no createdAt value.
  // Those legacy records are sorted after timestamped records and need
  // their own pagination branch so they are not skipped.
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
  return Buffer.from(JSON.stringify(value), "utf8").toString("base64url");
}

function decodeCursor(cursor?: string): MongoCursor | null {
  if (!cursor) return null;

  try {
    const value = JSON.parse(Buffer.from(cursor, "base64url").toString("utf8"));

    if (
      value &&
      typeof value === "object" &&
      (typeof value.createdAt === "string" || value.createdAt === null) &&
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

function buildFilter(options: ProductFilters): Record<string, any> {
  // Only explicitly archived products are hidden from the catalogue.
  // This keeps legacy products (including records with a missing/older status
  // value) visible instead of making them disappear from the homepage.
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
    const escaped = options.q.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    filter.name = { $regex: escaped, $options: "i" };
  }

  const hasMin =
    typeof options.minPrice === "number" &&
    Number.isFinite(options.minPrice);
  const hasMax =
    typeof options.maxPrice === "number" &&
    Number.isFinite(options.maxPrice);

  if (hasMin || hasMax) {
    filter.price = {
      ...(hasMin ? { $gte: options.minPrice } : {}),
      ...(hasMax ? { $lte: options.maxPrice } : {}),
    };
  }

  return filter;
}

export async function getProductsPage(
  options: ProductFilters & { limit?: number; cursor?: string } = {},
): Promise<ProductPage> {
  if (!process.env.MONGODB_URI) {
    throw new Error("MONGODB_URI is required to load products.");
  }

  const limit = Math.min(Math.max(options.limit ?? 12, 1), 24);
  const decodedCursor = decodeCursor(options.cursor);

  await connectDB();

  const filter = buildFilter(options);

  if (options.cursor && !decodedCursor) {
    throw new Error("Invalid product pagination cursor.");
  }

  if (decodedCursor) {
    const cursorId = new Types.ObjectId(decodedCursor.id);

    if (decodedCursor.createdAt === null) {
      // Legacy products can have no createdAt field. MongoDB sorts those
      // records after timestamped records with the current descending sort,
      // so once pagination reaches them we continue within that group by _id.
      filter.createdAt = null;
      filter._id = { $lt: cursorId };
    } else {
      const createdAt = new Date(decodedCursor.createdAt);

      if (Number.isNaN(createdAt.getTime())) {
        throw new Error("Invalid product pagination cursor.");
      }

      filter.$or = [
        { createdAt: { $lt: createdAt } },
        {
          createdAt,
          _id: { $lt: cursorId },
        },
        // Include legacy documents with a missing/null timestamp after all
        // timestamped documents. Without this branch they are never reached
        // by infinite-scroll pagination.
        { createdAt: null },
      ];
    }
  }

  const docs = await Product.find(filter)
    .sort({ createdAt: -1, _id: -1 })
    .limit(limit + 1)
    .lean();

  const hasMore = docs.length > limit;
  const pageDocs = hasMore ? docs.slice(0, limit) : docs;
  const page = pageDocs.map(fromMongo);

  const last = pageDocs[pageDocs.length - 1];
  const nextCursor =
    hasMore && last?._id
      ? encodeCursor({
        createdAt: last.createdAt
          ? new Date(last.createdAt).toISOString()
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

export async function getProducts(
  options: ProductFilters & { limit?: number } = {},
): Promise<ProductView[]> {
  const page = await getProductsPage(options);
  return page.products;
}

export async function getProduct(id: string): Promise<ProductView | null> {
  if (!process.env.MONGODB_URI) {
    throw new Error("MONGODB_URI is required to load products.");
  }

  await connectDB();
  const doc = await Product.findOne({
    $or: [{ legacyId: id }, { slug: id }],
  }).lean();

  return doc ? fromMongo(doc) : null;
}

export const getCategories = cache(async (): Promise<CategoryOption[]> => {
  if (!process.env.MONGODB_URI) {
    throw new Error("MONGODB_URI is required to load categories.");
  }

  await connectDB();
  const docs = await Category.find()
    .select("slug title productCount")
    .sort({ title: 1 })
    .lean();

  return docs.map((category) => ({
    slug: category.slug,
    title: category.title,
    productCount: category.productCount ?? 0,
  }));
});
