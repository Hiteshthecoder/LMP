"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Breadcrumb } from "@/components/Breadcrumb";
import { useAuth } from "@/components/AuthProvider";
import { useLanguage } from "@/components/LanguageProvider";
import { formatUsd } from "@/lib/utils";
import { formatBitcoin, usdToBitcoin } from "@/lib/bitcoin";
import type { ProductPageData } from "@/lib/product-page";

type ShippingAddress = {
  label: string;
  recipientName: string;
  country: string;
  region: string;
  city: string;
  postalCode: string;
  addressLine1: string;
  addressLine2: string;
};

type ParcelLocker = {
  label: string;
  recipientName: string;
  country: string;
  network: string;
  city: string;
  postalCode: string;
  lockerId: string;
  address: string;
};

const countries = [
  "Austria",
  "Belgium",
  "Croatia",
  "Czech Republic",
  "Estonia",
  "Finland",
  "France",
  "Germany",
  "Italy",
  "Latvia",
  "Lithuania",
  "Netherlands",
  "Norway",
  "Poland",
  "Portugal",
  "Slovakia",
  "Slovenia",
  "Spain",
  "Sweden",
];

const lockerNetworks: Record<string, string[]> = {
  Austria: ["Post24", "myflexbox"],
  Belgium: ["bpost", "Mondial Relay"],
  Croatia: ["BOX NOW", "Hrvatska pošta"],
  "Czech Republic": ["Z-BOX", "AlzaBox"],
  Estonia: ["Omniva", "DPD Pickup"],
  Finland: ["Posti", "Matkahuolto"],
  France: ["Mondial Relay", "Chronopost Pickup"],
  Germany: ["DHL Packstation", "Hermes PaketShop"],
  Italy: ["InPost", "Poste Italiane"],
  Latvia: ["Omniva", "DPD Pickup"],
  Lithuania: ["Omniva", "DPD Pickup"],
  Netherlands: ["PostNL", "DHL ServicePoint"],
  Norway: ["Posten", "PostNord"],
  Poland: ["InPost Paczkomat", "DPD Pickup"],
  Portugal: ["Locky", "DPD Pickup"],
  Slovakia: ["Packeta Z-BOX", "AlzaBox"],
  Slovenia: ["Pošta Slovenije", "DPD Pickup"],
  Spain: ["InPost", "Correos"],
  Sweden: ["PostNord", "DHL ServicePoint"],
};

const emptyShippingAddress: ShippingAddress = {
  label: "",
  recipientName: "",
  country: "",
  region: "",
  city: "",
  postalCode: "",
  addressLine1: "",
  addressLine2: "",
};

const emptyParcelLocker: ParcelLocker = {
  label: "",
  recipientName: "",
  country: "",
  network: "",
  city: "",
  postalCode: "",
  lockerId: "",
  address: "",
};

