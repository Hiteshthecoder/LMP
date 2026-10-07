"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import { Breadcrumb } from "@/components/Breadcrumb";
import { t } from "@/lib/text";

export default function LoginPage() {
  const { login, user, loading } = useAuth();
  const router = useRouter();
  const [usernameOrEmail, setUsernameOrEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [redirecting, setRedirecting] = useState(false);

  useEffect(() => {
    router.prefetch("/");
  }, [router]);

  useEffect(() => {
    if (!loading && user) router.replace("/");
  }, [loading, user, router]);

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (busy || redirecting) return;

    setBusy(true);
    setError("");

    try {
      const result = await login(usernameOrEmail, password);
      if (result) {
        setError(result);
        setBusy(false);
        return;
      }

      // Keep the loading UI visible until the home-page navigation starts.
      // The home route was prefetched above, so this transition is usually
      // faster than waiting for the first navigation request to begin.
      setRedirecting(true);
      router.replace("/");
    } catch {
      setError(t("Unable to log in right now."));
      setBusy(false);
    }
  }

  return (
    <main className="page-shell">
      <Breadcrumb items={["Login"]} />
      <div className="auth-wrap">
        <form className="auth-card" onSubmit={submit}>
          <div style={{ textAlign: "center", fontSize: 38 }}>🔐</div>
          <h1>{t("Login")}</h1>
          {error && <div className="form-error">{error}</div>}
          <label>{t("USERNAME OR EMAIL")}</label>
          <input
            className="input"
            value={usernameOrEmail}
            onChange={(e) => setUsernameOrEmail(e.target.value)}
            placeholder={t("Your username or email")}
            autoComplete="username"
            required
          />

          <label>{t("PASSWORD")}</label>
          <input
            className="input"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={t("Your password")}
            autoComplete="current-password"
            required
          />

          <button className="btn btn-yellow" disabled={busy || redirecting} aria-busy={busy || redirecting}>
            {redirecting ? t("Redirecting…") : busy ? t("Logging in…") : t("Login")}
          </button>
          <p>
            {t("If you do not have an account,")} <Link href="/register"><b>{t("register")}</b></Link>.
          </p>
        </form>
        {redirecting && (
          <div className="auth-loading-overlay" role="status" aria-live="polite" aria-busy="true">
            <div className="auth-loading-card">
              <span className="auth-loading-spinner" aria-hidden="true" />
              <strong>{t("Redirecting…")}</strong>
              <span>{t("Loading your homepage")}</span>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
