import { Breadcrumb } from "@/components/Breadcrumb";
import { SeoJsonLd } from "@/components/SeoJsonLd";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Get Help",
  description:
    "Get help with LMP: Le Monde Parallel Global Marketplace For guns, drugs, fireamrs, and support.",
  alternates: { canonical: "/help" },
  openGraph: {
    title: "Help | LMP : Le Monde Parallel Marketplace",
    description:
      "Get help with LMP: Le Monde Parallel Global Marketplace For guns, drugs, fireamrs, and support.",
    url: "/help",
    type: "website",
  },
};

export default function HelpPage() {
  return (
    <main className="page-shell">
      <SeoJsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "ContactPage",
          name: "LMP : Le Monde Parallel Global Gun and Fireamrs Marketplace Help Center",
          url: "/help",
        }}
      />
      <Breadcrumb items={["Help"]} />
      <section className="content-card">
        <section className="help-contact-card" aria-label="Help contact">
          <div className="help-contact-icon" aria-hidden="true">?</div>
          <div className="help-contact-content">
            <h2>Need Help?</h2>
            <p>
              If you are facing any problems or you guys need anything that is not listed here as product but want to buy it you can communicate with us on{" "}
              <a href="mailto:lemondeparallel@proton.me">
                lemondeparallel@proton.me
              </a>
            </p>
          </div>
        </section>
      </section>
    </main>
  );
}
