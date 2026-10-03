import { Suspense } from "react";
import Link from "next/link";
import type { CategoryOption } from "@/data/products";
import { T } from "@/components/Translated";
import { SidebarSearch } from "@/components/SidebarSearch";
import { LatestReviews } from "@/components/LatestReviews";
import { LatestReviewsSkeleton } from "@/components/LatestReviewsSkeleton";
import { HomeAccountPanel } from "@/components/HomeAccountPanel";

type Props = {
  categories: CategoryOption[];
};

export function Sidebar({ categories }: Props) {
  return (
    <aside className="sidebar">
      <HomeAccountPanel />
      <SidebarSearch categories={categories} />

      <div className="panel">
        <div className="panel-title">
          <T k="LATEST REVIEWS" />
        </div>

        <Suspense fallback={<LatestReviewsSkeleton />}>
          <LatestReviews />
        </Suspense>
      </div>

      <div className="panel">
        <div className="panel-title">
          <T k="NEW CATALOGS" />
        </div>

        {categories.map((category, index) => (
          <div className="review" key={category.slug}>
            <Link href={`/?category=${encodeURIComponent(category.slug)}`}>
              <b><T k={category.title} /></b>
            </Link>

            <div>
              <T k="Items" />: {category.productCount} ·{" "}
              <T k="Reviews" />: {12 + index * 7} · ★ {80 + index * 4}%
            </div>
          </div>
        ))}
      </div>
    </aside>
  );
}
