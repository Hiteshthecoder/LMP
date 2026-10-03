import { notFound } from "next/navigation";
import Image from "next/image";
import { Breadcrumb } from "@/components/Breadcrumb";
import { T } from "@/components/Translated";
import { BuyButton } from "@/components/BuyButton";
import { ProductSidebar } from "@/components/ProductSidebar";
import { ProductTabs } from "@/components/ProductTabs";
import { RelatedProductCard } from "@/components/RelatedProductCard";
import { formatUsd } from "@/lib/utils";
import {
  formatBitcoin,
  getBitcoinUsdPrice,
  usdToBitcoin,
} from "@/lib/bitcoin";
import {
  getCategoryProductCount,
  getProductFeedback,
  getProductPageData,
  getRelatedProducts,
} from "@/lib/product-page";

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const product = await getProductPageData(id);

  if (!product) {
    notFound();
  }

  const [
    feedback,
    relatedProducts,
    categoryProductCount,
    bitcoinUsdPrice,
  ] = await Promise.all([
    getProductFeedback(product._id),
    getRelatedProducts(product.category, product._id, 4),
    getCategoryProductCount(product.category),
    getBitcoinUsdPrice(),
  ]);

  const bitcoinAmount = usdToBitcoin(
    product.price,
    bitcoinUsdPrice
  );

  return (
    <main className="page-shell product-detail-shell">
      <Breadcrumb items={["Home", product.name]} />

      <div className="product-page-layout">
        <ProductSidebar
          product={product}
          categoryProductCount={categoryProductCount}
        />

        <section className="product-detail-content">
          <section className="product-hero panel">
            <div className="product-gallery">
              <Image
                className="product-main-image"
                src={product.image}
                alt={product.name}
                width={270}
                height={238}
                sizes="(max-width: 800px) 100vw, (max-width: 1100px) 220px, 270px"
                priority
              />

              <Image
                className="product-thumb"
                src={product.image}
                alt=""
                width={54}
                height={46}
                sizes="54px"
              />
            </div>

            <div className="product-summary">
              <h1><T k="Product Name:" /> {product.name}</h1>

              <div className="product-fact">
                <strong><T k="Item Price:" /></strong>{" "}
                <span>{formatUsd(product.price)}</span>
              </div>

              <div className="product-fact">
                <strong><T k="Item Rating:" /></strong>{" "}
                <span className="stars">
                  {"★".repeat(Math.round(product.rating))}
                  {"☆".repeat(
                    Math.max(0, 5 - Math.round(product.rating))
                  )}
                </span>{" "}
                |{" "}
                <a
                  className="inline-feedback-link"
                  href="#product-feedback"
                >
                  Reviews
                </a>
              </div>

              <div className="product-fact">
                <strong><T k="Category:" /></strong>{" "}
                <a
                  href={`/?category=${encodeURIComponent(
                    product.category
                  )}`}
                >
                  <T k={product.category.replace(/[-_]/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase())} />
                </a>
              </div>

              <div className="product-fact">
                <strong><T k="Sold:" /></strong>{" "}
                <span><T k={`${product.deals} pcs`} /></span>
              </div>

              {product.details[0] ? (
                <div className="product-fact">
                  <strong><T k="Delivery service:" /></strong>{" "}
                  <span><T k={product.details[0]} /></span>
                </div>
              ) : null}

              <div className="purchase-row">
                <div className="currency-price">
                  🇺🇸 USD{" "}
                  {product.price.toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </div>

                <div
                  className="currency-price"
                  title={
                    bitcoinUsdPrice
                      ? `1 BTC = ${formatUsd(bitcoinUsdPrice)}`
                      : "Live Bitcoin price unavailable"
                  }
                >
                  ₿ BTC{" "}
                  {formatBitcoin(bitcoinAmount)}
                </div>

                <BuyButton productId={product.id} />
              </div>
            </div>
          </section>

          <ProductTabs
            product={product}
            feedback={feedback}
          />

          <section className="related-section">
            <div className="related-heading">
              <T k="Even more from this store" />
            </div>

            {relatedProducts.length > 0 ? (
              <div className="related-products-grid">
                {relatedProducts.map((related) => (
                  <RelatedProductCard
                    key={related._id}
                    product={related}
                  />
                ))}
              </div>
            ) : (
              <div className="related-empty">
                <T k="No other active products are available in this category." />
              </div>
            )}
          </section>
        </section>
      </div>
    </main>
  );
}
