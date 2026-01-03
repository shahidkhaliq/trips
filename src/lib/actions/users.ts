"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { activityLog, trips, users } from "@/db/schema";
import type { CitizenshipTrack, UserWithTrips } from "@/lib/types";

export async function getUsers(): Promise<UserWithTrips[]> {
	const allUsers = await db.select().from(users).orderBy(users.name);
	const allTrips = await db.select().from(trips).orderBy(trips.departureDate);

	return allUsers.map((user) => ({
		id: user.id,
		name: user.name,
		avatar: user.avatar,
		greenCardDate: user.greenCardDate,
		citizenshipTrack: user.citizenshipTrack as CitizenshipTrack,
		createdAt: user.createdAt,
		trips: allTrips
			.filter((trip) => trip.userId === user.id)
			.map((trip) => ({
				id: trip.id,
				userId: trip.userId,
				departureDate: trip.departureDate,
				returnDate: trip.returnDate,
				destination: trip.destination,
				purpose: trip.purpose,
				createdAt: trip.createdAt,
			})),
	}));
}

export async function createUser(
	name: string,
	greenCardDate: string,
	citizenshipTrack: CitizenshipTrack,
	avatar?: string
): Promise<{ success: boolean; userId?: number; error?: string }> {
	try {
		const result = await db
			.insert(users)
			.values({
				name,
				avatar: avatar || null,
				greenCardDate,
				citizenshipTrack,
			})
			.returning({ id: users.id });

		const userId = result[0].id;

		await db.insert(activityLog).values({
			action: "created",
			entityType: "user",
			entityId: userId,
			details: `Created user: ${name}`,
		});

		revalidatePath("/");
		return { success: true, userId };
	} catch (error) {
		console.error("Failed to create user:", error);
		return { success: false, error: "Failed to create user" };
	}
}

export async function updateUser(
	userId: number,
	name: string,
	greenCardDate: string,
	citizenshipTrack: CitizenshipTrack,
	avatar?: string | null
): Promise<{ success: boolean; error?: string }> {
	try {
		const existingUser = await db.select().from(users).where(eq(users.id, userId));

		if (!existingUser.length) {
			return { success: false, error: "User not found" };
		}

		await db
			.update(users)
			.set({
				name,
				greenCardDate,
				citizenshipTrack,
				avatar: avatar === undefined ? existingUser[0].avatar : avatar,
			})
			.where(eq(users.id, userId));

		await db.insert(activityLog).values({
			action: "updated",
			entityType: "user",
			entityId: userId,
			details: `Updated user: ${name}`,
		});

		revalidatePath("/");
		return { success: true };
	} catch (error) {
		console.error("Failed to update user:", error);
		return { success: false, error: "Failed to update user" };
	}
}

export async function deleteUser(userId: number): Promise<{ success: boolean; error?: string }> {
	try {
		const user = await db.select().from(users).where(eq(users.id, userId));

		if (!user.length) {
			return { success: false, error: "User not found" };
		}

		const userName = user[0].name;

		await db.delete(users).where(eq(users.id, userId));

		await db.insert(activityLog).values({
			action: "deleted",
			entityType: "user",
			entityId: userId,
			details: `Deleted user: ${userName}`,
		});

		revalidatePath("/");
		return { success: true };
	} catch (error) {
		console.error("Failed to delete user:", error);
		return { success: false, error: "Failed to delete user" };
	}
}
