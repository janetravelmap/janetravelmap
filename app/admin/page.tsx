/* eslint-disable @next/next/no-html-link-for-pages */
import { count, countDistinct, desc, eq, gte, sql } from "drizzle-orm";
import { notFound } from "next/navigation";
import { requireChatGPTUser } from "../chatgpt-auth";
import { getDb } from "../../db";
import { profiles, trips, users } from "../../db/schema";

export const dynamic = "force-dynamic";

const ADMIN_EMAILS = new Set(["jane0928296300@gmail.com", "janetravelmap@gmail.com"]);

export default async function AdminPage() {
  const user = await requireChatGPTUser("/admin");
  if (!ADMIN_EMAILS.has(user.email.toLowerCase())) notFound();

  const db = getDb();
  const [totalUsersRow] = await db.select({ value: count() }).from(users);
  const [weekUsersRow] = await db.select({ value: count() }).from(users).where(gte(users.lastSeenAt, sql<string>`strftime('%Y-%m-%dT%H:%M:%fZ', 'now', '-7 days')`));
  const [monthUsersRow] = await db.select({ value: count() }).from(users).where(gte(users.lastSeenAt, sql<string>`strftime('%Y-%m-%dT%H:%M:%fZ', 'now', '-30 days')`));
  const [tripUsersRow] = await db.select({ value: countDistinct(trips.ownerEmail) }).from(trips);
  const [tripsRow] = await db.select({ value: count() }).from(trips);
  const userRows = await db.select({
    email: users.ownerEmail,
    displayName: profiles.displayName,
    firstSeenAt: users.firstSeenAt,
    lastSeenAt: users.lastSeenAt,
    tripCount: count(trips.id),
    countryCount: countDistinct(trips.countryId),
    theme: profiles.theme,
    mapColor: profiles.mapColor,
  }).from(users)
    .leftJoin(profiles, eq(users.ownerEmail, profiles.ownerEmail))
    .leftJoin(trips, eq(users.ownerEmail, trips.ownerEmail))
    .groupBy(
      users.ownerEmail,
      users.firstSeenAt,
      users.lastSeenAt,
      profiles.displayName,
      profiles.theme,
      profiles.mapColor,
    )
    .orderBy(desc(users.lastSeenAt));

  const totalUsers = totalUsersRow?.value ?? 0;
  const weekUsers = weekUsersRow?.value ?? 0;
  const monthUsers = monthUsersRow?.value ?? 0;
  const tripUsers = tripUsersRow?.value ?? 0;
  const totalTrips = tripsRow?.value ?? 0;
  const averageTrips = tripUsers ? (totalTrips / tripUsers).toFixed(1) : "0";

  return <main className="admin-page">
    <header><div><p>PRIVATE DASHBOARD</p><h1>網站使用統計</h1><span>只有管理員帳號能查看</span></div><a href="/">返回旅行足跡</a></header>
    <section className="admin-grid">
      <article className="featured"><span>累積登入使用者</span><strong>{totalUsers}</strong><small>自統計功能上線後開始計算</small></article>
      <article><span>近 7 天活躍</span><strong>{weekUsers}</strong><small>曾開啟個人足跡</small></article>
      <article><span>近 30 天活躍</span><strong>{monthUsers}</strong><small>曾開啟個人足跡</small></article>
      <article><span>已建立足跡者</span><strong>{tripUsers}</strong><small>至少有一筆旅行紀錄</small></article>
      <article><span>旅行紀錄總數</span><strong>{totalTrips}</strong><small>全站紀錄合計</small></article>
      <article><span>平均每人紀錄</span><strong>{averageTrips}</strong><small>以有足跡的使用者計算</small></article>
    </section>
    <section className="admin-users">
      <div className="admin-users-head">
        <div><p>REGISTERED USERS</p><h2>登入使用者資料</h2><span>依最近活動時間排列，僅管理員可查看</span></div>
        <a className="export-button" href="/admin/export">匯出搬家備份</a>
      </div>
      <div className="admin-table-wrap">
        <table>
          <thead><tr><th>使用者</th><th>旅行紀錄</th><th>國家</th><th>首次登入</th><th>最近活動</th><th>個人配色</th></tr></thead>
          <tbody>
            {userRows.map((row) => <tr key={row.email}>
              <td><strong>{row.displayName || row.email.split("@")[0]}</strong><small>{row.email}</small></td>
              <td>{row.tripCount}</td>
              <td>{row.countryCount}</td>
              <td>{formatDate(row.firstSeenAt)}</td>
              <td>{formatDate(row.lastSeenAt)}</td>
              <td><span className="admin-color" style={{ backgroundColor: row.mapColor || "#147fe5" }} />{themeLabel(row.theme)}</td>
            </tr>)}
            {!userRows.length && <tr><td colSpan={6} className="admin-empty">目前還沒有登入使用者資料。</td></tr>}
          </tbody>
        </table>
      </div>
    </section>
    <aside className="admin-note"><b>資料與隱私說明</b><p>登入與活躍時間從統計功能上線後開始累積；較早以前的登入若沒有再次開啟網站，無法回推。信箱及旅行資料只供網站管理、客服與搬家備份使用，請勿公開分享匯出的檔案。</p></aside>
  </main>;
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("zh-TW", {
    timeZone: "Asia/Taipei",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date(value));
}

function themeLabel(theme: string | null) {
  return ({ blue: "海洋藍", teal: "薄荷綠", rose: "珊瑚粉", violet: "薰衣紫", amber: "暖陽橘" } as Record<string, string>)[theme || "blue"] || "海洋藍";
}
