"use client";

import Link from "next/link";
import { useAuth } from "@/components/AuthProvider";
import { t } from "@/lib/text";

export function ProtectedPage({ titleKey, children }: { titleKey: string; children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const title = t(titleKey);

  if (loading) {
    return (
      <main className="page-shell">
        <div className="content-card">
          {t("Checking authentication…")}
        </div>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="page-shell">
        <div className="content-card">
          <h1>{title}</h1>
          <p>{t("Please log in to continue.")}</p>
          <Link className="btn" href="/login">{t("LOG IN")}</Link>
        </div>
      </main>
    );
  }

  return <main className="page-shell">{children}</main>;
}
