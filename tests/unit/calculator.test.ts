import { addDays, addYears, differenceInDays, format, parseISO, subDays, subYears } from "date-fns";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { calculateUserStats, formatDaysRemaining } from "@/lib/calculator";
import type { TripData } from "@/lib/types";

const TODAY = new Date("2025-01-02");

function createTrip(
	id: number,
	departureDate: string,
	returnDate: string,
	destination = "Test Country"
): TripData {
	return {
		id,
		userId: 1,
		departureDate,
		returnDate,
		destination,
		purpose: null,
		createdAt: null,
	};
}

function formatDate(date: Date): string {
	return format(date, "yyyy-MM-dd");
}

describe("calculateUserStats", () => {
	beforeEach(() => {
		vi.useFakeTimers();
		vi.setSystemTime(TODAY);
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	describe("Basic Eligibility (no trips)", () => {
		it("calculates 5-year track eligibility for new green card holder", () => {
			const greenCardDate = formatDate(TODAY);
			const stats = calculateUserStats(greenCardDate, "5-year", []);

			const gcDate = parseISO(greenCardDate);
			const expectedEligibilityDate = addYears(gcDate, 5);
			const expectedDays = differenceInDays(expectedEligibilityDate, TODAY);

			expect(stats.daysToEligibility).toBe(expectedDays);
			expect(stats.physicalPresenceRequired).toBe(913);
			expect(stats.physicalPresenceMet).toBe(0);
			expect(stats.daysAsGreenCardHolder).toBe(0);
			expect(stats.hasWarnings).toBe(false);
		});

		it("calculates 3-year track eligibility for new green card holder", () => {
			const greenCardDate = formatDate(TODAY);
			const stats = calculateUserStats(greenCardDate, "3-year", []);

			const gcDate = parseISO(greenCardDate);
			const expectedEligibilityDate = addYears(gcDate, 3);
			const expectedDays = differenceInDays(expectedEligibilityDate, TODAY);

			expect(stats.daysToEligibility).toBe(expectedDays);
			expect(stats.physicalPresenceRequired).toBe(548);
			expect(stats.physicalPresenceMet).toBe(0);
			expect(stats.daysAsGreenCardHolder).toBe(0);
			expect(stats.hasWarnings).toBe(false);
		});

		it("shows zero days to eligibility for already eligible user (5-year track)", () => {
			const greenCardDate = formatDate(subYears(TODAY, 6));
			const stats = calculateUserStats(greenCardDate, "5-year", []);

			expect(stats.daysToEligibility).toBe(0);
			expect(stats.physicalPresenceMet).toBeGreaterThanOrEqual(stats.physicalPresenceRequired);
		});

		it("shows zero days to eligibility for already eligible user (3-year track)", () => {
			const greenCardDate = formatDate(subYears(TODAY, 4));
			const stats = calculateUserStats(greenCardDate, "3-year", []);

			expect(stats.daysToEligibility).toBe(0);
			expect(stats.physicalPresenceMet).toBeGreaterThanOrEqual(stats.physicalPresenceRequired);
		});

		it("calculates canApplyDate as 90 days before eligibilityDate", () => {
			const greenCardDate = formatDate(TODAY);
			const stats = calculateUserStats(greenCardDate, "5-year", []);

			const expectedCanApplyDate = addDays(stats.eligibilityDate, -90);
			expect(stats.canApplyDate.getTime()).toBe(expectedCanApplyDate.getTime());
		});
	});

	describe("Physical Presence Calculations", () => {
		it("counts physical presence as days since green card when no trips", () => {
			const greenCardDate = formatDate(subDays(TODAY, 100));
			const stats = calculateUserStats(greenCardDate, "5-year", []);

			expect(stats.daysAsGreenCardHolder).toBe(100);
			expect(stats.physicalPresenceMet).toBe(100);
			expect(stats.daysOutsideUS).toBe(0);
		});

		it("subtracts trip days from physical presence", () => {
			const greenCardDate = formatDate(subDays(TODAY, 100));
			const trip = createTrip(
				1,
				formatDate(subDays(TODAY, 50)),
				formatDate(subDays(TODAY, 40))
			);
			const stats = calculateUserStats(greenCardDate, "5-year", [trip]);

			expect(stats.daysOutsideUS).toBe(9);
			expect(stats.physicalPresenceMet).toBe(100 - 9);
		});

		it("counts trip days correctly (departure and return days count as in US)", () => {
			const greenCardDate = formatDate(subDays(TODAY, 100));
			const trip = createTrip(
				1,
				formatDate(subDays(TODAY, 10)),
				formatDate(subDays(TODAY, 5))
			);
			const stats = calculateUserStats(greenCardDate, "5-year", [trip]);

			expect(stats.daysOutsideUS).toBe(4);
		});

		it("handles multiple short trips correctly", () => {
			const greenCardDate = formatDate(subDays(TODAY, 100));
			const trips = [
				createTrip(1, formatDate(subDays(TODAY, 90)), formatDate(subDays(TODAY, 85))),
				createTrip(2, formatDate(subDays(TODAY, 70)), formatDate(subDays(TODAY, 65))),
				createTrip(3, formatDate(subDays(TODAY, 50)), formatDate(subDays(TODAY, 45))),
			];
			const stats = calculateUserStats(greenCardDate, "5-year", trips);

			expect(stats.daysOutsideUS).toBe(4 + 4 + 4);
			expect(stats.physicalPresenceMet).toBe(100 - 12);
		});
	});

	describe("Continuity Warning Triggers", () => {
		it("does not warn for trip of exactly 179 days", () => {
			const greenCardDate = formatDate(subYears(TODAY, 2));
			const trip = createTrip(
				1,
				formatDate(subDays(TODAY, 200)),
				formatDate(subDays(TODAY, 21))
			);
			const stats = calculateUserStats(greenCardDate, "5-year", [trip]);

			expect(stats.hasWarnings).toBe(false);
			expect(stats.warnings).toHaveLength(0);
		});

		it("warns for trip of exactly 180 days with continuity-risk", () => {
			const greenCardDate = formatDate(subYears(TODAY, 2));
			const trip = createTrip(
				1,
				formatDate(subDays(TODAY, 200)),
				formatDate(subDays(TODAY, 20))
			);
			const stats = calculateUserStats(greenCardDate, "5-year", [trip]);

			expect(stats.hasWarnings).toBe(true);
			expect(stats.warnings).toHaveLength(1);
			expect(stats.warnings[0].type).toBe("continuity-risk");
			expect(stats.warnings[0].tripDays).toBe(180);
		});

		it("warns for trip of 200 days with continuity-risk", () => {
			const greenCardDate = formatDate(subYears(TODAY, 2));
			const trip = createTrip(
				1,
				formatDate(subDays(TODAY, 250)),
				formatDate(subDays(TODAY, 50))
			);
			const stats = calculateUserStats(greenCardDate, "5-year", [trip]);

			expect(stats.hasWarnings).toBe(true);
			expect(stats.warnings[0].type).toBe("continuity-risk");
			expect(stats.warnings[0].tripDays).toBe(200);
		});

		it("warns for trip of exactly 364 days with continuity-risk", () => {
			const greenCardDate = formatDate(subYears(TODAY, 2));
			const trip = createTrip(
				1,
				formatDate(subDays(TODAY, 400)),
				formatDate(subDays(TODAY, 36))
			);
			const stats = calculateUserStats(greenCardDate, "5-year", [trip]);

			expect(stats.hasWarnings).toBe(true);
			expect(stats.warnings[0].type).toBe("continuity-risk");
			expect(stats.warnings[0].tripDays).toBe(364);
		});
	});

	describe("Residence Broken Triggers", () => {
		it("warns for trip of exactly 365 days with residence-broken", () => {
			const greenCardDate = formatDate(subYears(TODAY, 2));
			const trip = createTrip(
				1,
				formatDate(subDays(TODAY, 400)),
				formatDate(subDays(TODAY, 35))
			);
			const stats = calculateUserStats(greenCardDate, "5-year", [trip]);

			expect(stats.hasWarnings).toBe(true);
			expect(stats.warnings).toHaveLength(1);
			expect(stats.warnings[0].type).toBe("residence-broken");
			expect(stats.warnings[0].tripDays).toBe(365);
		});

		it("warns for trip of 400 days with residence-broken", () => {
			const greenCardDate = formatDate(subYears(TODAY, 2));
			const trip = createTrip(
				1,
				formatDate(subDays(TODAY, 450)),
				formatDate(subDays(TODAY, 50))
			);
			const stats = calculateUserStats(greenCardDate, "5-year", [trip]);

			expect(stats.hasWarnings).toBe(true);
			expect(stats.warnings[0].type).toBe("residence-broken");
			expect(stats.warnings[0].tripDays).toBe(400);
		});
	});

	describe("Clock Reset Scenarios", () => {
		it("resets clock from return date for 180+ day trip", () => {
			const greenCardDate = formatDate(subYears(TODAY, 3));
			const returnDate = subDays(TODAY, 100);
			const trip = createTrip(
				1,
				formatDate(subDays(returnDate, 200)),
				formatDate(returnDate)
			);
			const stats = calculateUserStats(greenCardDate, "5-year", [trip]);

			const expectedEligibilityDate = addYears(returnDate, 5);
			expect(formatDate(stats.eligibilityDate)).toBe(formatDate(expectedEligibilityDate));
		});

		it("resets clock from return date for 365+ day trip", () => {
			const greenCardDate = formatDate(subYears(TODAY, 3));
			const returnDate = subDays(TODAY, 50);
			const trip = createTrip(
				1,
				formatDate(subDays(returnDate, 370)),
				formatDate(returnDate)
			);
			const stats = calculateUserStats(greenCardDate, "5-year", [trip]);

			const expectedEligibilityDate = addYears(returnDate, 5);
			expect(formatDate(stats.eligibilityDate)).toBe(formatDate(expectedEligibilityDate));
		});

		it("uses latest return date when multiple 180+ day trips", () => {
			const greenCardDate = formatDate(subYears(TODAY, 4));
			const olderReturnDate = subDays(TODAY, 500);
			const newerReturnDate = subDays(TODAY, 100);
			const trips = [
				createTrip(
					1,
					formatDate(subDays(olderReturnDate, 200)),
					formatDate(olderReturnDate)
				),
				createTrip(
					2,
					formatDate(subDays(newerReturnDate, 200)),
					formatDate(newerReturnDate)
				),
			];
			const stats = calculateUserStats(greenCardDate, "5-year", [trips[0], trips[1]]);

			const expectedEligibilityDate = addYears(newerReturnDate, 5);
			expect(formatDate(stats.eligibilityDate)).toBe(formatDate(expectedEligibilityDate));
		});

		it("clock reset affects physical presence calculation", () => {
			const greenCardDate = formatDate(subYears(TODAY, 3));
			const returnDate = subDays(TODAY, 100);
			const trip = createTrip(
				1,
				formatDate(subDays(returnDate, 200)),
				formatDate(returnDate)
			);
			const stats = calculateUserStats(greenCardDate, "5-year", [trip]);

			expect(stats.physicalPresenceMet).toBe(100);
		});

		it("only counts trips after clock reset for physical presence", () => {
			const greenCardDate = formatDate(subYears(TODAY, 3));
			const resetReturnDate = subDays(TODAY, 200);
			const shortTripAfterReset = createTrip(
				2,
				formatDate(subDays(TODAY, 50)),
				formatDate(subDays(TODAY, 40))
			);
			const longTripCausingReset = createTrip(
				1,
				formatDate(subDays(resetReturnDate, 200)),
				formatDate(resetReturnDate)
			);
			const stats = calculateUserStats(greenCardDate, "5-year", [
				longTripCausingReset,
				shortTripAfterReset,
			]);

			expect(stats.physicalPresenceMet).toBe(200 - 9);
		});
	});

	describe("Early Application Date", () => {
		it("canApplyDate is exactly 90 days before eligibilityDate for 5-year track", () => {
			const greenCardDate = formatDate(subDays(TODAY, 365));
			const stats = calculateUserStats(greenCardDate, "5-year", []);

			const daysDiff = Math.round(
				(stats.eligibilityDate.getTime() - stats.canApplyDate.getTime()) / (1000 * 60 * 60 * 24)
			);
			expect(daysDiff).toBe(90);
		});

		it("canApplyDate is exactly 90 days before eligibilityDate for 3-year track", () => {
			const greenCardDate = formatDate(subDays(TODAY, 365));
			const stats = calculateUserStats(greenCardDate, "3-year", []);

			const daysDiff = Math.round(
				(stats.eligibilityDate.getTime() - stats.canApplyDate.getTime()) / (1000 * 60 * 60 * 24)
			);
			expect(daysDiff).toBe(90);
		});
	});

	describe("Edge Cases", () => {
		it("handles no trips at all", () => {
			const greenCardDate = formatDate(subYears(TODAY, 2));
			const stats = calculateUserStats(greenCardDate, "5-year", []);

			expect(stats.daysOutsideUS).toBe(0);
			expect(stats.hasWarnings).toBe(false);
			expect(stats.daysSinceTracking).toBeNull();
		});

		it("ignores trip entirely before green card date", () => {
			const greenCardDate = formatDate(subDays(TODAY, 100));
			const trip = createTrip(
				1,
				formatDate(subDays(TODAY, 200)),
				formatDate(subDays(TODAY, 150))
			);
			const stats = calculateUserStats(greenCardDate, "5-year", [trip]);

			expect(stats.daysOutsideUS).toBe(0);
			expect(stats.hasWarnings).toBe(false);
		});

		it("handles trip with return date in future (trip in progress)", () => {
			const greenCardDate = formatDate(subYears(TODAY, 1));
			const trip = createTrip(
				1,
				formatDate(subDays(TODAY, 10)),
				formatDate(addDays(TODAY, 10))
			);
			const stats = calculateUserStats(greenCardDate, "5-year", [trip]);

			expect(stats.daysOutsideUS).toBe(9);
		});

		it("handles trip returning exactly today", () => {
			const greenCardDate = formatDate(subYears(TODAY, 1));
			const trip = createTrip(
				1,
				formatDate(subDays(TODAY, 10)),
				formatDate(TODAY)
			);
			const stats = calculateUserStats(greenCardDate, "5-year", [trip]);

			expect(stats.daysOutsideUS).toBe(9);
		});

		it("calculates daysSinceTracking from earliest trip", () => {
			const greenCardDate = formatDate(subYears(TODAY, 2));
			const trips = [
				createTrip(1, formatDate(subDays(TODAY, 100)), formatDate(subDays(TODAY, 90))),
				createTrip(2, formatDate(subDays(TODAY, 50)), formatDate(subDays(TODAY, 40))),
			];
			const stats = calculateUserStats(greenCardDate, "5-year", trips);

			expect(stats.daysSinceTracking).toBe(100);
		});

		it("handles green card date in the future gracefully", () => {
			const greenCardDate = formatDate(addDays(TODAY, 100));
			const stats = calculateUserStats(greenCardDate, "5-year", []);

			expect(stats.daysAsGreenCardHolder).toBe(0);
			expect(stats.physicalPresenceMet).toBe(0);
		});
	});
});

describe("formatDaysRemaining", () => {
	it('returns "Eligible now!" for 0 days', () => {
		expect(formatDaysRemaining(0)).toBe("Eligible now!");
	});

	it('returns "Eligible now!" for negative days', () => {
		expect(formatDaysRemaining(-5)).toBe("Eligible now!");
	});

	it('returns "1 day" for 1 day', () => {
		expect(formatDaysRemaining(1)).toBe("1 day");
	});

	it("returns days for less than 30 days", () => {
		expect(formatDaysRemaining(15)).toBe("15 days");
		expect(formatDaysRemaining(29)).toBe("29 days");
	});

	it('returns "1 month" for exactly 30 days', () => {
		expect(formatDaysRemaining(30)).toBe("1 month");
	});

	it("returns months and days for 31-364 days", () => {
		expect(formatDaysRemaining(45)).toBe("1 month, 15 days");
		expect(formatDaysRemaining(60)).toBe("2 months");
		expect(formatDaysRemaining(75)).toBe("2 months, 15 days");
		expect(formatDaysRemaining(90)).toBe("3 months");
	});

	it('returns "1 year" for exactly 365 days', () => {
		expect(formatDaysRemaining(365)).toBe("1 year");
	});

	it("returns years and months for 365+ days", () => {
		expect(formatDaysRemaining(400)).toBe("1 year, 1 month");
		expect(formatDaysRemaining(730)).toBe("2 years");
		expect(formatDaysRemaining(800)).toBe("2 years, 2 months");
	});

	it("handles large numbers correctly", () => {
		expect(formatDaysRemaining(1825)).toBe("5 years");
		expect(formatDaysRemaining(1095)).toBe("3 years");
	});
});

