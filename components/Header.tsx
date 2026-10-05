"use client";

import Link from "next/link";
import { useAuth } from "@/components/AuthProvider";
import type { CategoryOption } from "@/data/products";

type Props = {
  categories: CategoryOption[];
};

export function Header({ categories }: Props) {
  const { user, loading, logout } = useAuth();

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
          <span className="nav-item">CATEGORIES 📁</span>

          <div className="dropdown">
            {categories.map((category) => (
              <Link
                key={category.slug}
                href={`/?category=${encodeURIComponent(category.slug)}`}
              >
                {category.title} ({category.productCount})
              </Link>
            ))}
          </div>
        </div>

        {!loading && !user ? (
          <>
            <Link className="nav-item" href="/login">
              ↪ LOG IN
            </Link>

            <Link className="nav-item" href="/register">
              ♙ REGISTER
            </Link>
          </>
        ) : !loading && user ? (
          <>
            <Link className="nav-item" href="/purchases">
              MY PURCHASES 🛒
            </Link>

            <Link className="nav-item" href="/messages">
              MESSAGES 💬
            </Link>

            <Link className="nav-item" href="/help">
              HELP ❓
            </Link>

            <button
              className="nav-item nav-button"
              onClick={logout}
              type="button"
            >
              LOG OUT ↪
            </button>
          </>
        ) : null}

        <div className="nav-spacer" />
      </nav>
    </header>
  );
}
