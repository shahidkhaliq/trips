import { existsSync, mkdirSync } from "node:fs";
import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import * as schema from "./schema";

const dbDir = "./data";
if (!existsSync(dbDir)) {
	mkdirSync(dbDir, { recursive: true });
}

const sqlite = new Database(`${dbDir}/trips.db`);
export const db = drizzle(sqlite, { schema });
