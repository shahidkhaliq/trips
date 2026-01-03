export type CitizenshipTrack = "5-year" | "3-year";

export interface UserWithTrips {
	id: number;
	name: string;
	avatar: string | null;
	greenCardDate: string;
	citizenshipTrack: CitizenshipTrack;
	createdAt: string | null;
	trips: TripData[];
}

export interface TripData {
	id: number;
	userId: number;
	departureDate: string;
	returnDate: string;
	destination: string;
	purpose: string | null;
	createdAt: string | null;
}

export interface UserStats {
	daysToEligibility: number;
	eligibilityDate: Date;
	canApplyDate: Date;
	daysOutsideUS: number;
	daysOutsideUSSinceReset: number;
	daysAsGreenCardHolder: number;
	daysAsGreenCardHolderSinceReset: number;
	hadClockReset: boolean;
	daysSinceTracking: number | null;
	physicalPresenceRequired: number;
	physicalPresenceMet: number;
	hasWarnings: boolean;
	warnings: TripWarning[];
}

export interface TripWarning {
	tripId: number;
	type: "continuity-risk" | "residence-broken";
	message: string;
	tripDays: number;
}

export interface ActivityLogItem {
	id: number;
	action: string;
	entityType: string;
	entityId: number | null;
	details: string | null;
	createdAt: string | null;
}

export interface UserExport {
	name: string;
	avatar: string | null;
	greenCardDate: string;
	citizenshipTrack: CitizenshipTrack;
	trips: TripExport[];
}

export interface TripExport {
	departureDate: string;
	returnDate: string;
	destination: string;
	purpose: string | null;
}
