import "./globals.css";
import { Header } from "@/components/Header";
import { AuthProvider } from "@/components/AuthProvider";
import { LanguageProvider } from "@/components/LanguageProvider";
import { getCategories } from "@/lib/catalog";

export const metadata = {
  title: "LMP",
  description:
    "Global Marketplace for Genuine Guns",
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const categories = await getCategories();

  return (
    <html lang="fr">
      <body>
        <LanguageProvider>
          <AuthProvider>
            <div className="site">
              <div className="top-space" />
              <Header categories={categories} />

              {children}
            </div>
          </AuthProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}