import type { Metadata } from "next";
import "./guides.css";

export const metadata: Metadata = {
  title: "旅行指南",
  description: "實用的旅行紀錄方法、世界地圖整理技巧與旅遊回憶保存指南。",
  alternates: { canonical: "/guides" },
};

export default function GuidesLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="guide-shell">
      <header className="guide-header">
        <a className="guide-logo" href="/">◎ Jane Travel Map</a>
        <nav><a href="/">建立足跡</a><a href="/guides">旅行指南</a><a href="/about">關於</a></nav>
      </header>
      {children}
      <footer className="guide-footer">
        <span>© 2026 Jane Travel Map</span>
        <nav><a href="/">回到地圖</a><a href="/about">關於</a><a href="/privacy">隱私權</a><a href="/terms">服務條款</a><a href="/contact">聯絡我們</a></nav>
      </footer>
    </div>
  );
}
