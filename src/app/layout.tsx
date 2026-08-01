import type { Metadata } from "next";
import { Cormorant_Garamond, Manrope } from "next/font/google";
import "./globals.css";
import { SITE_NAME, SITE_URL } from "@/lib/constants";
import { SiteHeader, MobileTopBar } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { MobileNav } from "@/components/layout/mobile-nav";
import { AIFloatingButton } from "@/components/ai/ai-floating-button";
import { ToastProvider } from "@/components/ui/toast";
import { getAiAssistantSettings } from "@/lib/data/ai-assistant-settings";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin", "cyrillic"],
  display: "swap",
});

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin", "cyrillic"],
  weight: "variable",
  style: ["normal", "italic"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} — O‘zbekiston yetakchi yoshlari ensiklopediyasi`,
    template: `%s — ${SITE_NAME}`,
  },
  description:
    "Liderlar.uz — O‘zbekistonning faol, iqtidorli va yetakchi yoshlarini birlashtiruvchi raqamli ensiklopediya, reyting platformasi va media markaz.",
  keywords: [
    "Liderlar.uz",
    "O'zbekiston yoshlari",
    "liderlar reytingi",
    "yosh liderlar",
    "Liderlar Online",
  ],
  openGraph: {
    type: "website",
    locale: "uz_UZ",
    siteName: SITE_NAME,
    title: `${SITE_NAME} — O‘zbekiston yetakchi yoshlari ensiklopediyasi`,
    description:
      "O‘zbekistonning faol, iqtidorli va yetakchi yoshlarini birlashtiruvchi raqamli ensiklopediya va media markaz.",
    url: SITE_URL,
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME}`,
    description:
      "O‘zbekistonning faol, iqtidorli va yetakchi yoshlarini birlashtiruvchi raqamli ensiklopediya.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport = {
  themeColor: "#13BCE4",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const aiAssistantSettings = await getAiAssistantSettings();
  return (
    <html
      lang="uz"
      className={`${manrope.variable} ${cormorant.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-ice text-ink">
        <ToastProvider>
          <SiteHeader />
          <MobileTopBar />
          <main className="flex-1 pb-24 lg:pb-0">{children}</main>
          <SiteFooter />
          <MobileNav />
          <AIFloatingButton initialSettings={aiAssistantSettings} />
        </ToastProvider>
      </body>
    </html>
  );
}
