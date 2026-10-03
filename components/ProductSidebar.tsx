"use client";

import Link from "next/link";
import { useAuth } from "@/components/AuthProvider";
import { useLanguage } from "@/components/LanguageProvider";
import { formatUsd } from "@/lib/utils";
import type { ProductPageData } from "@/lib/product-page";

export function ProductSidebar({
  product: _product,
  categoryProductCount: _categoryProductCount,
}: {
  product: ProductPageData;
  categoryProductCount: number;
}) {
  const { user, loading, logout } = useAuth();
  const { t } = useLanguage();

  return (
    <aside className="product-sidebar">
      {!loading && user ? (
        <>
          <section className="panel user-sidebar-card">
            <div className="user-sidebar-identity">
              <div className="user-sidebar-avatar">
                {(user.username || user.displayName || "?").slice(0, 1).toUpperCase()}
              </div>

              <div className="user-sidebar-info">
                <div className="user-sidebar-name">{user.username || user.displayName}</div>

                <div className="user-sidebar-trust">
                  <span>{t("Trust level")}</span>
                  <strong>{user.trustLevel}</strong>
                </div>

                <div className="user-sidebar-balance">
                  <span>👛 {t("BALANCE")}:</span>
                  <strong>{formatUsd(user.balance ?? 0)}</strong>
                </div>
              </div>
            </div>

            <div className="user-sidebar-actions">
              <Link className="user-sidebar-action" href="/purchases">
                <span aria-hidden="true">◉</span> {t("MY PURCHASES")}
              </Link>

              <button
                className="user-sidebar-action user-sidebar-logout"
                type="button"
                onClick={() => {
                  void logout();
                }}
              >
                <span aria-hidden="true">↪</span> {t("LOG OUT")}
              </button>
            </div>
          </section>

          <section className="panel balance-sidebar-card">
            <div className="balance-sidebar-label">👛 {t("BALANCE")}</div>
            <div className="balance-sidebar-value">{formatUsd(user.balance ?? 0)}</div>
            <a className="balance-sidebar-button" href="/balance">
              ₿ &nbsp; {t("Top up deposit")}
            </a>
          </section>
        </>
      ) : null}
    </aside>
  );
}
