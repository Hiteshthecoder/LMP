import { Breadcrumb } from "@/components/Breadcrumb";

export default function AboutPage() {
    return (
        <main className="page-shell">
            <Breadcrumb items={["About-Us"]} />
            <section className="content-card">
                <div className="content-heading">About US</div>
                <h2>Catalogue Information</h2>
                <p>Browse the catalogue, search by product name, category, location, and price, and open a product to see its details.</p>
                <p>Create an account to access authenticated features. Product information shown in the catalogue comes from the database.</p>
            </section>
        </main>
    );
}
