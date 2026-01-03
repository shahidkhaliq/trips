import { sql } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const users = sqliteTable("users", {
	id: integer("id").primaryKey({ autoIncrement: true }),
	name: text("name").notNull(),
	avatar: text("avatar"),
	greenCardDate: text("green_card_date").notNull(),
	citizenshipTrack: text("citizenship_track", {
		enum: ["5-year", "3-year"],
	}).notNull(),
	createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
});

export const trips = sqliteTable("trips", {
	id: integer("id").primaryKey({ autoIncrement: true }),
	userId: integer("user_id")
		.notNull()
		.references(() => users.id, { onDelete: "cascade" }),
	departureDate: text("departure_date").notNull(),
	returnDate: text("return_date").notNull(),
	destination: text("destination").notNull(),
	purpose: text("purpose"),
	createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
});

export const activityLog = sqliteTable("activity_log", {
	id: integer("id").primaryKey({ autoIncrement: true }),
	action: text("action").notNull(),
	entityType: text("entity_type").notNull(),
	entityId: integer("entity_id"),
	details: text("details"),
	createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Trip = typeof trips.$inferSelect;
export type NewTrip = typeof trips.$inferInsert;
export type ActivityLogEntry = typeof activityLog.$inferSelect;
export type NewActivityLogEntry = typeof activityLog.$inferInsert;
