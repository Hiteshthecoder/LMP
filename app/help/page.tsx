import { Breadcrumb } from "@/components/Breadcrumb";
import { T } from "@/components/Translated";

export default function HelpPage() {
  return (
    <main className="page-shell">
      <Breadcrumb items={["Help"]} />
      <section className="content-card">
        <div className="content-heading"><T k="Help" /></div>
        <h2><T k="Catalogue Information" /></h2>
        <p><T k="Browse the catalogue, search by product name, category, location, and price, and open a product to see its details." /></p>
        <p><T k="Create an account to access authenticated features. Product information shown in the catalogue comes from the database." /></p>
      </section>
    </main>
  );
}
