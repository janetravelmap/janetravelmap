import { and, desc, eq } from "drizzle-orm";
import { getChatGPTUser } from "../../chatgpt-auth";
import { getDb } from "../../../db";
import { profiles, trips, users } from "../../../db/schema";

type TripInput = { id?: number; country?: string; countryId?: string; city?: string; date?: string; note?: string; color?: string };
const clean = (input: TripInput) => ({ country: input.country?.trim() ?? "", countryId: input.countryId?.trim() ?? "", city: input.city?.trim() ?? "", date: input.date?.trim() ?? "", note: input.note?.trim() ?? "", color: input.color?.trim() || "#147fe5" });

export async function GET() {
  const user = await getChatGPTUser();
  if (!user) return Response.json({ error: "請先登入" }, { status: 401 });
  const db = getDb();
  const now = new Date().toISOString();
  await db.insert(users).values({ ownerEmail: user.email, firstSeenAt: now, lastSeenAt: now }).onConflictDoUpdate({ target: users.ownerEmail, set: { lastSeenAt: now } });
  const rows = await db.select().from(trips).where(eq(trips.ownerEmail, user.email)).orderBy(desc(trips.date), desc(trips.id));
  const [profile] = await db.select().from(profiles).where(eq(profiles.ownerEmail, user.email)).limit(1);
  const suggestedName = user.email === "jane0928296300@gmail.com" ? "Jane" : (user.fullName || user.email.split("@")[0] || "我");
  return Response.json({ trips: rows, user: { displayName: profile?.displayName || suggestedName, email: user.email, theme: profile?.theme || "blue", mapColor: profile?.mapColor || "#147fe5" } });
}

export async function POST(request: Request) {
  const user = await getChatGPTUser();
  if (!user) return Response.json({ error: "請先登入" }, { status: 401 });
  const payload = await request.json() as { trip?: TripInput; trips?: TripInput[]; profileName?: string; profileTheme?: string; mapColor?: string };
  const db = getDb();
  if (typeof payload.profileName === "string" || typeof payload.profileTheme === "string" || typeof payload.mapColor === "string") {
    const [current] = await db.select().from(profiles).where(eq(profiles.ownerEmail, user.email)).limit(1);
    const suggestedName = user.email === "jane0928296300@gmail.com" ? "Jane" : (user.fullName || user.email.split("@")[0] || "我");
    const displayName = (payload.profileName ?? current?.displayName ?? suggestedName).trim().slice(0, 30);
    const theme = ["blue", "teal", "rose", "violet", "amber"].includes(payload.profileTheme ?? "") ? payload.profileTheme! : (current?.theme || "blue");
    const mapColor = /^#[0-9a-f]{6}$/i.test(payload.mapColor ?? "") ? payload.mapColor! : (current?.mapColor || "#147fe5");
    if (!displayName) return Response.json({ error: "名稱不可空白" }, { status: 400 });
    await db.insert(profiles).values({ ownerEmail: user.email, displayName, theme, mapColor }).onConflictDoUpdate({ target: profiles.ownerEmail, set: { displayName, theme, mapColor } });
    return Response.json({ user: { displayName, email: user.email, theme, mapColor } });
  }
  if (Array.isArray(payload.trips)) {
    const existing = await db.select({ id: trips.id }).from(trips).where(eq(trips.ownerEmail, user.email)).limit(1);
    if (!existing.length) {
      const values = payload.trips.map(clean).filter((trip) => trip.country && trip.countryId && trip.city && trip.date).map((trip) => ({ ...trip, ownerEmail: user.email }));
      if (values.length) await db.insert(trips).values(values);
    }
    const rows = await db.select().from(trips).where(eq(trips.ownerEmail, user.email)).orderBy(desc(trips.date), desc(trips.id));
    return Response.json({ trips: rows });
  }
  const input = clean(payload.trip ?? {});
  if (!input.country || !input.countryId || !input.city || !input.date) return Response.json({ error: "旅行資料不完整" }, { status: 400 });
  const requestedId = Number(payload.trip?.id);
  if (Number.isInteger(requestedId) && requestedId > 0) {
    const [updated] = await db.update(trips).set(input).where(and(eq(trips.id, requestedId), eq(trips.ownerEmail, user.email))).returning();
    if (updated) return Response.json({ trip: updated });
  }
  const [created] = await db.insert(trips).values({ ...input, ownerEmail: user.email }).returning();
  return Response.json({ trip: created }, { status: 201 });
}

export async function DELETE(request: Request) {
  const user = await getChatGPTUser();
  if (!user) return Response.json({ error: "請先登入" }, { status: 401 });
  const payload = await request.json() as { id?: number };
  const id = Number(payload.id);
  if (!Number.isInteger(id) || id <= 0) {
    return Response.json({ error: "旅行紀錄編號無效" }, { status: 400 });
  }
  const [deleted] = await getDb().delete(trips)
    .where(and(eq(trips.id, id), eq(trips.ownerEmail, user.email)))
    .returning({ id: trips.id });
  if (!deleted) return Response.json({ error: "找不到這筆旅行紀錄" }, { status: 404 });
  return Response.json({ deletedId: deleted.id });
}
