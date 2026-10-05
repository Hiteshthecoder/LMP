"use client";

import Link from "next/link";
import { useAuth } from "@/components/AuthProvider";

export function ProductSidebar() {
  const { user, loading, logout } = useAuth();

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
                  <span>Trust Level:</span>
                  <strong>{user.trustLevel}</strong>
                </div>

              </div>
            </div>

            <div className="user-sidebar-actions">
              <Link className="user-sidebar-action" href="/purchases">
                <span aria-hidden="true">◉</span> MY PURCHASES
              </Link>

              <button
                className="user-sidebar-action user-sidebar-logout"
                type="button"
                onClick={() => {
                  void logout();
                }}
              >
                <span aria-hidden="true">↪</span> LOG OUT
              </button>
            </div>
          </section>
        </>
      ) : null}
    </aside>
  );
}
