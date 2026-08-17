import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "旅行指南",
  description: "從整理舊旅行、記錄城市到閱讀自己的世界地圖，讓每段旅程更容易被保存。",
  alternates: { canonical: "/guides" },
};

const articles = [
  { href: "/guides/start-travel-map", tag: "開始記錄", title: "如何建立自己的旅行足跡地圖？", text: "不用一次想起所有旅程。從最近一次旅行開始，逐步補上國家、城市、月份與最想留下的回憶。" },
  { href: "/guides/organize-old-trips", tag: "整理方法", title: "舊旅行太多，該從哪一年開始整理？", text: "照片、護照、機票與聊天紀錄都能幫你找回線索。這是一套不容易半途放棄的整理順序。" },
  { href: "/guides/write-travel-memories", tag: "回憶寫法", title: "旅行紀錄可以寫什麼？", text: "除了景點清單，也可以記錄同行的人、第一次體驗、意外插曲，以及多年後仍會想起的小事。" },
  { href: "/guides/read-your-travel-map", tag: "地圖觀察", title: "從旅行地圖看見自己的旅遊習慣", text: "哪些城市一去再去？哪個區域仍是一片空白？旅行統計不只是數字，也能看見自己的偏好。" },
];

export default function GuidesPage() {
  return <main className="guide-main">
    <section className="guide-hero"><p className="guide-kicker">TRAVEL STORIES & TIPS</p><h1>旅行指南</h1><p className="guide-lead">這裡收藏的是實際可用的旅行紀錄方法。主地圖保持簡潔，想整理回憶時，再到這裡慢慢閱讀。</p></section>
    <section className="guide-grid" aria-label="旅行指南文章">
      {articles.map((article) => <a className="guide-card" href={article.href} key={article.href}><span>{article.tag}</span><h2>{article.title}</h2><p>{article.text}</p></a>)}
    </section>
  </main>;
}
