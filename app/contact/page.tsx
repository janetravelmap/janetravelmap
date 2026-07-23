/* eslint-disable @next/next/no-html-link-for-pages */
export default function ContactPage() {
  return <main className="legal-page"><a className="legal-brand" href="/">◎ 旅行足跡</a><article><p className="eyebrow">CONTACT</p><h1>聯絡我們</h1><p>如果你對旅行足跡的功能、資料、隱私權、廣告合作或錯誤回報有任何問題，歡迎來信。</p><a className="contact-card" href="mailto:janetravelmap@gmail.com"><span>電子郵件</span><strong>janetravelmap@gmail.com</strong><small>點擊開啟郵件程式</small></a><p className="contact-note">我們會盡力在合理時間內回覆。來信請避免提供密碼或其他不必要的敏感資訊。</p></article><Footer /></main>;
}
function Footer(){return <footer className="legal-footer"><a href="/">回到首頁</a><a href="/about">關於網站</a><a href="/privacy">隱私權</a><a href="/terms">服務條款</a></footer>}
