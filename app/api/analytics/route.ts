import { eq } from "drizzle-orm";
import { getDb } from "../../../db";
import { ensureAnonymousVisitorsTable } from "../../../db/anonymous";
import { anonymousVisitors } from "../../../db/schema";

type AnalyticsEvent = "visit" | "start" | "convert";
const visitorIdPattern = /^[0-9a-f-]{36}$/i;

export async function POST(request: Request) {
  const payload = await request.json() as { visitorId?: string; event?: AnalyticsEvent };
  const visitorId = payload.visitorId?.trim() ?? "";
  const event = payload.event;
  if (!visitorIdPattern.test(visitorId) || !["visit", "start", "convert"].includes(event ?? "")) {
    return Response.json({ error: "匿名統計資料無效" }, { status: 400 });
  }

  await ensureAnonymousVisitorsTable();
  const db = getDb();
  const now = new Date().toISOString();
  const [existing] = await db.select().from(anonymousVisitors)
    .where(eq(anonymousVisitors.visitorId, visitorId)).limit(1);

  if (!existing) {
    await db.insert(anonymousVisitors).values({
      visitorId,
      firstSeenAt: now,
      lastSeenAt: now,
      startedAt: event === "start" ? now : null,
      convertedAt: event === "convert" ? now : null,
    });
  } else {
    await db.update(anonymousVisitors).set({
      lastSeenAt: now,
      startedAt: event === "start" && !existing.startedAt ? now : existing.startedAt,
      convertedAt: event === "convert" && !existing.convertedAt ? now : existing.convertedAt,
    }).where(eq(anonymousVisitors.visitorId, visitorId));
  }
  return Response.json({ ok: true });
}
