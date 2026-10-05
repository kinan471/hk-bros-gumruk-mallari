import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "HK BROS GÜMRÜK MALLARI",
    template: "%s | HK BROS",
  },
  description: "En kaliteli gümrük ürünlerini uygun fiyatlarla keşfedin. Elektronik, giyim, ev yaşam ve daha fazlası.",
  keywords: ["gümrük malları", "elektronik", "giyim", "kozmetik", "online alışveriş", "HK BROS"],
  authors: [{ name: "HK BROS" }],
  openGraph: {
    type: "website",
    locale: "tr_TR",
    siteName: "HK BROS GÜMRÜK MALLARI",
    title: "HK BROS GÜMRÜK MALLARI",
    description: "En kaliteli gümrük ürünlerini uygun fiyatlarla keşfedin.",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#1E3A5F",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr">
      <body className="antialiased bg-gray-50">
        {children}
      </body>
    </html>
  );
}