"use client";

import Link from "next/link";

import {
  ProtectedPage,
} from "@/components/ProtectedPage";

import {
  Breadcrumb,
} from "@/components/Breadcrumb";

import { t } from "@/lib/text";

function ProfileActions() {
  const links = [
    ["Home", "/"],
    ["My Purchases", "/purchases"],
  ];

  return (
    <aside className="profile-actions panel">
      <div className="profile-actions-title">
        ♙ PROFILE ACTIONS
      </div>

      <nav aria-label="Profile actions">
        {links.map(
          ([label, href]) => (
            <Link
              href={href}
              key={label}
            >
              {label}
            </Link>
          ),
        )}
      </nav>
    </aside>
  );
}

export default function PurchasesPage() {
  return (
    <ProtectedPage titleKey="MY PURCHASES">
      <Breadcrumb
        items={[
          "My Profile",
          "My Purchases",
        ]}
      />

      <div className="purchases-layout">
        <ProfileActions />

        <section className="purchases-main">
          <div className="purchases-title">
            ▣ {t("MY PURCHASES")}
          </div>

          <div className="purchases-empty panel">
            <div>
              {t("NO ORDERS FOUND")}
            </div>
          </div>
        </section>
      </div>
    </ProtectedPage>
  );
}