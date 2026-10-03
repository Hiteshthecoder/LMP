import { Breadcrumb } from "@/components/Breadcrumb";
import { ProductCard } from "@/components/ProductCard";
import { T } from "@/components/Translated";
import { getProducts } from "@/lib/catalog";

export default async function ProductsPage() {
  const products = await getProducts({ limit: 120 });
  return (
    <main className="page-shell">
      <Breadcrumb items={["Products"]} />
      <section className="panel">
        <div className="section-title"><T k="All Catalogue Items" /></div>
        <div className="product-grid">
          {products.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
      </section>
    </main>
  );
}
