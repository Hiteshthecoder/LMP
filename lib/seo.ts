import type { Metadata } from "next";

export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, "");
export const SITE_NAME = "LMP : Le Monde Parallel";
export const SITE_DESCRIPTION =
  "LMP : Le Monde Parallel Global Marketplace For discovering and purchasing Quality Guns, Drugs and firearms";
export const DEFAULT_OG_IMAGE = "/spider_web.jpg";

export function absoluteUrl(pathOrUrl: string) {
  try {
    return new URL(pathOrUrl, `${SITE_URL}/`).toString();
  } catch {
    return pathOrUrl;
  }
}

export function productPath(idOrSlug: string) {
  return `/products/${encodeURIComponent(idOrSlug)}`;
}

export function categoryPath(slug: string) {
  return `/categories/${encodeURIComponent(slug)}`;
}

export function trimDescription(value: string | undefined, fallback: string) {
  const text = value?.replace(/\s+/g, " ").trim();
  if (!text) return fallback;
  return text.length > 160 ? `${text.slice(0, 157).trimEnd()}...` : text;
}

export function noIndexMetadata(title: string, description: string): Metadata {
  return {
    title,
    description,
    robots: {
      index: false,
      follow: false,
      googleBot: { index: false, follow: false },
    },
  };
}
