"use client";

import { CSSProperties, FormEvent, PointerEvent as ReactPointerEvent, useEffect, useMemo, useRef, useState } from "react";
import { geoNaturalEarth1, geoPath } from "d3-geo";
import { feature } from "topojson-client";
import type { GeometryCollection, Topology } from "topojson-specification";
import worldData from "world-atlas/countries-110m.json";
import isoCodeRows from "i18n-iso-countries/codes.json";

type Trip = { id: number; country: string; countryId?: string; city: string; date: string; note: string; color: string };
type Account = { displayName: string; email: string; theme: string; mapColor: string };

const starterTrips: Trip[] = [];
const storageKey = "janes-travel-footprints-v2";
const currentYear = new Date().getFullYear();
const travelYears = Array.from({ length: currentYear - 1899 }, (_, index) => String(currentYear - index));
const travelMonths = Array.from({ length: 12 }, (_, index) => String(index + 1).padStart(2, "0"));

const regionNames = new Intl.DisplayNames(["zh-TW"], { type: "region" });
const specialZhNames: Record<string, string> = { "N. Cyprus": "北賽普勒斯", Somaliland: "索馬利蘭", Kosovo: "科索沃" };
const alpha2ByNumeric = new Map(isoCodeRows.map((row) => [row[2], row[0]]));

const topology = worldData as unknown as Topology;
const worldCountries = feature(topology, topology.objects.countries as GeometryCollection).features
  .filter((country) => country.id !== "010")
  .map((country) => ({
    id: String(country.id).padStart(3, "0"),
    name: String(country.properties?.name ?? ""),
    label: (() => {
      const englishName = String(country.properties?.name ?? "");
      const alpha2 = alpha2ByNumeric.get(String(country.id).padStart(3, "0"));
      return (alpha2 ? regionNames.of(alpha2) : undefined) ?? specialZhNames[englishName] ?? englishName;
    })(),
    geometry: country,
  })).sort((a, b) => a.label.localeCompare(b.label, "zh-Hant"));

const projection = geoNaturalEarth1().fitExtent([[20, 18], [800, 410]], { type: "FeatureCollection", features: worldCountries.map((item) => item.geometry) });
const mapPath = geoPath(projection);

function resolveCountryId(countryName: string) {
  const normalized = countryName.trim().toLowerCase();
  return worldCountries.find((country) =>
    country.label.toLowerCase() === normalized || country.name.toLowerCase() === normalized
  )?.id;
}

