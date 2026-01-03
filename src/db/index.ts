import { existsSync, mkdirSync } from "node:fs";
import path from "node:path";
import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";
import * as schema from "./schema";

const dbDir = "./data";
if (!existsSync(dbDir)) {
	mkdirSync(dbDir, { recursive: true });
}

const sqlite = new Database(`${dbDir}/trips.db`);
export const db = drizzle(sqlite, { schema });

const migrationsFolder = path.join(process.cwd(), "src/db/migrations");
if (existsSync(migrationsFolder)) {
	migrate(db, { migrationsFolder });
}
