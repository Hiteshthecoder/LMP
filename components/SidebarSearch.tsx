"use client";

import { FormEvent, useState, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { CategoryOption } from "@/data/products";
import { t } from "@/lib/text";

const locations = ["Europe", "North And South America ", "North America", "South America", "Ukraine", "Mexico", "Asia", "France"];

export function SidebarSearch({
  categories,
}: {
  categories: CategoryOption[];
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [q, setQ] = useState(searchParams.get("q") ?? "");
  const [location, setLocation] = useState(searchParams.get("location") ?? "");
  const [category, setCategory] = useState(searchParams.get("category") ?? "");
  const [minPrice, setMinPrice] = useState(searchParams.get("minPrice") ?? "");
  const [maxPrice, setMaxPrice] = useState(searchParams.get("maxPrice") ?? "");
  const [isPending, startTransition] = useTransition();

  function submit(event: FormEvent) {
    event.preventDefault();

    const params = new URLSearchParams();

    if (q.trim()) params.set("q", q.trim());
    if (location) params.set("location", location);
    if (category) params.set("category", category);
    if (minPrice) params.set("minPrice", minPrice);
    if (maxPrice) params.set("maxPrice", maxPrice);

    const query = params.toString();

    startTransition(() => {
      router.replace(query ? `${pathname}?${query}` : pathname, {
        scroll: false,
      });
    });
  }

  function clearSearch() {
    setQ("");
    setLocation("");
    setCategory("");
    setMinPrice("");
    setMaxPrice("");

    startTransition(() => router.replace(pathname, { scroll: false }));
  }

  return (
    <form className="panel" onSubmit={submit}>
      <div className="panel-title">{t("⌕ QUICK SEARCH")}</div>

      <label className="search-label">{t("Search by name:")}</label>

      <input
        className="input"
        value={q}
        onChange={(event) => setQ(event.target.value)}
        placeholder={t("What are you looking for?")}
        autoComplete="off"
      />

      <label className="search-label">{t("Location:")}</label>

      <select
        className="select"
        value={location}
        onChange={(event) => setLocation(event.target.value)}
      >
        <option value="">{t("Select location")}</option>

        {locations.map((item) => (
          <option key={item} value={item}>
            {t(item)}
          </option>
        ))}
      </select>

      <label className="search-label">{t("Category:")}</label>

      <select
        className="select"
        value={category}
        onChange={(event) => setCategory(event.target.value)}
      >
        <option value="">{t("Select category")}</option>

        {categories.map((item) => (
          <option key={item.slug} value={item.slug}>
            {t(item.title)}
          </option>
        ))}
      </select>

      <label className="search-label">{t("Price range:")}</label>

      <div className="range">
        <input
          className="input"
          type="number"
          min="0"
          value={minPrice}
          onChange={(event) => setMinPrice(event.target.value)}
          placeholder={t("from")}
        />
        <span>EUR</span>

        <input
          className="input"
          type="number"
          min="0"
          value={maxPrice}
          onChange={(event) => setMaxPrice(event.target.value)}
          placeholder={t("to")}
        />
        <span>EUR</span>
      </div>

      <div className="search-actions">
        <button className="btn" type="submit" disabled={isPending}>
          {isPending ? `${t("Search")}…` : t("Search")}
        </button>

        {(q || location || category || minPrice || maxPrice) && (
          <button
            className="clear-search"
            type="button"
            onClick={clearSearch}
            disabled={isPending}
            aria-label={t("Clear search")}
          >
            ×
          </button>
        )}
      </div>
    </form>
  );
}
