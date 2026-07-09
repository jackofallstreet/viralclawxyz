import type { Metadata, Viewport } from "next";
import { IBM_Plex_Mono } from "next/font/google";
import "./globals.css";

const mono = IBM_Plex_Mono({
  weight: ["300", "400", "500"],
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
  preload: false,
});

export const viewport: Viewport = {
  themeColor: "#000000",
  colorScheme: "dark",
};

export const metadata: Metadata = {
  title: {
    default: "ViralClaw — Command Center",
    template: "%s • ViralClaw",
  },

  description: "Synchronization intelligence layer",

  applicationName: "ViralClaw",

  referrer: "no-referrer",

  generator: undefined,

  metadataBase: undefined,

  robots: {
    index: false,
    follow: false,
    nocache: true,
    noarchive: true,
    nosnippet: true,
    noimageindex: true,
    notranslate: true,

    googleBot: {
      index: false,
      follow: false,
      noarchive: true,
      nosnippet: true,
      noimageindex: true,
      notranslate: true,
    },
  },

  icons: {
    icon: [
      { url: "/viralclaw_icon.png" },
      { url: "/viralclaw_icon.png", sizes: "32x32", type: "image/png" },
      { url: "/viralclaw_icon.png", sizes: "16x16", type: "image/png" },
    ],
    apple: "/viralclaw_icon.png",
    shortcut: "/viralclaw_icon.png",
  },

  manifest: "/site.webmanifest",

  openGraph: {
    title: "ViralClaw – Command center",
    description: "Synchronization intelligence layer",
    type: "website",
  },

  twitter: {
    card: "summary",
    title: "ViralClaw",
    description: "Synchronization intelligence layer",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={mono.variable}
      suppressHydrationWarning
    >
      <body>{children}</body>
    </html>
  );
}
