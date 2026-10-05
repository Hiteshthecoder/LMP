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

  useEffect(() => {
    if (!loading && user) router.replace("/");
  }, [loading, user, router]);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError("");

    try {
      const result = await login(usernameOrEmail, password);
      if (result) {
        setError(result);
        return;
      }
      router.replace("/");
    } finally {
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
          <p>{t("Please login to access the catalogue.")}</p>
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

          <button className="btn btn-yellow" disabled={busy}>
            {busy ? t("Logging in…") : t("Login")}
          </button>
          <p>
            {t("If you do not have an account,")} <Link href="/register"><b>{t("register")}</b></Link>.
          </p>
        </form>
      </div>
    </main>
  );
}
