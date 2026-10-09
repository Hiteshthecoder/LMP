import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "My Purchases",
    description: "My Purchases page for LMP : Le Monde Parallel Global Marketplace for guns, drugs and firearms.",
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
