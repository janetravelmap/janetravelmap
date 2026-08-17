import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL("https://janetravelmap.com"),
  title: {
    default: "Jane Travel Map｜建立自己的旅行足跡",
    template: "%s｜Jane Travel Map",
  },
  description: "免費建立個人旅行地圖，記錄去過的國家、城市、月份與旅行回憶，並查看自己的旅遊統計。",
  alternates: { canonical: "/" },
  openGraph: {
    title: "Jane Travel Map｜建立自己的旅行足跡",
    description: "把去過的國家與城市點亮在自己的世界地圖上。",
    url: "https://janetravelmap.com",
    siteName: "Jane Travel Map",
    locale: "zh_TW",
    type: "website",
  },
  other: {
    "google-adsense-account": "ca-pub-5937627937477794",
  },
  icons: { icon: "/favicon.svg", shortcut: "/favicon.svg" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-Hant">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>{children}</body>
    </html>
  );
}
