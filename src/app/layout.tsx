import type { Metadata } from "next";
import { siteConfig } from "@/data/content";
import { ThemeProvider } from "@/hooks/useTheme";
import { LanguageProvider } from "@/lib/language";
import "./globals.css";

export const metadata: Metadata = {
  title: siteConfig.title,
  description: siteConfig.description,
  metadataBase: new URL(siteConfig.url),
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
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider><LanguageProvider>{children}</LanguageProvider></ThemeProvider>
      </body>
    </html>
  );
}
