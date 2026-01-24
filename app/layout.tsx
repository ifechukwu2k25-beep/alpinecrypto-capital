import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import { I18nProvider } from "@/components/providers/I18nProvider";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
  weight: ["400", "600", "700"],
});

export const metadata: Metadata = {
  title: "AlpineCrypto Capital — Professional Digital Asset Governance",
  description: "Trusted, Swiss-aligned portfolio advisory for institutional digital asset investment with transparent reporting and risk-aware strategies",
  keywords: "digital assets, institutional investment, portfolio management, crypto investment, asset management, Switzerland",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${playfair.variable} font-sans`}>
        <I18nProvider>
          <div className="min-h-screen flex flex-col">
            {children}
          </div>
        </I18nProvider>
      </body>
    </html>
  );
}
