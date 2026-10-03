"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ProtectedPage } from "@/components/ProtectedPage";
import { useAuth } from "@/components/AuthProvider";
import { useLanguage } from "@/components/LanguageProvider";
import { formatBitcoin, usdToBitcoin } from "@/lib/bitcoin";
import { formatUsd } from "@/lib/utils";

const BALANCE_STYLES = `
.balance-page {
  min-width: 0;
}

.balance-breadcrumb {
  margin-bottom: 76px;
}

.balance-breadcrumb-home {
  display: inline-grid;
  place-items: center;
  width: 28px;
  height: 28px;
  border: 1px solid #58737d;
  border-radius: 4px;
  font-size: 22px;
}

.balance-breadcrumb-link {
  font-weight: 900;
}

.balance-layout {
  display: grid;
  grid-template-columns: 290px minmax(0, 1fr);
  gap: 18px;
  align-items: start;
  max-width: 1320px;
  margin: 0 auto;
}

.balance-profile-sidebar {
  min-width: 0;
}

.balance-actions-card {
  padding: 9px;
}

.balance-actions-title {
  min-height: 38px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 9px;
  border-radius: 6px;
  background: #0b6287;
  font-size: 14px;
  font-weight: 900;
}

.balance-actions-nav {
  display: grid;
  padding: 8px 4px 2px;
}

.balance-actions-nav a {
  min-height: 31px;
  display: flex;
  align-items: center;
  border-bottom: 1px solid #a5bbc2;
  padding: 0 7px;
  font-size: 13px;
  font-weight: 700;
}

.balance-actions-nav a:hover,
.balance-actions-nav a.active {
  color: #fff;
  background: rgba(255, 255, 255, .04);
}

.balance-main-content {
  width: min(770px, 100%);
  margin: 0 auto;
  min-width: 0;
}

.balance-summary-card {
  min-height: 133px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  border-radius: 18px;
  padding: 23px 27px;
  background: linear-gradient(110deg, #0d6c9b 0%, #159da9 100%);
}

.balance-summary-label {
  font-size: 14px;
  font-weight: 900;
  letter-spacing: .3px;
}

.balance-summary-value {
  margin-top: 2px;
  font-size: 42px;
  line-height: 1;
  font-weight: 900;
}

.balance-summary-btc {
  margin-top: 8px;
  color: #d3edf1;
  font-size: 13px;
}

.balance-summary-icon {
  width: 58px;
  height: 58px;
  display: grid;
  place-items: center;
  border: 4px solid rgba(255,255,255,.35);
  border-radius: 50%;
  color: rgba(255,255,255,.42);
  font-size: 34px;
  font-weight: 900;
}

.balance-mode-switch {
  display: grid;
  grid-template-columns: 1fr 1fr;
  align-items: center;
  gap: 0;
  margin: 20px 0 18px;
}

.balance-mode-switch button {
  min-height: 43px;
  border: 0;
  border-radius: 8px;
  background: transparent;
  color: #d6e4e8;
  font-size: 14px;
  font-weight: 900;
  cursor: pointer;
}

.balance-mode-switch button.active {
  background: #147ca8;
  color: #fff;
  box-shadow: 0 4px 10px rgba(0,0,0,.16);
}

.balance-form-panel {
  width: min(515px, 100%);
  margin: 0 auto;
}

.balance-form-heading {
  text-align: center;
  margin-bottom: 10px;
  font-size: 14px;
  font-weight: 900;
}

.balance-presets {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 10px;
}

.balance-presets button {
  min-width: 57px;
  min-height: 35px;
  border: 1px solid #27586a;
  border-radius: 18px;
  background: #102e38;
  color: #fff;
  padding: 5px 12px;
  font-size: 13px;
  font-weight: 900;
  cursor: pointer;
}

.balance-presets button:hover,
.balance-presets button.active {
  border-color: #1683ad;
  background: #123f4f;
}

.balance-amount-row {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  align-items: center;
  gap: 10px;
}

.balance-amount-row input {
  width: 100%;
  height: 50px;
  border: 1px solid #27586a;
  border-radius: 13px;
  background: #102e38;
  color: #fff;
  padding: 0 15px;
  outline: none;
  font-size: 16px;
}

.balance-amount-row input:focus {
  border-color: #3b8ca8;
}

.balance-amount-row strong {
  font-size: 13px;
}

.balance-btc-preview {
  min-height: 79px;
  display: grid;
  place-items: center;
  margin-top: 14px;
  border-radius: 13px;
  background: #123d4e;
  text-align: center;
  padding: 11px;
}

.balance-btc-preview span {
  color: #c7d9de;
  font-size: 13px;
}

.balance-btc-preview strong {
  color: #32e681;
  font-size: 24px;
  font-weight: 900;
}

.balance-primary-button {
  width: 100%;
  min-height: 50px;
  margin-top: 14px;
  border: 0;
  border-radius: 12px;
  background: #0e78aa;
  color: #fff;
  font-size: 15px;
  font-weight: 900;
  cursor: pointer;
}

.balance-primary-button:hover {
  background: #0b86bd;
}

@media (max-width: 800px) {
  .balance-breadcrumb {
    margin-bottom: 30px;
  }

  .balance-layout {
    grid-template-columns: 1fr;
  }

  .balance-main-content {
    width: 100%;
  }
}

@media (max-width: 560px) {
  .balance-summary-card {
    padding: 19px;
  }

  .balance-summary-value {
    font-size: 34px;
  }

  .balance-summary-icon {
    width: 48px;
    height: 48px;
    font-size: 27px;
  }

  .balance-mode-switch {
    grid-template-columns: 1fr;
  }
}
`;

