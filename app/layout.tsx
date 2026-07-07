import type { Metadata, Viewport } from "next";
import { Figtree, Fredoka } from "next/font/google";
import { Providers } from "./providers";
import "./globals.css";

const figtree = Figtree({
  variable: "--font-sans",
  subsets: ["latin"],
});

const fredoka = Fredoka({
  variable: "--font-display",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Spots",
    template: "%s · Spots",
  },
  description: "Track places you want to go and places you've been.",
  appleWebApp: {
    capable: true,
    title: "Spots",
    statusBarStyle: "default",
  },
};

export const viewport: Viewport = {
  themeColor: "#F7F7F5",
  viewportFit: "cover",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${figtree.variable} ${fredoka.variable}`}>
      <body className="min-h-dvh">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
