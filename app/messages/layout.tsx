import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Messages",
    description: "Messages page for LMP : Le Monde Parallel Global Gun And Firearms Marketplace.",
    robots: {
        index: false,
        follow: false,
        googleBot: {
            index: false,
            follow: false,
        },
    },
};

export default function PrivateRouteLayout({
    children,
}: Readonly<{ children: React.ReactNode }>) {
    return children;
}
