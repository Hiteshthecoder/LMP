import type { MetadataRoute } from "next";
import { connectDB } from "@/lib/db";
import Product from "@/models/Product";
import Category from "@/models/Category";
import { SITE_URL, categoryPath, productPath } from "@/lib/seo";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const staticPages: MetadataRoute.Sitemap = [
        { url: SITE_URL, changeFrequency: "daily", priority: 1 },
        { url: `${SITE_URL}/products`, changeFrequency: "daily", priority: 0.9 },
        { url: `${SITE_URL}/about`, changeFrequency: "monthly", priority: 0.5 },
        { url: `${SITE_URL}/help`, changeFrequency: "monthly", priority: 0.5 },
    ];

    if (!process.env.MONGODB_URI) return staticPages;
    await connectDB();

    const [products, categories] = await Promise.all([
        Product.find({ status: { $ne: "archived" }, slug: { $exists: true, $ne: "" } })
            .select("slug legacyId updatedAt")
            .sort({ updatedAt: -1, _id: -1 })
            .limit(50000)
            .lean(),
        Category.find({ slug: { $exists: true, $ne: "" }, productCount: { $gt: 0 } })
            .select("slug updatedAt")
            .sort({ updatedAt: -1 })
            .limit(10000)
            .lean(),
    ]);

    return [
        ...staticPages,
        ...categories.map((category) => ({
            url: `${SITE_URL}${categoryPath(category.slug)}`,
            lastModified: category.updatedAt || undefined,
            changeFrequency: "weekly" as const,
            priority: 0.8,
        })),
        ...products.map((product) => ({
            url: `${SITE_URL}${productPath(product.slug || product.legacyId || product._id?.toString())}`,
            lastModified: product.updatedAt || undefined,
            changeFrequency: "weekly" as const,
            priority: 0.8,
        })),
    ];
}
