import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/components/theme-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://marrionesa.github.io/tauri-plugin-ad2mob/"),
  title: "tauri-plugin-ad2mob — Google AdMob para Tauri v2",
  description:
    "Documentación del plugin tauri-plugin-ad2mob: banners nativos, intersticiales y rewarded de Google AdMob, consentimiento UMP y ATT de iOS para apps Tauri v2 en Android e iOS, con una API de TypeScript fuertemente tipada.",
  keywords: [
    "tauri",
    "tauri-plugin",
    "admob",
    "google admob",
    "android",
    "ios",
    "banner",
    "interstitial",
    "rewarded",
    "ump",
    "app tracking transparency",
  ],
  openGraph: {
    title: "tauri-plugin-ad2mob — Google AdMob para Tauri v2",
    description:
      "Banners nativos, intersticiales, rewarded, consentimiento UMP y ATT de iOS para apps Tauri v2 — detrás de una única API tipada.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
