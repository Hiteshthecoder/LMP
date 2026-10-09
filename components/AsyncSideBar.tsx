
import { getCategories } from "@/lib/catalog";
import { Sidebar } from "@/components/Sidebar";

export async function AsyncSidebar() {
    const categories = await getCategories();

    return <Sidebar categories={categories} />;
}

export function SidebarFallback() {
    return (
        <aside
            className="sidebar"
            aria-busy="true"
            aria-label="Loading sidebar"
        >
            <div className="panel">
                <div className="panel-title">Loading search…</div>
                <div className="performance-skeleton-line" />
                <div className="performance-skeleton-line" />
                <div className="performance-skeleton-line short" />
            </div>
        </aside>
    );
}
