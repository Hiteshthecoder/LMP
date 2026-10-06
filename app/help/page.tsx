import { Breadcrumb } from "@/components/Breadcrumb";

export default function HelpPage() {
  return (
    <main className="page-shell">
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
