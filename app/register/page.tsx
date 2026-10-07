"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import { Breadcrumb } from "@/components/Breadcrumb";
import { t } from "@/lib/text";

export default function RegisterPage() {
  const { register, user, loading } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({
    displayName: "",
    username: "",
    email: "",
    password: "",
    repeat: "",
  });
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

    setError("");

    if (form.password !== form.repeat) {
      setError(t("Passwords do not match."));
      return;
    }

    setBusy(true);

    try {
      const result = await register({
        displayName: form.displayName,
        username: form.username,
        email: form.email,
        password: form.password,
      });

      if (result) {
        setError(result);
        setBusy(false);
        return;
      }

      setRedirecting(true);
      router.replace("/");
    } catch {
      setError(t("Unable to register right now."));
      setBusy(false);
    }
  }

  return (
    <main className="page-shell">
      <Breadcrumb items={["Register"]} />
      <div className="auth-wrap">
        <form className="auth-card" onSubmit={submit}>
          <h1>{t("Register")}</h1>
          {error && <div className="form-error">{error}</div>}

          <label>{t("DISPLAY NAME")}</label>
          <input
            className="input"
            value={form.displayName}
            onChange={(e) => setForm({ ...form, displayName: e.target.value })}
            placeholder={t("Your display name")}
            required
          />

          <label>{t("USERNAME")}</label>
          <input
            className="input"
            value={form.username}
            onChange={(e) => setForm({ ...form, username: e.target.value })}
            placeholder={t("3-32 characters")}
            autoComplete="username"
            required
          />

          <label>{t("EMAIL")}</label>
          <input
            className="input"
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            placeholder={t("Your email address")}
            autoComplete="email"
            required
          />

          <label>{t("PASSWORD")}</label>
          <input
            className="input"
            type="password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            placeholder={t("At least 8 characters")}
            autoComplete="new-password"
            required
          />

          <label>{t("REPEAT PASSWORD")}</label>
          <input
            className="input"
            type="password"
            value={form.repeat}
            onChange={(e) => setForm({ ...form, repeat: e.target.value })}
            placeholder={t("Repeat password")}
            autoComplete="new-password"
            required
          />

          <button className="btn btn-yellow" disabled={busy || redirecting} aria-busy={busy || redirecting}>
            {redirecting ? t("Redirecting…") : busy ? t("Creating account…") : t("Register")}
          </button>
          <p>
            {t("Already have an account?")} <Link href="/login"><b>{t("login")}</b></Link>.
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
