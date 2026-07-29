/* eslint-disable @next/next/no-html-link-for-pages */
import { and, count, countDistinct, desc, eq, gte, isNotNull, sql } from "drizzle-orm";
import { notFound } from "next/navigation";
import { requireChatGPTUser } from "../chatgpt-auth";
import { getDb } from "../../db";
import { ensureAnonymousVisitorsTable } from "../../db/anonymous";
import { anonymousVisitors, profiles, trips, users } from "../../db/schema";

export const dynamic = "force-dynamic";

const ADMIN_EMAILS = new Set(["jane0928296300@gmail.com", "janetravelmap@gmail.com"]);

export default async function AdminPage() {
  const user = await requireChatGPTUser("/admin");
  if (!ADMIN_EMAILS.has(user.email.toLowerCase())) notFound();

  await ensureAnonymousVisitorsTable();
  const db = getDb();
  const [totalUsersRow] = await db.select({ value: count() }).from(users);
  const [weekUsersRow] = await db.select({ value: count() }).from(users).where(gte(users.lastSeenAt, sql<string>`strftime('%Y-%m-%dT%H:%M:%fZ', 'now', '-7 days')`));
  const [monthUsersRow] = await db.select({ value: count() }).from(users).where(gte(users.lastSeenAt, sql<string>`strftime('%Y-%m-%dT%H:%M:%fZ', 'now', '-30 days')`));
  const [tripUsersRow] = await db.select({ value: countDistinct(trips.ownerEmail) }).from(trips);
  const [tripsRow] = await db.select({ value: count() }).from(trips);
  const [anonymousRow] = await db.select({ value: count() }).from(anonymousVisitors);
  const [anonymousWeekRow] = await db.select({ value: count() }).from(anonymousVisitors)
    .where(gte(anonymousVisitors.lastSeenAt, sql<string>`strftime('%Y-%m-%dT%H:%M:%fZ', 'now', '-7 days')`));
  const [startedRow] = await db.select({ value: count() }).from(anonymousVisitors)
    .where(isNotNull(anonymousVisitors.startedAt));
  const [convertedRow] = await db.select({ value: count() }).from(anonymousVisitors)
    .where(and(isNotNull(anonymousVisitors.startedAt), isNotNull(anonymousVisitors.convertedAt)));
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
  const anonymousVisitorsTotal = anonymousRow?.value ?? 0;
  const anonymousVisitorsWeek = anonymousWeekRow?.value ?? 0;
  const anonymousStarted = startedRow?.value ?? 0;
  const anonymousConverted = convertedRow?.value ?? 0;
  const conversionRate = anonymousStarted ? `${((anonymousConverted / anonymousStarted) * 100).toFixed(1)}%` : "0%";

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
        <div><p>ANONYMOUS FUNNEL</p><h2>匿名訪客使用情況</h2><span>只使用瀏覽器隨機編號，不記錄姓名、Email 或旅行內容</span></div>
      </div>
      <section className="admin-grid">
        <article><span>匿名訪客</span><strong>{anonymousVisitorsTotal}</strong><small>統計上線後的不重複瀏覽器</small></article>
        <article><span>近 7 天訪客</span><strong>{anonymousVisitorsWeek}</strong><small>近七天曾開啟網站</small></article>
        <article><span>按下新增旅行</span><strong>{anonymousStarted}</strong><small>有進一步使用意願</small></article>
        <article><span>完成登入</span><strong>{anonymousConverted}</strong><small>按新增後完成 Google 登入</small></article>
        <article><span>登入轉換率</span><strong>{conversionRate}</strong><small>完成登入 ÷ 按下新增旅行</small></article>
      </section>
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
    <aside className="admin-note"><b>資料與隱私說明</b><p>登入及匿名統計都從功能上線後開始累積，無法回推較早的訪客。匿名統計只使用瀏覽器產生的隨機編號；信箱及旅行資料只供網站管理、客服與搬家備份使用，請勿公開分享匯出的檔案。</p></aside>
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
