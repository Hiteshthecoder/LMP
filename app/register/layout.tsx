import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Create Account",
    description: "Create an Account page for LMP : Le Monde Parallel Global Gun and Firearms Marketplace.",
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
