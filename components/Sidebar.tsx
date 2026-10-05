import Link from "next/link";
import type { CategoryOption } from "@/data/products";
import { SidebarSearch } from "@/components/SidebarSearch";
import { HomeAccountPanel } from "@/components/HomeAccountPanel";

type Props = {
  categories: CategoryOption[];
};

export function Sidebar({ categories }: Props) {
  return (
    <aside className="sidebar">
      <HomeAccountPanel />
      <SidebarSearch categories={categories} />


      <div className="panel">
        <div className="panel-title">
          NEW Arrivals
        </div>

        {categories.map((category) => (
          <div className="catalog-category-item" key={category.slug}>
            <Link href={`/?category=${encodeURIComponent(category.slug)}`}>
              <b>{category.title}</b>
            </Link>

            <div>
              Items: {category.productCount}
            </div>
          </div>
        ))}
      </div>
    </aside>
  );
}
