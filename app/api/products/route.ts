import { NextResponse } from "next/server";
import { getProductsPage } from "@/lib/catalog";

export const runtime = "nodejs";

function optionalNumber(value: string | null) {
  if (!value) return undefined;
  const number = Number(value);
  return Number.isFinite(number) ? number : undefined;
}

export async function GET(request: Request) {
  const url = new URL(request.url);

  const page = await getProductsPage({
    q: url.searchParams.get("q")?.trim() || undefined,
    category: url.searchParams.get("category")?.trim() || undefined,
    location: url.searchParams.get("location")?.trim() || undefined,
    minPrice: optionalNumber(url.searchParams.get("minPrice")),
    maxPrice: optionalNumber(url.searchParams.get("maxPrice")),
    cursor: url.searchParams.get("cursor") || undefined,
    limit: Math.min(Number(url.searchParams.get("limit") || 12), 24),
  });

  return NextResponse.json(page, {
    headers: {
      "Cache-Control": "private, no-store",
    },
  });
}
