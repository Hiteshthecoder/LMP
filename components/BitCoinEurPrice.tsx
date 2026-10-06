"use client";

import { useEffect, useState } from "react";
import { eurToBitcoin, formatBitcoin } from "@/lib/bitcoin";
import { formatEur } from "@/lib/utils";

const REFRESH_INTERVAL_MS = 5 * 60 * 1000;

export function BitcoinEurPrice({ eurAmount, quantity }: { eurAmount?: number, quantity?: number }) {
    const [bitcoinPrice, setBitcoinPrice] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let cancelled = false;
        let controller: AbortController | null = null;

        async function loadPrice() {
            controller?.abort();
            controller = new AbortController();

            try {
                const response = await fetch("/api/btcprice", {
                    method: "GET",
                    headers: { Accept: "application/json" },
                    cache: "no-store",
                    signal: controller.signal,
                });

                if (!response.ok) {
                    throw new Error(`Price request failed: ${response.status}`);
                }

                const data = await response.json();
                const price = Number(data);

                if (!cancelled && Number.isFinite(price) && price > 0) {
                    setBitcoinPrice(price);
                }
            } catch (error) {
                if (!cancelled && !(error instanceof DOMException && error.name === "AbortError")) {
                    setBitcoinPrice(null);
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        }

        void loadPrice();

        const intervalId = window.setInterval(() => {
            void loadPrice();
        }, REFRESH_INTERVAL_MS);

        return () => {
            cancelled = true;
            controller?.abort();
            window.clearInterval(intervalId);
        };
    }, [quantity]);

    if (loading) {
        return <span aria-live="polite">Loading…</span>;
    }

    if (!eurAmount) {
        return (
            <span aria-live="polite">
                {bitcoinPrice}
            </span>
        );
    }

    return <span aria-live="polite">
        {formatBitcoin(eurToBitcoin(eurAmount, bitcoinPrice))}
    </span>

}
