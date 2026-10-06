import "./globals.css";
import { Header } from "@/components/Header";
import { AuthProvider } from "@/components/AuthProvider";
import { getCategories } from "@/lib/catalog";

export const metadata = {
  title: "LMP",
  description:
    "Global Marketplace for Genuine Guns",
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
        <AuthProvider>
          <div className="site">
            <div className="top-space" />
            <Header categories={categories} />
            {children}
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
