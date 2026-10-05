"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Product } from "@/data/products";
import { ShopCard } from "@/components/ShopCard";
import { t } from "@/lib/text";

type CatalogFilters = {
  q?: string;
  location?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
};

type Props = {
  initialProducts: Product[];
  initialCursor: string | null;
  initialHasMore: boolean;
  filters: CatalogFilters;
};

type ProductPageResponse = {
  products: Product[];
  nextCursor: string | null;
  hasMore: boolean;
};

function LoadingCards({ label }: { label: string }) {
  return (
    <div className="shops-grid catalog-load-more" aria-label={label} aria-busy="true">
      {Array.from({ length: 3 }, (_, index) => (
        <article className="shop-card skeleton-card" key={index}>
          <div className="skeleton skeleton-name" />
          <div className="shop-body">
            <div className="skeleton skeleton-image" />
            <div className="skeleton-copy">
              <div className="skeleton skeleton-line skeleton-line-medium" />
              <div className="skeleton skeleton-line skeleton-line-short" />
              <div className="skeleton skeleton-divider" />
              <div className="skeleton-metrics">
                <div className="skeleton skeleton-metric" />
                <div className="skeleton skeleton-metric" />
              </div>
              <div className="skeleton skeleton-divider" />
              <div className="skeleton skeleton-price-row" />
            </div>
          </div>
          <div className="skeleton skeleton-button" />
        </article>
      ))}
    </div>
  );
}

export function CatalogInfiniteList({
  initialProducts,
  initialCursor,
  initialHasMore,
  filters,
}: Props) {
  const [products, setProducts] = useState(initialProducts);
  const [nextCursor, setNextCursor] = useState(initialCursor);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const requestRef = useRef<AbortController | null>(null);
  const loadingRef = useRef(false);
  const cursorRef = useRef(initialCursor);
  const hasMoreRef = useRef(initialHasMore);
  const productIdsRef = useRef(new Set(initialProducts.map((product) => product.id)));

  const filterKey = useMemo(
    () =>
      JSON.stringify({
        q: filters.q ?? "",
        location: filters.location ?? "",
        category: filters.category ?? "",
        minPrice: filters.minPrice ?? "",
        maxPrice: filters.maxPrice ?? "",
      }),
    [filters],
  );

  useEffect(() => {
    requestRef.current?.abort();
    requestRef.current = null;
    loadingRef.current = false;

    setProducts(initialProducts);
    setNextCursor(initialCursor);
    setHasMore(initialHasMore);
    setLoading(false);
    setError("");

    cursorRef.current = initialCursor;
    hasMoreRef.current = initialHasMore;
    productIdsRef.current = new Set(initialProducts.map((product) => product.id));
  }, [filterKey, initialProducts, initialCursor, initialHasMore]);

  const loadMore = useCallback(async () => {
    const cursor = cursorRef.current;

    if (loadingRef.current || !hasMoreRef.current || !cursor) return;

    loadingRef.current = true;
    setLoading(true);
    setError("");

    const controller = new AbortController();
    requestRef.current = controller;

    try {
      const params = new URLSearchParams();
      params.set("limit", "12");
      params.set("cursor", cursor);

      if (filters.q) params.set("q", filters.q);
      if (filters.location) params.set("location", filters.location);
      if (filters.category) params.set("category", filters.category);
      if (filters.minPrice !== undefined) params.set("minPrice", String(filters.minPrice));
      if (filters.maxPrice !== undefined) params.set("maxPrice", String(filters.maxPrice));

      const response = await fetch(`/api/products?${params.toString()}`, {
        method: "GET",
        cache: "no-store",
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new Error(t("Could not load more products."));
      }

      const data = (await response.json()) as ProductPageResponse;

      const newProducts = data.products.filter((product) => !productIdsRef.current.has(product.id));
      newProducts.forEach((product) => productIdsRef.current.add(product.id));

      setProducts((current) => (newProducts.length ? [...current, ...newProducts] : current));

      // If the database has no more products, or the API returns no genuinely new
      // products, stop observing the sentinel so we never keep querying an exhausted page.
      const nextHasMore = newProducts.length > 0 && data.hasMore && Boolean(data.nextCursor);

      cursorRef.current = nextHasMore ? data.nextCursor : null;
      hasMoreRef.current = nextHasMore;
      setNextCursor(nextHasMore ? data.nextCursor : null);
      setHasMore(nextHasMore);
    } catch (loadError) {
      if (!(loadError instanceof DOMException && loadError.name === "AbortError")) {
        setError(t("Could not load more products."));
      }
    } finally {
      if (requestRef.current === controller) {
        requestRef.current = null;
      }
      loadingRef.current = false;
      setLoading(false);
    }
  }, [filters, t]);

  useEffect(() => {
    const sentinel = document.getElementById("catalog-load-more-sentinel");
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          void loadMore();
        }
      },
      {
        root: null,
        rootMargin: "600px 0px",
        threshold: 0,
      },
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [loadMore, hasMore, nextCursor]);

  useEffect(() => {
    return () => requestRef.current?.abort();
  }, []);

  return (
    <>
      <div className="shops-grid" aria-live="polite">
        {products.map((product, index) => (
          <ShopCard key={product.id} product={product} priority={index < 3} />
        ))}
      </div>

      {loading && <LoadingCards label={t("Loading more products…")} />}

      <div
        id="catalog-load-more-sentinel"
        className="catalog-load-more-sentinel"
        aria-hidden="true"
      />

      {!loading && error && (
        <div className="catalog-load-more-error" role="status">
          <span>{error}</span>
          <button className="btn" type="button" onClick={() => void loadMore()}>
            {t("Try again")}
          </button>
        </div>
      )}

      {!loading && !error && !hasMore && products.length > 0 && (
        <div className="catalog-end-message" role="status" aria-live="polite">
          <span>{t("You have reached the end of the catalogue.")}</span>
        </div>
      )}
    </>
  );
}
