import type { Metadata } from "next";
import { IBM_Plex_Mono, Barlow, Barlow_Condensed } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import "./globals.css";

const ibmPlexMono = IBM_Plex_Mono({
  weight: ["300", "400", "500"],
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
  preload: false,
});

const barlow = Barlow({
  weight: ["300", "400", "500"],
  subsets: ["latin"],
  variable: "--font-barlow",
  display: "swap",
  preload: false,
});

const barlowCondensed = Barlow_Condensed({
  weight: ["300", "400", "600", "700", "800"],
  subsets: ["latin"],
  variable: "--font-barlow-condensed",
  display: "swap",
  preload: false,
});

export const metadata: Metadata = {
  title: "ViralClaw — Command Center",
  description: "Synchronization intelligence layer",
  icons: { icon: "/viralclaw_icon.png", shortcut: "/viralclaw_icon.png" },
  robots: { index: false, follow: false },
};

export default function DashboardRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      data-theme="dark"
      className={`${ibmPlexMono.variable} ${barlow.variable} ${barlowCondensed.variable}`}
    >
      <body>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
