"use client";

import { Pencil } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updateTrip } from "@/lib/actions/trips";
import type { TripData } from "@/lib/types";

interface EditTripModalProps {
	trip: TripData;
}

export function EditTripModal({ trip }: EditTripModalProps) {
	const [open, setOpen] = useState(false);
	const [loading, setLoading] = useState(false);
	const [departureDate, setDepartureDate] = useState(trip.departureDate);
	const [returnDate, setReturnDate] = useState(trip.returnDate);
	const [destination, setDestination] = useState(trip.destination);
	const [purpose, setPurpose] = useState(trip.purpose || "");

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!departureDate || !returnDate || !destination) return;

		setLoading(true);
		const result = await updateTrip(
			trip.id,
			departureDate,
			returnDate,
			destination,
			purpose || undefined
		);
		setLoading(false);

		if (result.success) {
			setOpen(false);
		}
	};

	const handleOpenChange = (newOpen: boolean) => {
		setOpen(newOpen);
		if (newOpen) {
			setDepartureDate(trip.departureDate);
			setReturnDate(trip.returnDate);
			setDestination(trip.destination);
			setPurpose(trip.purpose || "");
		}
	};

	return (
		<Dialog open={open} onOpenChange={handleOpenChange}>
			<DialogTrigger asChild>
				<Button variant="ghost" size="icon" className="h-7 w-7">
					<Pencil className="h-3.5 w-3.5" />
				</Button>
			</DialogTrigger>
			<DialogContent className="sm:max-w-[425px]">
				<form onSubmit={handleSubmit}>
					<DialogHeader>
						<DialogTitle>Edit Trip</DialogTitle>
						<DialogDescription>Update the trip details.</DialogDescription>
					</DialogHeader>
					<div className="grid gap-4 py-4">
						<div className="grid gap-2">
							<Label htmlFor="edit-destination">Destination Country</Label>
							<Input
								id="edit-destination"
								placeholder="Canada"
								value={destination}
								onChange={(e) => setDestination(e.target.value)}
								required
							/>
						</div>
						<div className="grid grid-cols-2 gap-4">
							<div className="grid gap-2">
								<Label htmlFor="edit-departureDate">Departure Date</Label>
								<Input
									id="edit-departureDate"
									type="date"
									value={departureDate}
									onChange={(e) => setDepartureDate(e.target.value)}
									required
								/>
							</div>
							<div className="grid gap-2">
								<Label htmlFor="edit-returnDate">Return Date</Label>
								<Input
									id="edit-returnDate"
									type="date"
									value={returnDate}
									onChange={(e) => setReturnDate(e.target.value)}
									min={departureDate}
									required
								/>
							</div>
						</div>
						<div className="grid gap-2">
							<Label htmlFor="edit-purpose">Purpose (Optional)</Label>
							<Input
								id="edit-purpose"
								placeholder="Family visit, vacation, etc."
								value={purpose}
								onChange={(e) => setPurpose(e.target.value)}
							/>
						</div>
					</div>
					<DialogFooter>
						<Button type="button" variant="outline" onClick={() => setOpen(false)}>
							Cancel
						</Button>
						<Button type="submit" disabled={loading}>
							{loading ? "Saving..." : "Save Changes"}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
