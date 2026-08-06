export type Locale = "zh-TW" | "en" | "ja";

export const localeStorageKey = "janetravelmap-language";

export const localeLabels: Record<Locale, string> = {
  "zh-TW": "中文",
  en: "EN",
  ja: "日本語",
};

export function detectLocale(): Locale {
  if (typeof window === "undefined") return "zh-TW";
  const saved = localStorage.getItem(localeStorageKey);
  if (saved === "zh-TW" || saved === "en" || saved === "ja") return saved;
  const language = navigator.language.toLowerCase();
  if (language.startsWith("ja")) return "ja";
  if (language.startsWith("en")) return "en";
  return "zh-TW";
}

export const copy = {
  "zh-TW": {
    home: "回首頁", myFootprints: "我的旅行足跡", possessive: "的旅行足跡", mapOverview: "地圖總覽", records: "足跡紀錄", travelStats: "旅遊統計", countryStats: "國家統計",
    synced: "已同步", syncing: "同步中", pageColor: "頁面顏色", mapColor: "已去過國家的地圖顏色", map: "地圖", signOut: "登出", signIn: "使用 Google 登入建立足跡",
    themes: ["海洋藍", "薄荷綠", "珊瑚粉", "薰衣紫", "暖陽橘"], heroName: "我的", subtitle: "把走過的世界，收藏成自己的故事", visitedCountries: "已造訪國家", unvisitedCountries: "尚未造訪國家", addTrip: "新增旅行",
    worldMap: "依照實際國界繪製的世界地圖", visited: "已造訪", unvisited: "尚未造訪", zoomIn: "放大地圖", zoomOut: "縮小地圖", resetMap: "重設地圖位置",
    stories: "我的足跡紀錄", collections: "個收藏", year: "年份", country: "國家", allYears: "全部年份", allCountries: "全部國家", yearSuffix: "年", monthSuffix: "月", noTrips: "還沒有旅行足跡，按「新增旅行」收藏第一個去過的國家吧！", noMatches: "找不到符合條件的足跡紀錄。", loadMore: "載入更多紀錄", viewAll: "查看全部", recordsUnit: "筆紀錄", collapse: "收起完整紀錄",
    featured: "精選旅行回憶", noStory: "這趟旅行還沒寫下故事，留一個位置給未來的回憶。", editRecord: "編輯這筆紀錄", statsHelp: "選擇國家，看看去過哪些城市與次數", viewCountry: "查看國家", noVisits: "尚無造訪紀錄", times: "次", cityMapUnavailable: "這個國家的地圖輪廓暫時無法顯示，左側城市統計仍可正常使用。", showCities: "顯示城市位置", privacyNote: "定位時只會將「城市＋國家」傳給 OpenStreetMap，不包含姓名、Email、日期、備註或其他旅行內容。", consent: "同意並顯示城市圓點", locating: "正在定位城市…", statsEmpty: "新增旅行後，就能在這裡查看每個國家去過的城市與次數。",
    ad: "廣告", adTitle: "旅行好物與旅遊合作內容", adHint: "此處將顯示精選廣告", about: "關於網站", privacy: "隱私權政策", terms: "服務條款", contact: "聯絡我們",
    close: "關閉", editFootprint: "編輯旅行紀錄", newFootprint: "新增一段旅行", editHelp: "修改後，地圖與統計會同步更新。", newHelp: "把國家、城市與最想記住的片刻收藏起來。", chooseCountry: "請選擇國家", cities: "城市（可輸入多個）", cityExample: "例如：大阪／京都", travelYear: "旅行年份", travelMonth: "旅行月份", memory: "旅行回憶", memoryPlaceholder: "這趟旅程最難忘的是……", saveEdit: "儲存修改", saveTrip: "儲存旅行足跡", deleteTrip: "刪除這筆旅行紀錄", unknownCountry: "未知國家",
    namePrompt: "想在旅行足跡上顯示什麼名稱？", deleteConfirm: (name: string) => `確定要刪除「${name}」嗎？刪除後無法復原。`, cityMapLabel: (name: string) => `${name}城市造訪地圖`, visitedSuffix: "－已造訪",
  },
  en: {
    home: "Home", myFootprints: "My Travel Footprints", possessive: "’s Travel Footprints", mapOverview: "World Map", records: "Footprints", travelStats: "Travel Stats", countryStats: "Country Stats",
    synced: "Synced", syncing: "Syncing", pageColor: "Page color", mapColor: "Visited-country color", map: "Map", signOut: "Sign out", signIn: "Continue with Google",
    themes: ["Ocean Blue", "Mint Green", "Coral Pink", "Lavender", "Sunny Orange"], heroName: "My", subtitle: "Turn the world you’ve explored into stories worth keeping", visitedCountries: "Countries visited", unvisitedCountries: "Not yet visited", addTrip: "Add a trip",
    worldMap: "World map with current national boundaries", visited: "Visited", unvisited: "Not visited", zoomIn: "Zoom in", zoomOut: "Zoom out", resetMap: "Reset map",
    stories: "My Travel Footprints", collections: "saved", year: "Year", country: "Country", allYears: "All years", allCountries: "All countries", yearSuffix: "", monthSuffix: "", noTrips: "No footprints yet. Add the first country you’ve visited!", noMatches: "No matching travel records.", loadMore: "Load more", viewAll: "View all", recordsUnit: "records", collapse: "Show less",
    featured: "FEATURED MEMORY", noStory: "No story yet—save this space for a favorite memory.", editRecord: "Edit this record", statsHelp: "Choose a country to see the cities you visited", viewCountry: "Country", noVisits: "No visits yet", times: "×", cityMapUnavailable: "This country outline is unavailable, but the city list still works.", showCities: "Show city locations", privacyNote: "Only “city + country” is sent to OpenStreetMap. Your name, email, dates, notes and other travel details are never included.", consent: "Show city markers", locating: "Locating cities…", statsEmpty: "Add a trip to see your visited cities and counts here.",
    ad: "Ad", adTitle: "Travel finds and partner stories", adHint: "Selected ads will appear here", about: "About", privacy: "Privacy", terms: "Terms", contact: "Contact",
    close: "Close", editFootprint: "Edit travel record", newFootprint: "Add a trip", editHelp: "Your map and stats will update automatically.", newHelp: "Save the country, cities and moments you want to remember.", chooseCountry: "Choose a country", cities: "Cities (you can add more than one)", cityExample: "e.g. Osaka / Kyoto", travelYear: "Year", travelMonth: "Month", memory: "Travel memory", memoryPlaceholder: "The best part of this trip was…", saveEdit: "Save changes", saveTrip: "Save footprint", deleteTrip: "Delete this travel record", unknownCountry: "Unknown country",
    namePrompt: "What name should appear on your travel map?", deleteConfirm: (name: string) => `Delete “${name}”? This cannot be undone.`, cityMapLabel: (name: string) => `Visited cities in ${name}`, visitedSuffix: " — visited",
  },
  ja: {
    home: "ホーム", myFootprints: "わたしの旅の足あと", possessive: "の旅の足あと", mapOverview: "世界地図", records: "旅の記録", travelStats: "旅の統計", countryStats: "国別統計",
    synced: "同期済み", syncing: "同期中", pageColor: "テーマカラー", mapColor: "訪問済みの色", map: "地図", signOut: "ログアウト", signIn: "Googleでログイン",
    themes: ["オーシャンブルー", "ミントグリーン", "コーラルピンク", "ラベンダー", "サニーオレンジ"], heroName: "わたし", subtitle: "旅した世界を、自分だけの物語に", visitedCountries: "訪問した国", unvisitedCountries: "まだ訪れていない国", addTrip: "旅を追加",
    worldMap: "現在の国境に基づく世界地図", visited: "訪問済み", unvisited: "未訪問", zoomIn: "拡大", zoomOut: "縮小", resetMap: "地図をリセット",
    stories: "旅の足あと", collections: "件", year: "年", country: "国", allYears: "すべての年", allCountries: "すべての国", yearSuffix: "年", monthSuffix: "月", noTrips: "まだ旅の記録がありません。「旅を追加」から最初の国を登録しましょう！", noMatches: "条件に合う記録がありません。", loadMore: "もっと見る", viewAll: "全", recordsUnit: "件を見る", collapse: "閉じる",
    featured: "旅の思い出", noStory: "まだ物語がありません。思い出を書く場所を残しておきましょう。", editRecord: "この記録を編集", statsHelp: "国を選んで、訪れた都市と回数を確認", viewCountry: "国を選択", noVisits: "訪問記録なし", times: "回", cityMapUnavailable: "この国の輪郭は表示できませんが、都市一覧は利用できます。", showCities: "都市の位置を表示", privacyNote: "OpenStreetMapには「都市＋国」だけを送信します。氏名、メール、日付、メモなどは送信しません。", consent: "都市マーカーを表示", locating: "都市を検索中…", statsEmpty: "旅を追加すると、訪れた都市と回数を確認できます。",
    ad: "広告", adTitle: "旅のおすすめ・パートナー情報", adHint: "おすすめ広告が表示されます", about: "サイトについて", privacy: "プライバシー", terms: "利用規約", contact: "お問い合わせ",
    close: "閉じる", editFootprint: "旅の記録を編集", newFootprint: "旅を追加", editHelp: "変更すると地図と統計も更新されます。", newHelp: "国、都市、忘れたくない思い出を残しましょう。", chooseCountry: "国を選択", cities: "都市（複数入力できます）", cityExample: "例：大阪／京都", travelYear: "旅行した年", travelMonth: "旅行した月", memory: "旅の思い出", memoryPlaceholder: "この旅で一番心に残ったのは…", saveEdit: "変更を保存", saveTrip: "旅の足あとを保存", deleteTrip: "この旅行記録を削除", unknownCountry: "不明な国",
    namePrompt: "旅の足あとに表示する名前は？", deleteConfirm: (name: string) => `「${name}」を削除しますか？元に戻せません。`, cityMapLabel: (name: string) => `${name}で訪れた都市`, visitedSuffix: "・訪問済み",
  },
} as const;
