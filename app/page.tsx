import { Suspense } from "react";
import { Breadcrumb } from "@/components/Breadcrumb";
import { CatalogResults } from "@/components/CatalogResults";
import { CatalogResultsSkeleton } from "@/components/CatalogResultsSkeleton";
import { getCategories } from "@/lib/catalog";
import { SITE_NAME, SITE_DESCRIPTION } from "@/lib/seo";
import { Metadata } from "next";
import { AsyncSidebar, SidebarFallback } from "@/components/AsyncSideBar";


type SearchParams = Record<string, string | string[] | undefined>;

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}): Promise<Metadata> {
  const params = await searchParams;
  const hasFilters = Object.values(params).some((value) =>
    Array.isArray(value) ? value.length > 0 : Boolean(value),
  );

  if (hasFilters) {
    return {
      title: "LMP : Le Monde Parallel Global MarketPlace For Guns, Drugs and Firearms",
      description: "Browse and filter Items in the LMP : Le Monde Parallel Marketplace.",
      robots: { index: false, follow: true },
      alternates: { canonical: "/" },
    };
  }

  return {
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
    alternates: { canonical: "/" },
    openGraph: {
      title: SITE_NAME,
      description: SITE_DESCRIPTION,
      url: "/",
      type: "website",
    },
  };
}

export default async function HomePage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const categories = await getCategories();

  return (
    <main className="page-shell">
      <Breadcrumb />
      <div className="home-grid">
        <Suspense fallback={<SidebarFallback />}>
          <AsyncSidebar />
        </Suspense>
        <section className="main-content">
          <div className="shops-title">★ SHOPS</div>
          <Suspense fallback={<CatalogResultsSkeleton />}>
            <CatalogResults searchParams={searchParams} />
          </Suspense>
        </section>
      </div>
    </main>
  );
}
