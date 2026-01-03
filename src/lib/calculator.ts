import { addDays, addYears, differenceInDays, parseISO } from "date-fns";
import type { CitizenshipTrack, TripData, TripWarning, UserStats } from "./types";

const TRACK_CONFIG = {
	"5-year": {
		residenceYears: 5,
		physicalPresenceDays: 913,
	},
	"3-year": {
		residenceYears: 3,
		physicalPresenceDays: 548,
	},
};

const DAYS_CAN_APPLY_EARLY = 90;
const CONTINUITY_WARNING_DAYS = 180;
const RESIDENCE_BROKEN_DAYS = 365;

export function calculateUserStats(
	greenCardDate: string,
	citizenshipTrack: CitizenshipTrack,
	trips: TripData[]
): UserStats {
	const today = new Date();
	const gcDate = parseISO(greenCardDate);
	const config = TRACK_CONFIG[citizenshipTrack];

	const daysAsGreenCardHolder = Math.max(0, differenceInDays(today, gcDate));

	let daysOutsideUS = 0;
	const warnings: TripWarning[] = [];
	let latestClockResetDate: Date | null = null;

	for (const trip of trips) {
		const depDate = parseISO(trip.departureDate);
		const retDate = parseISO(trip.returnDate);

		if (depDate >= gcDate) {
			const effectiveReturnDate = retDate > today ? today : retDate;
			const tripSpan = differenceInDays(effectiveReturnDate, depDate);
			const tripDaysOutside = Math.max(0, tripSpan - 1);
			daysOutsideUS += tripDaysOutside;

			const totalTripSpan = differenceInDays(retDate, depDate);

			if (totalTripSpan >= CONTINUITY_WARNING_DAYS) {
				if (!latestClockResetDate || retDate > latestClockResetDate) {
					latestClockResetDate = retDate;
				}

				if (totalTripSpan >= RESIDENCE_BROKEN_DAYS) {
					warnings.push({
						tripId: trip.id,
						type: "residence-broken",
						message: `Trip to ${trip.destination} (${totalTripSpan} days) broke continuous residence - clock resets from return date`,
						tripDays: totalTripSpan,
					});
				} else {
					warnings.push({
						tripId: trip.id,
						type: "continuity-risk",
						message: `Trip to ${trip.destination} (${totalTripSpan} days) resets the ${config.residenceYears}-year clock`,
						tripDays: totalTripSpan,
					});
				}
			}
		}
	}

	const residenceStartDate = latestClockResetDate || gcDate;
	const baseEligibilityDate = addYears(residenceStartDate, config.residenceYears);
	const daysSinceResidenceStart = Math.max(0, differenceInDays(today, residenceStartDate));

	let daysOutsideSinceResidenceStart = 0;
	for (const trip of trips) {
		const depDate = parseISO(trip.departureDate);
		const retDate = parseISO(trip.returnDate);

		if (depDate >= residenceStartDate) {
			const effectiveReturnDate = retDate > today ? today : retDate;
			const tripSpan = differenceInDays(effectiveReturnDate, depDate);
			const tripDaysOutside = Math.max(0, tripSpan - 1);
			daysOutsideSinceResidenceStart += tripDaysOutside;
		}
	}

	const physicalPresenceRequired = config.physicalPresenceDays;
	const physicalPresenceMet = Math.max(0, daysSinceResidenceStart - daysOutsideSinceResidenceStart);
	const physicalPresenceRemaining = Math.max(0, physicalPresenceRequired - physicalPresenceMet);

	const daysToTimeEligibility = Math.max(0, differenceInDays(baseEligibilityDate, today));
	const daysToEligibility = Math.max(daysToTimeEligibility, physicalPresenceRemaining);

	const eligibilityDate =
		physicalPresenceRemaining > daysToTimeEligibility
			? addDays(today, physicalPresenceRemaining)
			: baseEligibilityDate;

	const canApplyDate = addDays(eligibilityDate, -DAYS_CAN_APPLY_EARLY);

	const sortedTrips = [...trips].sort(
		(a, b) => parseISO(a.departureDate).getTime() - parseISO(b.departureDate).getTime()
	);
	const daysSinceTracking =
		sortedTrips.length > 0 ? differenceInDays(today, parseISO(sortedTrips[0].departureDate)) : null;

	const hadClockReset = latestClockResetDate !== null;
	const daysAsGreenCardHolderSinceReset = hadClockReset
		? daysSinceResidenceStart
		: daysAsGreenCardHolder;

	return {
		daysToEligibility,
		eligibilityDate,
		canApplyDate,
		daysOutsideUS,
		daysOutsideUSSinceReset: daysOutsideSinceResidenceStart,
		daysAsGreenCardHolder,
		daysAsGreenCardHolderSinceReset,
		hadClockReset,
		daysSinceTracking,
		physicalPresenceRequired,
		physicalPresenceMet,
		hasWarnings: warnings.length > 0,
		warnings,
	};
}

export function formatDaysRemaining(days: number): string {
	if (days <= 0) return "Eligible now!";
	if (days === 1) return "1 day";
	if (days < 30) return `${days} days`;
	if (days < 365) {
		const months = Math.floor(days / 30);
		const remainingDays = days % 30;
		if (remainingDays === 0) return `${months} month${months > 1 ? "s" : ""}`;
		return `${months} month${months > 1 ? "s" : ""}, ${remainingDays} day${remainingDays > 1 ? "s" : ""}`;
	}
	const years = Math.floor(days / 365);
	const remainingDays = days % 365;
	const months = Math.floor(remainingDays / 30);
	if (months === 0) return `${years} year${years > 1 ? "s" : ""}`;
	return `${years} year${years > 1 ? "s" : ""}, ${months} month${months > 1 ? "s" : ""}`;
}
