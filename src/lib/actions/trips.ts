"use server";

import { format } from "date-fns";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { activityLog, trips, users } from "@/db/schema";

export async function createTrip(
	userId: number,
	departureDate: string,
	returnDate: string,
	destination: string,
	purpose?: string
): Promise<{ success: boolean; tripId?: number; error?: string }> {
	try {
		const user = await db.select().from(users).where(eq(users.id, userId));

		if (!user.length) {
			return { success: false, error: "User not found" };
		}

		const result = await db
			.insert(trips)
			.values({
				userId,
				departureDate,
				returnDate,
				destination,
				purpose: purpose || null,
			})
			.returning({ id: trips.id });

		const tripId = result[0].id;
		const depDate = format(new Date(departureDate), "MMM d, yyyy");
		const retDate = format(new Date(returnDate), "MMM d, yyyy");

		await db.insert(activityLog).values({
			action: "created",
			entityType: "trip",
			entityId: tripId,
			details: `Added trip for ${user[0].name}: ${destination} (${depDate} - ${retDate})`,
		});

		revalidatePath("/");
		return { success: true, tripId };
	} catch (error) {
		console.error("Failed to create trip:", error);
		return { success: false, error: "Failed to create trip" };
	}
}

export async function deleteTrip(tripId: number): Promise<{ success: boolean; error?: string }> {
	try {
		const trip = await db.select().from(trips).where(eq(trips.id, tripId));

		if (!trip.length) {
			return { success: false, error: "Trip not found" };
		}

		const user = await db.select().from(users).where(eq(users.id, trip[0].userId));
		const userName = user.length ? user[0].name : "Unknown user";
		const depDate = format(new Date(trip[0].departureDate), "MMM d, yyyy");
		const retDate = format(new Date(trip[0].returnDate), "MMM d, yyyy");

		await db.delete(trips).where(eq(trips.id, tripId));

		await db.insert(activityLog).values({
			action: "deleted",
			entityType: "trip",
			entityId: tripId,
			details: `Deleted trip for ${userName}: ${trip[0].destination} (${depDate} - ${retDate})`,
		});

		revalidatePath("/");
		return { success: true };
	} catch (error) {
		console.error("Failed to delete trip:", error);
		return { success: false, error: "Failed to delete trip" };
	}
}