export function PurchasePage({
  product,
  bitcoinUsdPrice,
}: {
  product: ProductPageData;
  bitcoinUsdPrice: number | null;
}) {
  const router = useRouter();
  const { user, loading } = useAuth();
  const { t } = useLanguage();

  const [safeDeal, setSafeDeal] = useState(false);
  const [deliveryMethod, setDeliveryMethod] = useState<"mail" | "locker">("mail");
  const [comment, setComment] = useState("");
  const [pin, setPin] = useState("");
  const [shippingAddress, setShippingAddress] = useState<ShippingAddress>(emptyShippingAddress);
  const [parcelLocker, setParcelLocker] = useState<ParcelLocker>(emptyParcelLocker);
  const [saveShippingAddress, setSaveShippingAddress] = useState(false);
  const [saveParcelLocker, setSaveParcelLocker] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.replace(`/login?next=${encodeURIComponent(`/purchase?product=${product.id}`)}`);
    }
  }, [loading, user, router, product.id]);

  const unitPrice = Number(product.price) || 0;
  const quantity = 1;
  const subtotal = unitPrice * quantity;
  const safeDealFee = safeDeal ? subtotal * 0.04 : 0;
  const total = subtotal + safeDealFee;
  const balance = Number(user?.balance ?? 0);
  const balanceBitcoin = usdToBitcoin(balance, bitcoinUsdPrice);
  const hasEnoughBalance = balance >= total;

  const rating = useMemo(
    () => Math.max(0, Math.min(5, Math.round(product.rating))),
    [product.rating]
  );

  const updateShipping = <K extends keyof ShippingAddress>(key: K, value: ShippingAddress[K]) => {
    setShippingAddress((current) => ({ ...current, [key]: value }));
  };

  const updateLocker = <K extends keyof ParcelLocker>(key: K, value: ParcelLocker[K]) => {
    setParcelLocker((current) => ({ ...current, [key]: value }));
  };

  const networks = parcelLocker.country ? lockerNetworks[parcelLocker.country] ?? [] : [];

  if (loading || !user) {
    return (
      <main className="page-shell purchase-page-shell">
        <div className="purchase-loading panel">{t("loadingAuthentication")}</div>
      </main>
    );
  }

  return (
    <main className="page-shell purchase-page-shell">
      <Breadcrumb items={["Create Order", product.name]} />

      <div className="purchase-layout">
        <aside className="purchase-sidebar">
          <section className="panel purchase-balance-card">
            <div className="purchase-balance-title">👛 {t("balance")}</div>
            <div className="purchase-balance-value">{formatUsd(balance)}</div>
            <div className="purchase-balance-btc">≈ {formatBitcoin(balanceBitcoin)} BTC</div>
            <a className="purchase-topup-button" href="/balance">₿ &nbsp; {t("topUpDeposit")}</a>
          </section>

          <section className="panel purchase-store-card">
            <div className="purchase-store-title">♙ {t("ABOUT STORE")}</div>
            <div className="purchase-store-identity">
              <div className="purchase-store-avatar">{(product.vendorName || "L").slice(0, 1).toUpperCase()}</div>
              <div>
                <strong>{product.vendorName || "LMP"}</strong>
              </div>
            </div>
            <div className="purchase-store-metrics">
              <div><strong>{product.deals}</strong><span>{t("DEALS")}</span></div>
              <div><strong className="stars">★ {Math.round(product.rating * 20)}%</strong><span>{t("RATING")}</span></div>
              <div><strong>{product.reviews}</strong><span>{t("REVIEWS")}</span></div>
              <div><strong>1</strong><span>{t("PRODUCTS")}</span></div>
              <div><strong>{product.deals}</strong><span>{t("SOLD")}</span></div>
              <div><strong>{product.disputes}</strong><span>{t("DISPUTES")}</span></div>
            </div>
            <a className="purchase-store-back" href={`/products/${product.id}`}>{t("Back to store")}</a>
          </section>
        </aside>

        <section className="purchase-main">
          <div className="purchase-title">🛒 {t("purchaseItem")}</div>

          <section className="purchase-summary-grid">
            <div className="purchase-product-card">
              <Image
                src={product.image}
                alt={product.name}
                className="purchase-product-image"
                width={160}
                height={166}
                sizes="(max-width: 560px) 260px, (max-width: 800px) 125px, 160px"
              />
              <div className="purchase-product-info">
                <h1>{product.name}</h1>
                <div className="purchase-product-facts">
                  <span><b>{t("category").toUpperCase()}</b> {product.category.replace(/[-_]/g, " ")}</span>
                  <span><b>{t("sold").toUpperCase()}</b> {product.deals} pcs</span>
                  <span><b>{t("rating").toUpperCase()}</b> <strong className="purchase-rating">{rating * 20}%</strong></span>
                </div>

              </div>
            </div>

            <div className="purchase-confirm-card">
              <h2>{t("confirmOrder")}</h2>
              <div className="purchase-line"><span>{t("unitSalePrice")}</span><strong>{formatUsd(unitPrice)}</strong></div>
              <div className="purchase-line purchase-quantity-row">
                <span>{t("quantity")}</span>
                <strong>{quantity} pcs</strong>
              </div>
              <div className="purchase-line"><span>{t("orderTotal")}</span><strong>{formatUsd(subtotal)}</strong></div>
              <div className="purchase-payment-options">
                <button type="button" className="purchase-payment-option active">💳 {t("escrow")}</button>
                <label className="purchase-payment-option purchase-safe-deal">
                  <input type="checkbox" checked={safeDeal} onChange={(event) => setSafeDeal(event.target.checked)} />
                  🔒 {t("safeDeal")} (+4%)
                </label>
              </div>
              <p className="purchase-safe-description">{t("safeDealDescription")}</p>
              <div className="purchase-total-line"><span>{t("total")}</span><strong>{formatUsd(total)}</strong></div>
            </div>
          </section>

          <section className="purchase-delivery-card">
            <h2>📦 {t("delivery")}</h2>
            <label className="purchase-field-label">{t("Delivery method:")}</label>

            <label className="purchase-radio">
              <input type="radio" name="delivery" value="mail" checked={deliveryMethod === "mail"} onChange={() => setDeliveryMethod("mail")} />
              <span>📮 {t("Mail delivery")}</span>
            </label>

            <label className="purchase-radio">
              <input type="radio" name="delivery" value="locker" checked={deliveryMethod === "locker"} onChange={() => setDeliveryMethod("locker")} />
              <span>📦 {t("Parcel locker")}</span>
            </label>

            <div className="purchase-pgp-warning">
              <span aria-hidden="true">⚠️</span>{" "}
              {t("You have no PGP key. Tracking number will not be encrypted.")}{" "}
              <a className="purchase-encryption-link" href="/help#encryption-key">
                {t("Add encryption key")}
              </a>
            </div>

            {deliveryMethod === "mail" ? (
              <div className="purchase-delivery-form">
                <h3 className="purchase-subheading">📮 {t("Shipping Address")}</h3>

                <div className="purchase-form-field">
                  <label htmlFor="address-label">{t("Address Label (optional)")}</label>
                  <input id="address-label" value={shippingAddress.label} onChange={(event) => updateShipping("label", event.target.value)} placeholder={t("Home, Work, etc.")} />
                </div>

                <div className="purchase-form-field">
                  <label htmlFor="recipient-name">{t("Recipient Name")} <span className="required-marker">*</span></label>
                  <input id="recipient-name" required value={shippingAddress.recipientName} onChange={(event) => updateShipping("recipientName", event.target.value)} placeholder={t("Full name")} />
                </div>

                <div className="purchase-form-field">
                  <label htmlFor="shipping-country">{t("Country")} <span className="required-marker">*</span></label>
                  <input id="shipping-country" required value={shippingAddress.country} onChange={(event) => updateShipping("country", event.target.value)} placeholder={t("Country")} />
                </div>

                <div className="purchase-form-field">
                  <label htmlFor="shipping-region">{t("Region / State (optional)")}</label>
                  <input id="shipping-region" value={shippingAddress.region} onChange={(event) => updateShipping("region", event.target.value)} placeholder={t("Region or State")} />
                </div>

                <div className="purchase-form-field">
                  <label htmlFor="shipping-city">{t("City")} <span className="required-marker">*</span></label>
                  <input id="shipping-city" required value={shippingAddress.city} onChange={(event) => updateShipping("city", event.target.value)} placeholder={t("City")} />
                </div>

                <div className="purchase-form-field">
                  <label htmlFor="shipping-postal">{t("Postal Code")} <span className="required-marker">*</span></label>
                  <input id="shipping-postal" required value={shippingAddress.postalCode} onChange={(event) => updateShipping("postalCode", event.target.value)} placeholder={t("Postal / ZIP code")} />
                </div>

                <div className="purchase-form-field">
                  <label htmlFor="shipping-address1">{t("Address Line 1")} <span className="required-marker">*</span> {t("(Street, house number)")}</label>
                  <input id="shipping-address1" required value={shippingAddress.addressLine1} onChange={(event) => updateShipping("addressLine1", event.target.value)} placeholder={t("Street address")} />
                </div>

                <div className="purchase-form-field">
                  <label htmlFor="shipping-address2">{t("Address Line 2 (Apartment, suite, unit)")}</label>
                  <input id="shipping-address2" value={shippingAddress.addressLine2} onChange={(event) => updateShipping("addressLine2", event.target.value)} placeholder={t("Apartment, floor, etc.")} />
                </div>
              </div>
            ) : (
              <div className="purchase-delivery-form">
                <h3 className="purchase-subheading">📦 {t("Parcel locker")}</h3>

                <div className="purchase-form-field">
                  <label htmlFor="locker-label">{t("Address Label (optional)")}</label>
                  <input id="locker-label" value={parcelLocker.label} onChange={(event) => updateLocker("label", event.target.value)} placeholder={t("Home, Work, etc.")} />
                </div>

                <div className="purchase-form-field">
                  <label htmlFor="locker-recipient">{t("Recipient Name")} <span className="required-marker">*</span></label>
                  <input id="locker-recipient" required value={parcelLocker.recipientName} onChange={(event) => updateLocker("recipientName", event.target.value)} placeholder={t("Full name")} />
                </div>

                <div className="purchase-form-field">
                  <label htmlFor="locker-country">{t("Country")} <span className="required-marker">*</span></label>
                  <select id="locker-country" required value={parcelLocker.country} onChange={(event) => setParcelLocker((current) => ({ ...current, country: event.target.value, network: "" }))}>
                    <option value="">{t("- Select Country -")}</option>
                    {countries.map((country) => <option key={country} value={country}>{country}</option>)}
                  </select>
                </div>

                <div className="purchase-form-field">
                  <label htmlFor="locker-network">{t("Parcel Locker Network")} <span className="required-marker">*</span></label>
                  <select id="locker-network" required disabled={!parcelLocker.country} value={parcelLocker.network} onChange={(event) => updateLocker("network", event.target.value)}>
                    <option value="">{parcelLocker.country ? t("- Select parcel locker network -") : t("- Select country first -")}</option>
                    {networks.map((network) => <option key={network} value={network}>{network}</option>)}
                  </select>
                </div>

                <div className="purchase-form-field">
                  <label htmlFor="locker-city">{t("City")} <span className="required-marker">*</span></label>
                  <input id="locker-city" required value={parcelLocker.city} onChange={(event) => updateLocker("city", event.target.value)} placeholder={t("City")} />
                </div>

                <div className="purchase-form-field">
                  <label htmlFor="locker-postal">{t("Postal Code (optional)")}</label>
                  <input id="locker-postal" value={parcelLocker.postalCode} onChange={(event) => updateLocker("postalCode", event.target.value)} placeholder={t("Postal / ZIP code")} />
                </div>

                <div className="purchase-form-field">
                  <label htmlFor="locker-id">{t("Parcel Locker ID")} <span className="required-marker">*</span> {t("(Point code from the carrier website)")}</label>
                  <input id="locker-id" required value={parcelLocker.lockerId} onChange={(event) => updateLocker("lockerId", event.target.value)} placeholder={t("For example: KRA010, 4711-Berlin")} />
                </div>

                <div className="purchase-form-field">
                  <label htmlFor="locker-address">{t("Parcel Locker Address (optional)")}</label>
                  <input id="locker-address" value={parcelLocker.address} onChange={(event) => updateLocker("address", event.target.value)} placeholder={t("Street address")} />
                </div>

                <label className="purchase-save-option">
                  <input type="checkbox" checked={saveParcelLocker} onChange={(event) => setSaveParcelLocker(event.target.checked)} />
                  <span>{t("saveLocker")}</span>
                </label>
                <div className="purchase-locker-note">ℹ️ {t("lockerSellerNotice")}</div>
                <div className="purchase-saved-addresses">{t("savedAddresses")}: 0/5</div>
              </div>
            )}

            <label className="purchase-field-label purchase-comment-label">💬 {t("commentToOrder")}</label>
            <textarea className="purchase-comment" value={comment} maxLength={400} onChange={(event) => setComment(event.target.value)} placeholder={t("orderCommentPlaceholder")} />
            <div className="purchase-character-count">{comment.length}/400</div>
          </section>

          <div className="purchase-danger-warning">
            ⚠️ <strong>{t("warning")}</strong> {t("purchaseWarning")}
          </div>

          <section className="purchase-final-card">
            <div className="purchase-final-title">🛒 {t("purchaseItem")}</div>
            <div className="purchase-pin-row">
              <label htmlFor="purchase-pin">{t("yourPin")}:</label>
              <input id="purchase-pin" className="purchase-pin" type="password" value={pin} onChange={(event) => setPin(event.target.value)} placeholder={t("yourPin")} maxLength={64} />
            </div>
            {!hasEnoughBalance ? <div className="purchase-insufficient">⚠️ {t("insufficientBalance")}</div> : null}
            <button type="button" className="purchase-buy-button" disabled={!hasEnoughBalance || !pin.trim()}>{t("buy")}</button>
          </section>
        </section>
      </div>
    </main>
  );
}