export function BalancePageClient({
    bitcoinUsdPrice,
}: {
    bitcoinUsdPrice: number | null;
}) {
    const { user } = useAuth();
    const { t } = useLanguage();

    const [activeMode, setActiveMode] = useState<"topup" | "withdraw">(
        "topup",
    );

    const [amount, setAmount] = useState("50");

    const numericAmount = Number(amount) || 0;

    const bitcoinAmount = useMemo(
        () => usdToBitcoin(numericAmount, bitcoinUsdPrice),
        [numericAmount, bitcoinUsdPrice],
    );

    const balance = Number(user?.balance ?? 0);

    const balanceBitcoin = usdToBitcoin(
        balance,
        bitcoinUsdPrice,
    );

    return (
        <ProtectedPage titleKey="BALANCE">
            <style
                dangerouslySetInnerHTML={{
                    __html: BALANCE_STYLES,
                }}
            />

            <div className="balance-page">
                <div className="breadcrumb balance-breadcrumb">
                    <Link
                        href="/"
                        className="balance-breadcrumb-home"
                        aria-label={t("Home")}
                    >
                        ⌂
                    </Link>

                    <span>›</span>

                    <Link
                        href="/"
                        className="balance-breadcrumb-link"
                    >
                        {t("My Profile")}
                    </Link>

                    <span>›</span>

                    <strong>{t("BALANCE")}</strong>
                </div>

                <div className="balance-layout">
                    <aside className="balance-profile-sidebar">
                        <section className="panel balance-actions-card">
                            <div className="balance-actions-title">
                                <span aria-hidden="true">♙</span>
                                {t("PROFILE ACTIONS")}
                            </div>

                            <nav
                                className="balance-actions-nav"
                                aria-label={t("Profile actions")}
                            >
                                <Link href="/">
                                    {t("Home")}
                                </Link>

                                <Link
                                    href="/balance"
                                    className="active"
                                >
                                    {t("Balance")}
                                </Link>

                                <Link href="/purchases">
                                    {t("My Purchases")}
                                </Link>

                                <Link href="/messages">
                                    {t("Messages")}
                                </Link>

                                <Link href="/help">
                                    {t("Help")}
                                </Link>
                            </nav>
                        </section>
                    </aside>

                    <section className="balance-main-content">
                        <div className="balance-summary-card">
                            <div>
                                <div className="balance-summary-label">
                                    {t("YOUR BALANCE")}
                                </div>

                                <div className="balance-summary-value">
                                    {formatUsd(balance)}
                                </div>

                                <div className="balance-summary-btc">
                                    ≈ {formatBitcoin(balanceBitcoin)} BTC

                                    {bitcoinUsdPrice
                                        ? ` · 1 BTC = $${bitcoinUsdPrice.toLocaleString(
                                            "en-US",
                                            {
                                                maximumFractionDigits: 0,
                                            },
                                        )}`
                                        : ""}
                                </div>
                            </div>

                            <div
                                className="balance-summary-icon"
                                aria-hidden="true"
                            >
                                $
                            </div>
                        </div>

                        <div className="balance-mode-switch">
                            <button
                                type="button"
                                className={
                                    activeMode === "topup"
                                        ? "active"
                                        : ""
                                }
                                onClick={() =>
                                    setActiveMode("topup")
                                }
                            >
                                ↓ {t("Top Up with Bitcoin (BTC)")}
                            </button>

                            <button
                                type="button"
                                className={
                                    activeMode === "withdraw"
                                        ? "active"
                                        : ""
                                }
                                onClick={() =>
                                    setActiveMode("withdraw")
                                }
                            >
                                ↑ {t("Withdraw Funds")}
                            </button>
                        </div>

                        <div className="balance-form-panel">
                            <div className="balance-form-heading">
                                {activeMode === "topup"
                                    ? t("Enter amount in USD:")
                                    : t(
                                        "Enter withdrawal amount in USD:",
                                    )}
                            </div>

                            <div
                                className="balance-presets"
                                aria-label={t("Amount presets")}
                            >
                                {[25, 50, 100, 250, 500].map(
                                    (value) => (
                                        <button
                                            key={value}
                                            type="button"
                                            onClick={() =>
                                                setAmount(String(value))
                                            }
                                            className={
                                                numericAmount === value
                                                    ? "active"
                                                    : ""
                                            }
                                        >
                                            ${value}
                                        </button>
                                    ),
                                )}
                            </div>

                            <div className="balance-amount-row">
                                <input
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={amount}
                                    onChange={(event) =>
                                        setAmount(event.target.value)
                                    }
                                    aria-label={t("Amount in USD")}
                                />

                                <strong>USD</strong>
                            </div>

                            <div className="balance-btc-preview">
                                <span>
                                    {activeMode === "topup"
                                        ? t("You will need to send:")
                                        : t("You will withdraw:")}
                                </span>

                                <strong>
                                    ~{formatBitcoin(bitcoinAmount)} BTC
                                </strong>
                            </div>

                            <button
                                type="button"
                                className="balance-primary-button"
                            >
                                {activeMode === "topup"
                                    ? t("GENERATE BTC ADDRESS")
                                    : t("REQUEST WITHDRAWAL")}
                            </button>
                        </div>
                    </section>
                </div>
            </div>
        </ProtectedPage>
    );
}