/* eslint-disable @next/next/no-html-link-for-pages */
export default function AboutPage() {
  return <main className="legal-page"><a className="legal-brand" href="/">◎ 旅行足跡</a><article><p className="eyebrow">ABOUT</p><h1>關於旅行足跡</h1><p>旅行足跡是一個讓每個人收藏自己旅行故事的個人工具。登入後，你可以記錄去過的國家、城市與月份，透過世界地圖回顧旅程，並查看各城市的造訪次數。</p><h2>我們想做的事</h2><p>旅行不只是清單，而是人生中的片段。我們希望提供一個清爽、容易使用且尊重個人隱私的空間，讓每位旅行者都能建立只屬於自己的世界地圖。</p><h2>你的資料屬於你</h2><p>每個帳戶的旅行資料獨立保存，不會公開展示給其他使用者。網站不會販售個人旅行紀錄。</p></article><Footer /></main>;
}
function Footer(){return <footer className="legal-footer"><a href="/">回到首頁</a><a href="/privacy">隱私權</a><a href="/terms">服務條款</a><a href="/contact">聯絡我們</a></footer>}
