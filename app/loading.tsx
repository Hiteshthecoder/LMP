function LoadingBlock({ className = "" }: { className?: string }) {
    return (
        <div
            className={`route-loading-block ${className}`.trim()}
            aria-hidden="true"
        />
    );
}

export default function Loading() {
    return (
        <main
            className="page-shell route-loading"
            aria-busy="true"
            aria-live="polite"
        >
            <div className="route-loading-header">
                <LoadingBlock className="route-loading-breadcrumb" />
                <LoadingBlock className="route-loading-title" />
            </div>

            <div className="route-loading-grid">
                <aside className="route-loading-sidebar">
                    <LoadingBlock className="route-loading-panel-title" />
                    <LoadingBlock />
                    <LoadingBlock />
                    <LoadingBlock />
                    <LoadingBlock className="route-loading-short" />
                </aside>

                <section className="route-loading-main">
                    <LoadingBlock className="route-loading-section-title" />

                    <div className="route-loading-cards">
                        {Array.from({ length: 6 }, (_, index) => (
                            <article className="route-loading-card" key={index}>
                                <LoadingBlock className="route-loading-card-title" />

                                <div className="route-loading-card-body">
                                    <LoadingBlock className="route-loading-image" />

                                    <div className="route-loading-copy">
                                        <LoadingBlock />
                                        <LoadingBlock className="route-loading-short" />
                                        <LoadingBlock />
                                        <LoadingBlock className="route-loading-price" />
                                    </div>
                                </div>

                                <LoadingBlock className="route-loading-button" />
                            </article>
                        ))}
                    </div>
                </section>
            </div>
        </main>
    );
}