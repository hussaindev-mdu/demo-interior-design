import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Inter } from "next/font/google";
import { Providers } from "@/components/ui/Providers";
import { Nav } from "@/components/ui/Nav";
import { WhatsAppButton } from "@/components/ui/WhatsAppButton";
import { JsonLd } from "@/components/ui/JsonLd";
import { Footer } from "@/components/sections/Footer";
import "./globals.css";
import { siteConfig } from "@/lib/site-config";
import { frames, hexToRgbTriplet } from "@/lib/frames";

const serif = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  style: ["normal", "italic"],
  variable: "--font-serif",
  display: "swap",
});

const sans = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const title = `${siteConfig.name} — Luxury Interior Design Studio in ${siteConfig.city}`;

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: { default: title, template: `%s — ${siteConfig.name}` },
  description: siteConfig.description,
  applicationName: siteConfig.name,
  keywords: [
    `interior designer ${siteConfig.city}`,
    "luxury interior design",
    "modular kitchens",
    "false ceiling design",
    "wardrobes and joinery",
    "turnkey interiors",
  ],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: "/",
    siteName: siteConfig.name,
    title,
    description: siteConfig.description,
  },
  twitter: {
    card: "summary_large_image",
    title,
    description: siteConfig.description,
  },
  robots: { index: true, follow: true },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  themeColor: frames.background,
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en-IN"
      className={`${serif.variable} ${sans.variable}`}
      // Page background = colour sampled from frame 1 by `npm run prepare-frames`.
      style={{ ["--bg-rgb" as string]: hexToRgbTriplet(frames.background) }}
    >
      <body>
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:bg-gold focus:px-4 focus:py-2 focus:text-bg"
        >
          Skip to content
        </a>
        <Providers>
          <JsonLd />
          <Nav />
          {children}
          <Footer />
          <WhatsAppButton />
        </Providers>
      </body>
    </html>
  );
}
