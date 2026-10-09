import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Breadcrumb } from "@/components/Breadcrumb";
import { ProductCard } from "@/components/ProductCard";
import { SeoJsonLd } from "@/components/SeoJsonLd";
import { getCategoryBySlug, getProducts } from "@/lib/catalog";
import { SITE_URL, categoryPath, trimDescription } from "@/lib/seo";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { slug } = await params;
    const category = await getCategoryBySlug(slug);
    if (!category) return { title: "Category Not Found", robots: { index: false, follow: false } };

    const description = trimDescription(category.description, `Browse ${category.title} items on LMP : Le Monde Parallel Marketplace.`);
    const categoryCount = Number(category.productCount ?? 0);
    const canonical = categoryPath(category.slug);
    return {
        title: category.title,
        description,
        robots: categoryCount === 0 ? { index: false, follow: true } : undefined,
        alternates: { canonical },
        openGraph: { title: `${category.title} | LMP : Le Monde Parallel`, description, url: canonical, type: "website", images: category.image ? [{ url: category.image, alt: category.title }] : undefined },
    };
}

export default async function CategoryPage({ params }: Props) {
    const { slug } = await params;
    const category = await getCategoryBySlug(slug);
    if (!category) notFound();
    const products = await getProducts({ category: category.slug, limit: 120 });
    const url = `${SITE_URL}${categoryPath(category.slug)}`;

    return (
        <main className="page-shell">
            <SeoJsonLd data={{
                "@context": "https://schema.org",
                "@type": "CollectionPage",
                name: category.title,
                description: category.description || undefined,
                url,
                mainEntity: {
                    "@type": "ItemList",
                    numberOfItems: products.length,
                    itemListElement: products.map((product, index) => ({
                        "@type": "ListItem",
                        position: index + 1,
                        name: product.name,
                        url: `${SITE_URL}/products/${encodeURIComponent(product.id)}`,
                    })),
                },
            }} />
            <Breadcrumb items={[category.slug]} />
            <section className="panel">
                <h1 className="section-title">{category.title}</h1>
                {category.description ? <p>{category.description}</p> : null}
                <div className="product-grid">
                    {products.map((product) => <ProductCard key={product.id} product={product} />)}
                </div>
            </section>
        </main>
    );
}
