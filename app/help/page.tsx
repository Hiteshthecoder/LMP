import { Breadcrumb } from "@/components/Breadcrumb";

export default function HelpPage() {
  return (
    <main className="page-shell">
      <Breadcrumb items={["Help"]} />
      <section className="content-card">
        <div className="content-heading">Help</div>
        <h2>Catalogue Information</h2>
        <p>Browse the catalogue, search by product name, category, location, and price, and open a product to see its details.</p>
        <p>Create an account to access authenticated features. Product information shown in the catalogue comes from the database.</p>
      </section>
    </main>
  );
}
