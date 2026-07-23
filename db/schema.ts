import { index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const profiles = sqliteTable("profiles", {
  ownerEmail: text("owner_email").primaryKey(),
  displayName: text("display_name").notNull(),
  theme: text("theme").notNull().default("blue"),
  mapColor: text("map_color").notNull().default("#147fe5"),
});

export const users = sqliteTable("users", {
  ownerEmail: text("owner_email").primaryKey(),
  firstSeenAt: text("first_seen_at").notNull(),
  lastSeenAt: text("last_seen_at").notNull(),
}, (table) => [index("users_last_seen_idx").on(table.lastSeenAt)]);

export const sessions = sqliteTable("sessions", {
  tokenHash: text("token_hash").primaryKey(),
  ownerEmail: text("owner_email").notNull(),
  fullName: text("full_name"),
  expiresAt: text("expires_at").notNull(),
  createdAt: text("created_at").notNull(),
}, (table) => [
  index("sessions_owner_idx").on(table.ownerEmail),
  index("sessions_expires_idx").on(table.expiresAt),
]);

export const trips = sqliteTable("trips", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  ownerEmail: text("owner_email").notNull(),
  country: text("country").notNull(),
  countryId: text("country_id").notNull(),
  city: text("city").notNull(),
  date: text("date").notNull(),
  note: text("note").notNull().default(""),
  color: text("color").notNull().default("#147fe5"),
}, (table) => [index("trips_owner_date_idx").on(table.ownerEmail, table.date)]);
