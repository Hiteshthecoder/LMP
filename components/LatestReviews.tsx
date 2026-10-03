import { getLatestReviews } from "@/lib/reviews";
import { LatestReviewsList } from "@/components/LatestReviewsList";

export async function LatestReviews() {
  const reviews = await getLatestReviews();
  return <LatestReviewsList reviews={reviews} />;
}
