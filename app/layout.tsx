import type { Metadata } from "next";
import { Geist_Mono, Inter, Instrument_Serif, Onest } from "next/font/google";
import "./globals.css";
import { appName } from "@/data/constants/app_name";
import { App_Providers } from "@/app/providers";
import Scroll_To_Top from "@/components/layout_components/scroll_to_top";
import AOSInit from "@/components/layout_components/AOSInit";

// Onest: the site's typeface. Instrument Serif (italic): the accent word in big headings.
// Inter: fallback for glyphs Onest lacks (₦).
const onest = Onest({
  variable: "--font-onest",
  subsets: ["latin", "latin-ext"],
});

const serif = Instrument_Serif({
  variable: "--font-instrument",
  subsets: ["latin"],
  weight: "400",
  style: ["italic"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin", "latin-ext"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: `${appName} | Send Money & Pay Bills in Nigeria`,
    template: `%s | ${appName}`,
  },
  description: `${appName} is the smarter way to move money in Nigeria. Send money instantly from your ${appName} wallet to any Nigerian bank account, receive money, and pay bills — airtime, data, cable TV and electricity — all in one app.`,
  keywords: [
    `${appName}`,
    "send money Nigeria",
    "money transfer Nigeria",
    "NGN wallet",
    "bank transfer app Nigeria",
    "receive money Nigeria",
    "pay bills online Nigeria",
    "buy airtime online",
    "buy data bundles",
    "cable TV subscription payment",
    "electricity bill payment",
    "instant bank transfer",
    "fintech Nigeria",
    "digital wallet Nigeria",
    "bill payment app",
  ],
  openGraph: {
    title: `${appName} | Send Money & Pay Bills in Nigeria`,
    description: `Send money instantly to any Nigerian bank account, receive money, and pay airtime, data, cable TV and electricity bills — all from your ${appName} wallet.`,
    type: "website",
    siteName: appName,
  },
  twitter: {
    card: "summary_large_image",
    title: `${appName} | Send Money & Pay Bills in Nigeria`,
    description: `Send money instantly to any Nigerian bank account, receive money, and pay airtime, data, cable TV and electricity bills — all from your ${appName} wallet.`,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${onest.variable} ${serif.variable} ${inter.variable} ${geistMono.variable} h-full antialiased`}
      // The script below adds "js" before React loads.
      suppressHydrationWarning
    >
      <head>
        {/* Entrance motion only hides content when JavaScript runs (see globals.css, "Reveal"). */}
        <script dangerouslySetInnerHTML={{ __html: "document.documentElement.classList.add('js')" }} />
      </head>
      <body className="min-h-full flex flex-col">
        <App_Providers>
          <Scroll_To_Top />
          <AOSInit />
          {children}
        </App_Providers>
      </body>
    </html>
  );
}
