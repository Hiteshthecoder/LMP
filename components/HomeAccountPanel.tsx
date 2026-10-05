"use client";

import Link from "next/link";
import { useAuth } from "@/components/AuthProvider";

export function HomeAccountPanel() {
  const { user, loading, logout } = useAuth();

  if (loading || !user) return null;

  return (
    <section className="panel user-sidebar-card home-user-card">
      <div className="user-sidebar-identity">
        <div className="user-sidebar-avatar" aria-hidden="true">♟</div>
        <div className="user-sidebar-info">
          <div className="user-sidebar-name">{user.username || user.displayName}</div>
          <div className="user-sidebar-trust"><span>Trust Level:</span><strong>{user.trustLevel}</strong></div>
        </div>
      </div>
      <div className="user-sidebar-actions">
        <Link className="user-sidebar-action" href="/purchases"><span aria-hidden="true">◎</span>My Purchases</Link>
        <button className="user-sidebar-action user-sidebar-logout" type="button" onClick={() => { void logout(); }}><span aria-hidden="true">↪</span>Log out</button>
      </div>
    </section>
  );
}