export default function Home() {
  const [trips, setTrips] = useState<Trip[]>(() => {
    if (typeof window === "undefined") return starterTrips;
    const saved = localStorage.getItem(storageKey);
    if (!saved) return starterTrips;
    try {
      const savedTrips = JSON.parse(saved) as Trip[];
      return savedTrips.map((trip) => {
        const countryId = trip.countryId || resolveCountryId(trip.country);
        const translatedCountry = worldCountries.find((country) => country.id === countryId)?.label;
        return { ...trip, countryId, country: translatedCountry ?? trip.country };
      });
    } catch {
      return starterTrips;
    }
  });
  const [account, setAccount] = useState<Account | null>(null);
  const [cloudReady, setCloudReady] = useState(false);
  const [syncError, setSyncError] = useState("");
  const [selected, setSelected] = useState<Trip | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTrip, setEditingTrip] = useState<Trip | null>(null);
  const [mapZoom, setMapZoom] = useState(1);
  const [mapPan, setMapPan] = useState({ x: 0, y: 0 });
  const [statsCountryId, setStatsCountryId] = useState("");
  const [showAllRecords, setShowAllRecords] = useState(false);
  const [recordYear, setRecordYear] = useState("all");
  const [recordCountryId, setRecordCountryId] = useState("all");
  const [visibleRecordCount, setVisibleRecordCount] = useState(12);
  const dragStart = useRef<{ pointerX: number; pointerY: number; panX: number; panY: number } | null>(null);

  useEffect(() => {
    let active = true;
    async function loadCloudTrips() {
      try {
        const response = await fetch("/api/trips", { cache: "no-store" });
        if (response.status === 401) { setTrips([]); setCloudReady(true); return; }
        if (!response.ok) throw new Error("load failed");
        const data = await response.json() as { trips: Trip[]; user: Account };
        if (!active) return;
        setAccount(data.user);
        if (data.trips.length) setTrips(data.trips);
        else {
          let local: Trip[] = [];
          try { local = JSON.parse(localStorage.getItem(storageKey) ?? "[]") as Trip[]; } catch { local = []; }
          if (local.length) {
            const migrated = await fetch("/api/trips", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ trips: local }) });
            if (!migrated.ok) throw new Error("migration failed");
            const result = await migrated.json() as { trips: Trip[] };
            if (active) setTrips(result.trips);
          } else setTrips([]);
        }
        if (active) setCloudReady(true);
      } catch { if (active) { setSyncError("雲端同步暫時失敗，請重新整理再試一次。"); setCloudReady(true); } }
    }
    loadCloudTrips();
    return () => { active = false; };
  }, []);


  const filtered = useMemo(() => [...trips]
    .sort((a, b) => b.date.localeCompare(a.date) || b.id - a.id), [trips]);
  const countries = useMemo(() => new Set(trips.map((trip) => trip.country.trim())).size, [trips]);
  const visitedIds = useMemo(() => new Set(trips.map((trip) => trip.countryId).filter(Boolean)), [trips]);
  const visitedCountryOptions = useMemo(() => worldCountries.filter((country) => visitedIds.has(country.id)), [visitedIds]);
  const activeStatsCountryId = statsCountryId || visitedCountryOptions[0]?.id || "";
  const cityStats = useMemo(() => {
    const counts = new Map<string, number>();
    trips.filter((trip) => trip.countryId === activeStatsCountryId).forEach((trip) => {
      trip.city.split(/[・、,，/]/).map((city) => city.trim()).filter(Boolean).forEach((city) => counts.set(city, (counts.get(city) ?? 0) + 1));
    });
    return [...counts.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], "zh-Hant"));
  }, [trips, activeStatsCountryId]);
  const statsCountryName = worldCountries.find((country) => country.id === activeStatsCountryId)?.label;
  const recordYears = useMemo(() => [...new Set(trips.map((trip) => trip.date.slice(0, 4)))].filter(Boolean).sort((a, b) => b.localeCompare(a)), [trips]);
  const expandedRecords = showAllRecords;
  const archiveRecords = useMemo(() => filtered.filter((trip) =>
    (recordYear === "all" || trip.date.startsWith(recordYear)) &&
    (recordCountryId === "all" || trip.countryId === recordCountryId)
  ), [filtered, recordYear, recordCountryId]);
  const displayedRecords = expandedRecords ? archiveRecords.slice(0, visibleRecordCount) : filtered.slice(0, 8);

  async function saveTrip(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const countryId = String(data.get("countryId"));
    const countryName = worldCountries.find((item) => item.id === countryId)?.label ?? "未知國家";
    const trip: Trip = {
      id: editingTrip?.id ?? 0, country: countryName, countryId, city: String(data.get("city")),
      date: `${String(data.get("year"))}.${String(data.get("month"))}`, note: String(data.get("note")), color: "#147fe5",
    };
    try {
      setSyncError("");
      const response = await fetch("/api/trips", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ trip }) });
      let savedTrip: Trip | undefined;
      if (response.ok) {
        try {
          const result = await response.json() as { trip?: Trip };
          savedTrip = result.trip;
        } catch {
          savedTrip = undefined;
        }
      }

      if (!savedTrip) {
        const refresh = await fetch("/api/trips", { cache: "no-store" });
        if (!refresh.ok) throw new Error("save verification failed");
        const cloud = await refresh.json() as { trips: Trip[]; user: Account };
        savedTrip = editingTrip
          ? cloud.trips.find((item) => item.id === editingTrip.id)
          : cloud.trips.find((item) =>
              item.countryId === trip.countryId &&
              item.city === trip.city &&
              item.date === trip.date &&
              item.note === trip.note
            );
        if (!savedTrip) throw new Error("saved trip not found");
        setTrips(cloud.trips);
        setAccount(cloud.user);
      } else {
        setTrips((current) => editingTrip ? current.map((item) => item.id === editingTrip.id ? savedTrip! : item) : [savedTrip!, ...current]);
      }
      setSelected(savedTrip); setEditingTrip(null); setModalOpen(false);
    } catch { setSyncError("這筆紀錄尚未儲存，請確認網路後再試一次。"); }
  }

  async function deleteTrip() {
    if (!editingTrip) return;
    if (!window.confirm(`確定要刪除「${editingTrip.country} · ${editingTrip.city}」嗎？刪除後無法復原。`)) return;
    try {
      setSyncError("");
      const response = await fetch("/api/trips", {
        method: "DELETE",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ id: editingTrip.id }),
      });
      if (!response.ok) throw new Error("delete failed");
      setTrips((current) => current.filter((trip) => trip.id !== editingTrip.id));
      if (selected?.id === editingTrip.id) setSelected(null);
      setEditingTrip(null);
      setModalOpen(false);
    } catch {
      setSyncError("這筆紀錄沒有刪除成功，請確認網路後再試一次。");
    }
  }

  async function changeDisplayName() {
    const nextName = window.prompt("想在旅行足跡上顯示什麼名稱？", account?.displayName ?? "");
    if (!nextName?.trim()) return;
    try {
      const response = await fetch("/api/trips", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ profileName: nextName }) });
      if (!response.ok) throw new Error("profile failed");
      const result = await response.json() as { user: Account };
      setAccount(result.user);
    } catch { setSyncError("名稱沒有更新成功，請稍後再試。"); }
  }

  async function changeTheme(theme: string) {
    if (!account) return;
    const previous = account;
    setAccount({ ...account, theme });
    try {
      const response = await fetch("/api/trips", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ profileTheme: theme }) });
      if (!response.ok) throw new Error("theme failed");
      const result = await response.json() as { user: Account };
      setAccount(result.user);
    } catch { setAccount(previous); setSyncError("顏色沒有更新成功，請稍後再試。"); }
  }

  async function changeMapColor(mapColor: string) {
    if (!account) return;
    const previous = account;
    setAccount({ ...account, mapColor });
    try {
      const response = await fetch("/api/trips", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ mapColor }) });
      if (!response.ok) throw new Error("map color failed");
      const result = await response.json() as { user: Account };
      setAccount(result.user);
    } catch { setAccount(previous); setSyncError("地圖顏色沒有更新成功，請稍後再試。"); }
  }

  function openNewTrip() {
    if (!account) { window.location.href = "/signin-with-chatgpt?return_to=%2F"; return; }
    setEditingTrip(null);
    setModalOpen(true);
  }

  function openEditTrip(trip: Trip) {
    setEditingTrip(trip);
    setModalOpen(true);
  }

  function startPan(event: ReactPointerEvent<SVGSVGElement>) {
    if (mapZoom <= 1) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    dragStart.current = { pointerX: event.clientX, pointerY: event.clientY, panX: mapPan.x, panY: mapPan.y };
  }

  function movePan(event: ReactPointerEvent<SVGSVGElement>) {
    if (!dragStart.current) return;
    const limit = 150 * (mapZoom - 1);
    setMapPan({
      x: Math.max(-limit, Math.min(limit, dragStart.current.panX + event.clientX - dragStart.current.pointerX)),
      y: Math.max(-limit * .65, Math.min(limit * .65, dragStart.current.panY + event.clientY - dragStart.current.pointerY)),
    });
  }

  function stopPan(event: ReactPointerEvent<SVGSVGElement>) {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
    dragStart.current = null;
  }

  function changeZoom(nextZoom: number) {
    const zoom = Math.max(1, Math.min(2.2, nextZoom));
    setMapZoom(zoom);
    if (zoom === 1) setMapPan({ x: 0, y: 0 });
  }

  return (
    <main data-theme={account?.theme || "blue"} style={{ "--visited-color": account?.mapColor || "#147fe5" } as CSSProperties}>
      <header className="topbar">
        <a className="brand" href="#top" aria-label="回首頁"><span className="brand-mark">◎</span><span>{account ? `${account.displayName} 的旅行足跡` : "我的旅行足跡"}</span></a>
        <nav><a className="active" href="#map">地圖總覽</a><a href="#footprints">足跡紀錄</a><a href="#travel-stats">旅遊統計</a><a href="#stats">國家統計</a></nav>
        {account ? <div className="profile"><span className="cloud-state">☁ {cloudReady ? "已同步" : "同步中"}</span><label className="theme-picker" title="頁面顏色"><span>●</span><select value={account.theme || "blue"} onChange={(event) => changeTheme(event.target.value)} aria-label="選擇頁面顏色"><option value="blue">海洋藍</option><option value="teal">薄荷綠</option><option value="rose">珊瑚粉</option><option value="violet">薰衣紫</option><option value="amber">暖陽橘</option></select></label><label className="map-color-picker" title="已去過國家的地圖顏色"><span>地圖</span><input type="color" value={account.mapColor || "#147fe5"} onChange={(event) => changeMapColor(event.target.value)} aria-label="選擇已去過國家的地圖顏色" /></label><span className="avatar">{account.displayName.slice(0, 1).toUpperCase()}</span><button className="profile-name" onClick={changeDisplayName}>{account.displayName} ✎</button><a className="signout" href="/auth/logout?return_to=%2F">登出</a></div> : <a className="signin-button" href="/auth/google?return_to=%2F">使用 Google 登入建立足跡</a>}
      </header>

      <section id="top" className="hero">
        <div className="intro">
          <p className="eyebrow">MY TRAVEL ATLAS · 2026</p>
          <h1>{account?.displayName || "我的"}的<br />旅行足跡</h1>
          <p className="subtitle">把走過的世界，收藏成自己的故事</p>
          <div className="stats" id="stats"><div><strong>{countries}</strong><span>已造訪國家</span></div><i /><div><strong>{Math.max(0, worldCountries.length - countries)}</strong><span>尚未造訪國家</span></div></div>
          <button className="primary" onClick={openNewTrip}><span>＋</span> 新增旅行</button>
          <div className="route-line"><span>●</span><i /><b>✈</b></div>
          {syncError && <p className="sync-error" role="alert">{syncError}</p>}
        </div>

        <div className="map-panel" id="map">
          <div className="map-wash" />
          <svg className={`world-map ${mapZoom > 1 ? "can-pan" : ""}`} viewBox="0 0 820 430" role="img" aria-label="依照實際國界繪製的世界地圖" onPointerDown={startPan} onPointerMove={movePan} onPointerUp={stopPan} onPointerCancel={stopPan}>
            <g className="map-countries" style={{ transform: `translate(${mapPan.x}px, ${mapPan.y}px) scale(${mapZoom})`, transformOrigin: "center" }}>
              {worldCountries.map((country) => <path key={country.id} d={mapPath(country.geometry) ?? ""} className={visitedIds.has(country.id) ? "visited" : "land"}>
                <title>{country.label}{visitedIds.has(country.id) ? "－已造訪" : ""}</title>
              </path>)}
            </g>
          </svg>
          <div className="zoom"><button aria-label="放大地圖" onClick={() => changeZoom(mapZoom + .25)}>＋</button><button aria-label="縮小地圖" onClick={() => changeZoom(mapZoom - .25)}>−</button><button aria-label="重設地圖位置" onClick={() => { setMapZoom(1); setMapPan({ x: 0, y: 0 }); }}>↺</button></div>
          <div className="legend"><span><i className="dot visited-dot"/>已造訪</span><span><i className="dot unexplored-dot"/>尚未造訪</span></div>
        </div>
      </section>

      <section className="content" id="footprints">
        <div className="section-heading"><div><p>TRAVEL STORIES</p><h2>我的足跡紀錄</h2></div><span>{expandedRecords ? archiveRecords.length : filtered.length} 個收藏</span></div>
        {expandedRecords && <div className="record-filters"><label>年份<select value={recordYear} onChange={(event) => { setRecordYear(event.target.value); setVisibleRecordCount(12); }}><option value="all">全部年份</option>{recordYears.map((year) => <option key={year} value={year}>{year} 年</option>)}</select></label><label>國家<select value={recordCountryId} onChange={(event) => { setRecordCountryId(event.target.value); setVisibleRecordCount(12); }}><option value="all">全部國家</option>{visitedCountryOptions.map((country) => <option key={country.id} value={country.id}>{country.label}</option>)}</select></label></div>}
        <div className="cards">
          {displayedRecords.map((trip) => <button key={trip.id} className={`trip-card ${selected?.id === trip.id ? "selected" : ""}`} onClick={() => setSelected(trip)}>
            <span className="card-icon" style={{background: `${trip.color}18`, color: trip.color}}>⌖</span>
            <span className="card-copy"><small>{trip.date}</small><strong>{trip.country}</strong><em>{trip.city}</em></span><span className="arrow">›</span>
          </button>)}
          {!displayedRecords.length && <div className="empty">{trips.length === 0 ? "還沒有旅行足跡，按「新增旅行」收藏第一個去過的國家吧！" : "找不到符合條件的足跡紀錄。"}</div>}
        </div>
        {expandedRecords && archiveRecords.length > visibleRecordCount && <button className="records-action" onClick={() => setVisibleRecordCount((count) => count + 12)}>載入更多紀錄</button>}
        {!expandedRecords && filtered.length > 8 && <button className="records-action" onClick={() => { setShowAllRecords(true); setVisibleRecordCount(12); }}>查看全部 {filtered.length} 筆紀錄</button>}
        {showAllRecords && <button className="records-collapse" onClick={() => { setShowAllRecords(false); setRecordYear("all"); setRecordCountryId("all"); setVisibleRecordCount(12); }}>收起完整紀錄</button>}
        {selected && <article className="memory"><div><span>精選旅行回憶</span><h3>{selected.country} · {selected.city}</h3><p>{selected.note || "這趟旅行還沒寫下故事，留一個位置給未來的回憶。"}</p><button className="edit-trip" onClick={() => openEditTrip(selected)}>✎ 編輯這筆紀錄</button></div><div className="memory-stamp">{selected.date}<br/><b>{account?.displayName?.toUpperCase() || "ME"}</b></div></article>}
      </section>

      <section className="travel-stats" id="travel-stats">
        <div className="travel-stats-head"><div><p>TRAVEL STATISTICS</p><h2>旅遊統計</h2><span>選擇國家，看看去過哪些城市與次數</span></div>
          <label>查看國家<select value={activeStatsCountryId} onChange={(event) => setStatsCountryId(event.target.value)} disabled={!visitedCountryOptions.length}>{visitedCountryOptions.length ? visitedCountryOptions.map((country) => <option key={country.id} value={country.id}>{country.label}</option>) : <option value="">尚無造訪紀錄</option>}</select></label>
        </div>
        {cityStats.length ? <div className="city-stats-grid">{cityStats.map(([city, count], index) => <article key={city}><span>{String(index + 1).padStart(2, "0")}</span><div><strong>{city}</strong><small>{statsCountryName}</small></div><b>{count}<em>次</em></b></article>)}</div> : <div className="stats-empty">新增旅行後，就能在這裡查看每個國家去過的城市與次數。</div>}
      </section>

      <aside className="ad-strip" aria-label="廣告版位">
        <span>廣告</span><p>旅行好物與旅遊合作內容</p><small>此處將顯示精選廣告</small>
      </aside>

      <footer className="site-footer"><span>© 2026 旅行足跡</span><nav><a href="/about">關於網站</a><a href="/privacy">隱私權政策</a><a href="/terms">服務條款</a><a href="/contact">聯絡我們</a></nav></footer>

      {modalOpen && <div className="modal-backdrop" onMouseDown={() => { setModalOpen(false); setEditingTrip(null); }}><div className="modal" onMouseDown={(e) => e.stopPropagation()}>
        <button className="close" onClick={() => { setModalOpen(false); setEditingTrip(null); }} aria-label="關閉">×</button><p className="eyebrow">{editingTrip ? "EDIT FOOTPRINT" : "NEW FOOTPRINT"}</p><h2>{editingTrip ? "編輯旅行紀錄" : "新增一段旅行"}</h2><p>{editingTrip ? "修改後，地圖與統計會同步更新。" : "把國家、城市與最想記住的片刻收藏起來。"}</p>
        <form key={editingTrip?.id ?? "new"} onSubmit={saveTrip}><label>國家<select name="countryId" required defaultValue={editingTrip?.countryId ?? resolveCountryId(editingTrip?.country ?? "") ?? ""}><option value="" disabled>請選擇國家</option>{worldCountries.map((country) => <option key={country.id} value={country.id}>{country.label}</option>)}</select></label><label>城市（可輸入多個）<input name="city" placeholder="例如：大阪／京都" required defaultValue={editingTrip?.city ?? ""} /></label><div className="date-fields"><label>旅行年份<select name="year" required defaultValue={editingTrip?.date.slice(0, 4) ?? String(currentYear)}>{travelYears.map((year) => <option key={year} value={year}>{year} 年</option>)}</select></label><label>旅行月份<select name="month" required defaultValue={editingTrip?.date.slice(5, 7) || "01"}>{travelMonths.map((month) => <option key={month} value={month}>{Number(month)} 月</option>)}</select></label></div><label>旅行回憶<textarea name="note" placeholder="這趟旅程最難忘的是……" rows={3} defaultValue={editingTrip?.note ?? ""}/></label><button className="primary" type="submit">{editingTrip ? "儲存修改" : "儲存旅行足跡"}</button></form>
        {editingTrip && <button className="delete-trip" type="button" onClick={deleteTrip}>刪除這筆旅行紀錄</button>}
      </div></div>}
    </main>
  );
}
