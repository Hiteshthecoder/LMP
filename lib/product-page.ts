import { Types } from "mongoose";
import { connectDB } from "@/lib/db";
import Product from "@/models/Product";
import Feedback from "@/models/Feedback";
import type { Product as ProductView } from "@/data/products";

export type ProductPageData = ProductView & {
  _id: string;
  vendorName: string;
  disputes: number;
  categoryTitle?: string;
};

function mapProduct(doc: any): ProductPageData {
  return {
    _id: doc._id.toString(),
    id: doc.legacyId || doc.slug || doc._id.toString(),
    name: doc.name,
    category: doc.categorySlug,
    categoryTitle: doc.categoryTitle,
    description: doc.description,
    price: doc.price,
    currency: doc.currency,
    image: doc.image,
    deals: doc.deals ?? 0,
    vendorName: doc.vendorName || "LMP",
    vendorLevel: doc.vendorLevel ?? 1,
    rating: doc.rating ?? 0,
    reviews: doc.reviews ?? 0,
    verified: Boolean(doc.verified),
    location: doc.location ?? "",
    details: Array.isArray(doc.details) ? doc.details : [],
    disputes: doc.disputes ?? 0,
  };
}

export async function getProductPageData(id: string) {
  if (!process.env.MONGODB_URI) return null;

  await connectDB();
  const product = await Product.findOne({
    status: "active",
    $or: [{ legacyId: id }, { slug: id }, ...(Types.ObjectId.isValid(id) ? [{ _id: new Types.ObjectId(id) }] : [])],
  })
    .select("legacyId slug name categorySlug description price currency image deals vendorName vendorLevel rating reviews verified location details disputes")
    .lean();

  if (!product) return null;
  return mapProduct(product);
}

export async function getRelatedProducts(categorySlug: string, productId: string, limit = 4) {
  await connectDB();
  const docs = await Product.find({
    status: "active",
    categorySlug,
    _id: { $ne: new Types.ObjectId(productId) },
  })
    .select("legacyId slug name image price currency vendorName vendorLevel rating deals verified location")
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean();

  return docs.map(mapProduct);
}

export async function getProductFeedback(productId: string, limit = 20) {
  await connectDB();
  const docs = await Feedback.find({ productId })
    .select("displayName rating comment sellerReply sellerReplyAt createdAt")
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean();

  return docs.map((feedback: any) => ({
    id: feedback._id.toString(),
    displayName: feedback.displayName,
    rating: feedback.rating,
    comment: feedback.comment,
    sellerReply: feedback.sellerReply ?? null,
    sellerReplyAt: feedback.sellerReplyAt ? new Date(feedback.sellerReplyAt).toISOString() : null,
    createdAt: new Date(feedback.createdAt).toISOString(),
  }));
}

export async function getCategoryProductCount(categorySlug: string) {
  await connectDB();
  return Product.countDocuments({ categorySlug, status: "active" });
}
