import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";
import { Providers } from "./providers";
import "./globals.css";

// One family across the whole app — headings, labels, data. A rounded display
// face on data labels is what made the previous pass read as a toy.
const geist = Geist({
  variable: "--font-sans",
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
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f8f6f6" },
    { media: "(prefers-color-scheme: dark)", color: "#13100f" },
  ],
  viewportFit: "cover",
  width: "device-width",
  initialScale: 1,
  // No maximumScale: pinch-zoom stays available. 16px inputs (globals.css)
  // are what stop iOS zooming on focus.
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={geist.variable}>
      <body className="min-h-dvh">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
