"use server";

import { desc } from "drizzle-orm";
import { db } from "@/db";
import { activityLog } from "@/db/schema";
import type { ActivityLogItem } from "@/lib/types";

export async function getActivityLog(): Promise<ActivityLogItem[]> {
	const entries = await db.select().from(activityLog).orderBy(desc(activityLog.createdAt));

	return entries.map((entry) => ({
		id: entry.id,
		action: entry.action,
		entityType: entry.entityType,
		entityId: entry.entityId,
		details: entry.details,
		createdAt: entry.createdAt,
	}));
}
