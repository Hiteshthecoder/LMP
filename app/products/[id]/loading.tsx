export default function ProductDetailLoading() {
  return (
    <main className="page-shell product-detail-shell">
      <div className="skeleton skeleton-breadcrumb" />
      <div className="product-page-layout">
        <aside className="product-sidebar">
          <section className="panel loading-panel">
            <div className="skeleton skeleton-title" />
            <div className="skeleton skeleton-store" />
            <div className="skeleton skeleton-button" />
            <div className="skeleton skeleton-stats" />
          </section>
        </aside>
        <section className="product-detail-content">
          <section className="product-hero panel loading-hero">
            <div className="skeleton skeleton-main-image" />
            <div className="loading-summary">
              <div className="skeleton skeleton-heading" />
              <div className="skeleton skeleton-line" />
              <div className="skeleton skeleton-line" />
              <div className="skeleton skeleton-line-short" />
              <div className="skeleton skeleton-price" />
              <div className="skeleton skeleton-button-large" />
            </div>
          </section>
          <div className="skeleton skeleton-tab" />
          <div className="skeleton skeleton-description" />
          <div className="skeleton skeleton-related-heading" />
          <div className="related-products-grid">
            {Array.from({ length: 4 }, (_, index) => <div className="skeleton skeleton-related-card" key={index} />)}
          </div>
        </section>
      </div>
    </main>
  );
}
