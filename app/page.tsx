import { Suspense } from "react";
import { Breadcrumb } from "@/components/Breadcrumb";
import { Sidebar } from "@/components/Sidebar";
import { CatalogResults } from "@/components/CatalogResults";
import { CatalogResultsSkeleton } from "@/components/CatalogResultsSkeleton";
import { T } from "@/components/Translated";
import { getCategories } from "@/lib/catalog";

type SearchParams = Record<string, string | string[] | undefined>;

export default async function HomePage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const categories = await getCategories();

  return (
    <main className="page-shell">
      <Breadcrumb />
      <div className="home-grid">
        <Suspense fallback={<aside className="sidebar"><div className="panel">Loading search…</div></aside>}>
          <Sidebar categories={categories} />
        </Suspense>
        <section className="main-content">
          <div className="shops-title"><T k="★ SHOPS" /></div>
          <Suspense fallback={<CatalogResultsSkeleton />}>
            <CatalogResults searchParams={searchParams} />
          </Suspense>
        </section>
      </div>
    </main>
  );
}
