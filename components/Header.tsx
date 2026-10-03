"use client";

import Link from "next/link";
import { useAuth } from "@/components/AuthProvider";
import { useLanguage } from "@/components/LanguageProvider";
import type { CategoryOption } from "@/data/products";
import { languages } from "@/lib/i18n";

type Props = {
  categories: CategoryOption[];
};

export function Header({ categories }: Props) {
  const { user, loading, logout } = useAuth();
  const { language, setLanguage, t } = useLanguage();

  return (
    <header className="header">
      <div className="brand-row">
        <Link className="logo" href="/">
          LMP : Le monde parallel
        </Link>

        <div className="rate">1 BTC = $84,779.00</div>
      </div>

      <nav className="nav">
        <div className="menu-wrap">
          <span className="nav-item">{t("CATEGORIES")} 📁</span>

          <div className="dropdown">
            {categories.map((category) => (
              <Link
                key={category.slug}
                href={`/?category=${encodeURIComponent(category.slug)}`}
              >
                {t(category.title)} ({category.productCount})
              </Link>
            ))}
          </div>
        </div>

        <div className="menu-wrap">
          <span className="nav-item">{t("LANGUAGE")} 🌐</span>

          <div className="dropdown language-dropdown">
            {languages.map(({ code, flag, label }) => (
              <button
                className={`language-option ${language === code ? "active" : ""
                  }`}
                key={code}
                onClick={() => setLanguage(code)}
                type="button"
              >
                {flag}&nbsp; {label}
              </button>
            ))}
          </div>
        </div>

        {!loading && !user ? (
          <>
            <Link className="nav-item" href="/login">
              ↪ {t("LOG IN")}
            </Link>

            <Link className="nav-item" href="/register">
              ♙ {t("REGISTER")}
            </Link>
          </>
        ) : !loading && user ? (
          <>
            <Link className="nav-item" href="/purchases">
              {t("MY PURCHASES")} 🛒
            </Link>

            <Link className="nav-item" href="/messages">
              {t("MESSAGES")} 💬
            </Link>

            <Link className="nav-item" href="/help">
              {t("HELP")} ❓
            </Link>

            <Link className="nav-item" href="/balance">
              {t("BALANCE")} 👛
            </Link>

            <button
              className="nav-item nav-button"
              onClick={logout}
              type="button"
            >
              {t("LOG OUT")} ↪
            </button>
          </>
        ) : null}

        <div className="nav-spacer" />
      </nav>
    </header>
  );
}
