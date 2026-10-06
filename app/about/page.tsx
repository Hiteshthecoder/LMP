import { Breadcrumb } from "@/components/Breadcrumb";

export default function AboutPage() {
    return (
        <main className={`page-shell `}>
            <Breadcrumb items={["About-Us"]} />

            <article className="noticeCard">
                <div className="accentLine" />

                <header className="header">
                    <span className="eyebrow">About Us</span>
                    <h1>Here we are again fellas,</h1>
                </header>

                <div className="content">
                    <p>
                        You guys already know who we are and for those who don’t know us we are writing small notorious history.
                    </p>

                    <p>
                        We used to rule the French dark-web until the authorities seized our domains and also caught and charged two site administrators in may 2021.
                    </p>

                    <p>
                        So one of us is out now and that’s why you are able to see this site again.
                    </p>

                    <p className="emphasis">
                        Welcome back fellas, we are free again.
                    </p>

                    <p>
                        This time we are not alone we have collaborated with BlackHand guys whose one of administrator is also in prison.
                    </p>

                    <p className="closing">
                        Serve yourselves fellas with our new site, like you used to before crackdown of may 2021.
                        you will see few products right now as we are making a slow come back after long period of governments captivity. 
                    </p>
                </div>
            </article>
        </main>
    );
}
