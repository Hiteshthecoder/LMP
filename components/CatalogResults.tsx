import { CatalogInfiniteList } from "@/components/CatalogInfiniteList";
import { getProductsPage } from "@/lib/catalog";

type SearchParams = Record<string, string | string[] | undefined>;

function valueOf(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function buildCurrentQuery(params: SearchParams) {
  const query = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (Array.isArray(value)) {
      if (value[0]) query.set(key, value[0]);
    } else if (value) {
      query.set(key, value);
    }
  }

  const serialized = query.toString();
  return serialized ? `/?${serialized}` : "/";
}

export async function CatalogResults({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const params = await searchParams;

  const minPriceRaw = valueOf(params.minPrice);
  const maxPriceRaw = valueOf(params.maxPrice);
  const minPriceValue = Number(minPriceRaw);
  const maxPriceValue = Number(maxPriceRaw);

  const filters = {
    q: valueOf(params.q),
    location: valueOf(params.location),
    category: valueOf(params.category),
    minPrice: Number.isFinite(minPriceValue) && minPriceRaw ? minPriceValue : undefined,
    maxPrice: Number.isFinite(maxPriceValue) && maxPriceRaw ? maxPriceValue : undefined,
  };

  try {
    const page = await getProductsPage({
      ...filters,
      limit: 12,
    });

    if (!page.products.length) {
      return <div className="content-card search-empty">No catalogue items match your search.</div>;
    }

    return (
      <CatalogInfiniteList
        initialProducts={page.products}
        initialCursor={page.nextCursor}
        initialHasMore={page.hasMore}
        filters={filters}
      />
    );
  } catch (error) {
    console.error("Catalog products could not be loaded:", error);

    return (
      <div className="catalog-load-more-error catalog-initial-error" role="alert">
        <span>Could not load products.</span>
        <a className="btn" href={buildCurrentQuery(params)}>
          Try again
        </a>
      </div>
    );
  }
}
