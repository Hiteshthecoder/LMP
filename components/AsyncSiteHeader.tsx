
import { getCategories } from "@/lib/catalog";
import { Header } from "@/components/Header";

export async function AsyncSiteHeader() {
    const categories = await getCategories();

    return <Header categories={categories} />;
}

export function SiteHeaderFallback() {
    return (
        <header
            className="header site-header-fallback"
            aria-busy="true"
            aria-label="Loading site navigation"
        >
            <div className="brand-row">
                <div className="logo">LMP : Le monde parallel</div>
                <div className="rate">Loading rate…</div>
            </div>

            <nav className="nav" aria-hidden="true">
                <span className="nav-item">CATEGORIES 📁</span>
                <span className="nav-item">Loading navigation…</span>
                <span className="nav-spacer" />
            </nav>
        </header>
    );
}
