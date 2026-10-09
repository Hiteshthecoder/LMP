import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Purchase",
    description: "Purchase page for LMP : Le Monde Parallel Global Marketplace for Guns, Firearms, Drugs.",
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
