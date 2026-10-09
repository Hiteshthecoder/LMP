import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Login",
    description: "Login page for LMP : Le Monde Parallel Global Marketplace For Guns, Drugs and Firearms.",
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
