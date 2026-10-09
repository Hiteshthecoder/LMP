import { Breadcrumb } from "@/components/Breadcrumb";
import { ProductCard } from "@/components/ProductCard";
import { SeoJsonLd } from "@/components/SeoJsonLd";
import { getProducts } from "@/lib/catalog";
import { SITE_URL } from "@/lib/seo";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "All Items",
  description: "Browse the LMP : Le Monde Parallel Global Marketplace for guns, drugs, fireamrs and checkout available quality Guns and Firearms",
  alternates: { canonical: "/products" },
  openGraph: {
    title: "LMP : Le Monde Parallel MarketPlace",
    description: "Browse the LMP : Le Monde Parallel Marketplace and checkout available quality Guns and Firearms",
    url: "/products",
    type: "website",
  },
};

export default async function ProductsPage() {
  const products = await getProducts({ limit: 120 });
  return (
    <main className="page-shell">
      <SeoJsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: "All Items",
          url: `${SITE_URL}/products`,
          mainEntity: {
            "@type": "ItemList",
            numberOfItems: products.length,
            itemListElement: products.map((product, index) => ({
              "@type": "ListItem",
              position: index + 1,
              url: `${SITE_URL}/products/${encodeURIComponent(product.id)}`,
              name: product.name,
            })),
          },
        }}
      />
      <Breadcrumb items={["Products"]} />
      <section className="panel">
        <div className="section-title">All Items</div>
        <div className="product-grid">
          {products.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
      </section>
    </main>
  );
}
