import { unstable_cache } from "next/cache";
import { connectDB } from "@/lib/db";
import Review from "@/models/Review";

export type LatestReview = {
  id: string;
  createdAt: string;
  reviewer: string;
  rating: number;
  comment: string;
};

const demoReviews: LatestReview[] = Array.from({ length: 8 }, (_, index) => ({
  id: `demo-${index + 1}`,
  createdAt: new Date(Date.now() - (index + 5) * 60 * 60 * 1000).toISOString(),
  reviewer: `DemoReviewer${index + 1}`,
  rating: 5,
  comment: "Great communication and clean presentation.",
}));

const getCachedLatestReviews = unstable_cache(
  async (): Promise<LatestReview[]> => {
    if (!process.env.MONGODB_URI) return demoReviews;

    try {
      await connectDB();
      const docs = await Review.find({})
        .sort({ createdAt: -1 })
        .limit(8)
        .populate({ path: "userId", select: "displayName username" })
        .select("userId rating comment createdAt")
        .lean();

      if (!docs.length) return demoReviews;

      return docs.map((doc: any) => ({
        id: String(doc._id),
        createdAt: new Date(doc.createdAt).toISOString(),
        reviewer: doc.userId?.displayName || doc.userId?.username || "Reviewer",
        rating: Math.max(1, Math.min(5, Number(doc.rating) || 5)),
        comment: String(doc.comment || ""),
      }));
    } catch {
      return demoReviews;
    }
  },
  ["latest-reviews"],
  { revalidate: 30 },
);

export function getLatestReviews() {
  return getCachedLatestReviews();
}
