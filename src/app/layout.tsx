import type { Metadata } from "next";
import { preload } from "react-dom";
import { siteConfig } from "@/data/content";
import { LanguageProvider } from "@/lib/language";
import SiteChrome from "@/components/layout/SiteChrome";
import "./globals.css";

export const metadata: Metadata = {
  title: siteConfig.title,
  description: siteConfig.description,
  metadataBase: new URL(siteConfig.url),
  // Per-page canonical derived from the route (metadataBase + pathname).
  alternates: { canonical: "./" },
  openGraph: {
    title: "Jose Sanz | Software Architect & Consultant",
    description:
      "17 years engineering distributed systems at scale. Healthcare, airlines, finance, telecom. MIT AI certified. Founder of Znas LLC.",
    url: "https://znas.io",
    siteName: "ZNAS",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Jose Sanz | Software Architect & Consultant",
    description:
      "17 years engineering distributed systems at scale. Founder of Znas LLC.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Above-the-fold fonts (headline Archivo, body General Sans, mono labels):
  // preloading skips the CSS-discovery delay; remaining weights load via
  // @font-face. The owl logo appears in the preloader/nav/footer everywhere.
  const fontOpts = { as: "font", type: "font/woff2", crossOrigin: "anonymous" } as const;
  preload("/fonts/archivo-latin.woff2", fontOpts);
  preload("/fonts/general-sans-400.woff2", fontOpts);
  preload("/fonts/jetbrains-mono-latin.woff2", fontOpts);
  preload("/logo.png", { as: "image" });

  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <LanguageProvider>
          <SiteChrome />
          {children}
        </LanguageProvider>
      </body>
    </html>
  );
}
