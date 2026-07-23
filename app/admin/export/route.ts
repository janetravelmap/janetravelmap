import { getChatGPTUser } from "../../chatgpt-auth";
import { getDb } from "../../../db";
import { profiles, trips, users } from "../../../db/schema";

const ADMIN_EMAILS = new Set(["jane0928296300@gmail.com", "janetravelmap@gmail.com"]);

export async function GET() {
  const currentUser = await getChatGPTUser();
  if (!currentUser || !ADMIN_EMAILS.has(currentUser.email.toLowerCase())) {
    return Response.json({ error: "找不到頁面" }, { status: 404 });
  }

  const db = getDb();
  const [userRows, profileRows, tripRows] = await Promise.all([
    db.select().from(users),
    db.select().from(profiles),
    db.select().from(trips),
  ]);
  const generatedAt = new Date().toISOString();
  const filename = `janetravelmap-backup-${generatedAt.slice(0, 10)}.json`;

  return new Response(JSON.stringify({
    format: "janetravelmap-backup-v1",
    generatedAt,
    users: userRows,
    profiles: profileRows,
    trips: tripRows,
  }, null, 2), {
    headers: {
      "content-type": "application/json; charset=utf-8",
      "content-disposition": `attachment; filename="${filename}"`,
      "cache-control": "private, no-store",
      "x-content-type-options": "nosniff",
    },
  });
}
