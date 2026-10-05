"use client";

import Link from "next/link";
import { t } from "@/lib/text";

export function Breadcrumb({ items = [] }: { items?: string[] }) {

  return (
    <div className="breadcrumb">
      <Link href="/" className="home-icon">
        ⌂
      </Link>

      <span>›</span>

      <Link href="/">{t("Home")}</Link>

      {items.map((item, index) => (
        <span
          key={`${item}-${index}`}
          style={{ display: "contents" }}
        >
          <span>›</span>
          <span>{t(item)}</span>
        </span>
      ))}
    </div>
  );
}
