import "./globals.css";
import { Header } from "@/components/Header";
import { AuthProvider } from "@/components/AuthProvider";
import { getCategories } from "@/lib/catalog";
import type { Metadata, Viewport } from "next";
import { SITE_NAME, SITE_DESCRIPTION, SITE_URL, DEFAULT_OG_IMAGE } from "@/lib/seo";
import { SeoJsonLd } from "@/components/SeoJsonLd";
import { Suspense } from "react";
import { AsyncSiteHeader, SiteHeaderFallback } from "@/components/AsyncSiteHeader";


export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: SITE_NAME,
    template: `${SITE_NAME} | %s `,
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  category: "firearms, guns, rocket-launchers, drugs, credit cards,resident cards",
  keywords: [
    "le monde parallel",
    "Le Monde Parallel",
    "LMP: Le Monde Parallel",
    "lmp: le monde parallel",
    "gun dealers in europe",
    "gun dealers in germany",
    "gun dealers in france",
    "drugs in europe",
    "buy drugs",
    "rocket launchers",
    "buy rocket launchers",
    "buy glock",
  ],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    url: "/",
    siteName: SITE_NAME,
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
    images: [
      {
        url: DEFAULT_OG_IMAGE,
        width: 1920,
        height: 1080,
        alt: `${SITE_NAME} : Le Monde Parallel`,
      },
    ],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  icons: {
    icon: DEFAULT_OG_IMAGE,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};


export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const categories = await getCategories();

  return (
    <html lang="en">
      <body>
        <SeoJsonLd
          data={{
            "@context": "https://schema.org",
            "@graph": [
              {
                "@type": "Organization",
                "@id": `${SITE_URL}/#organization`,
                name: SITE_NAME,
                url: SITE_URL,
                logo: `${SITE_URL}${DEFAULT_OG_IMAGE}`,
              },
              {
                "@type": "WebSite",
                "@id": `${SITE_URL}/#website`,
                url: SITE_URL,
                name: SITE_NAME,
                description: SITE_DESCRIPTION,
                publisher: {
                  "@id": `${SITE_URL}/#organization`,
                },
              },
            ],
          }}
        />
        <AuthProvider>
          <div className="site">
            <div className="top-space" />
            <Suspense fallback={<SiteHeaderFallback />}>
              <AsyncSiteHeader />
            </Suspense>
            {children}
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
