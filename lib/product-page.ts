import { unstable_cache } from "next/cache";
import { Types } from "mongoose";

import { connectDB } from "@/lib/db";
import Product from "@/models/Product";

import type {
  Product as ProductView,
} from "@/data/products";

export type ProductPageData =
  ProductView & {
    _id: string;
    vendorName: string;
    disputes: number;
    categoryTitle?: string;
  };

function mapProduct(doc: any): ProductPageData {
  return {
    _id: doc._id.toString(),

    id:
      doc.legacyId ||
      doc.slug ||
      doc._id.toString(),

    name: doc.name,

    category: doc.categorySlug,

    categoryTitle:
      doc.categoryTitle,

    description:
      doc.description,

    price: doc.price,

    currency:
      doc.currency,

    image:
      doc.image,

    deals:
      doc.deals ?? 0,

    vendorName:
      doc.vendorName || "LMP",

    vendorLevel:
      doc.vendorLevel ?? 1,

    verified:
      Boolean(doc.verified),

    location:
      doc.location ?? "",

    details:
      Array.isArray(doc.details)
        ? doc.details
        : [],

    disputes:
      doc.disputes ?? 0,
  };
}

const getProductPageDataCached =
  unstable_cache(
    async (
      id: string,
    ): Promise<ProductPageData | null> => {
      if (!process.env.MONGODB_URI) {
        return null;
      }

      await connectDB();

      const product =
        await Product.findOne({
          status: "active",

          $or: [
            { legacyId: id },
            { slug: id },

            ...(Types.ObjectId.isValid(id)
              ? [
                {
                  _id: new Types.ObjectId(
                    id,
                  ),
                },
              ]
              : []),
          ],
        })
          .select(
            "legacyId slug name categorySlug description price currency image deals vendorName vendorLevel verified location details disputes",
          )
          .lean();

      return product
        ? mapProduct(product)
        : null;
    },

    ["product-page-data"],

    {
      revalidate: 60,
    },
  );

export async function getProductPageData(
  id: string,
) {
  return getProductPageDataCached(id);
}

const getRelatedProductsCached =
  unstable_cache(
    async (
      categorySlug: string,
      productId: string,
      limit: number,
    ) => {
      await connectDB();

      const docs =
        await Product.find({
          status: "active",

          categorySlug,

          _id: {
            $ne: new Types.ObjectId(
              productId,
            ),
          },
        })
          .select(
            "legacyId slug name categorySlug description image price currency vendorName vendorLevel deals verified location details disputes",
          )
          .sort({
            createdAt: -1,
            _id: -1,
          })
          .limit(limit)
          .lean();

      return docs.map(mapProduct);
    },

    ["related-products"],

    {
      revalidate: 60,
    },
  );

export async function getRelatedProducts(
  categorySlug: string,
  productId: string,
  limit = 4,
) {
  return getRelatedProductsCached(
    categorySlug,
    productId,
    limit,
  );
}

export async function getCategoryProductCount(
  categorySlug: string,
) {
  await connectDB();

  return Product.countDocuments({
    categorySlug,
    status: "active",
  });
}