"use client";

import { PlaneTakeoff } from "lucide-react";
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
import { createTrip } from "@/lib/actions/trips";

interface AddTripModalProps {
	userId: number;
	userName: string;
}

export function AddTripModal({ userId, userName }: AddTripModalProps) {
	const [open, setOpen] = useState(false);
	const [loading, setLoading] = useState(false);
	const [departureDate, setDepartureDate] = useState("");
	const [returnDate, setReturnDate] = useState("");
	const [destination, setDestination] = useState("");
	const [purpose, setPurpose] = useState("");

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!departureDate || !returnDate || !destination) return;

		setLoading(true);
		const result = await createTrip(
			userId,
			departureDate,
			returnDate,
			destination,
			purpose || undefined
		);
		setLoading(false);

		if (result.success) {
			setOpen(false);
			setDepartureDate("");
			setReturnDate("");
			setDestination("");
			setPurpose("");
		}
	};

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<Button variant="outline" size="sm" className="gap-1.5">
					<PlaneTakeoff className="h-3.5 w-3.5" />
					Add Trip
				</Button>
			</DialogTrigger>
			<DialogContent className="sm:max-w-[425px]">
				<form onSubmit={handleSubmit}>
					<DialogHeader>
						<DialogTitle>Add Trip for {userName}</DialogTitle>
						<DialogDescription>Record a trip outside the United States.</DialogDescription>
					</DialogHeader>
					<div className="grid gap-4 py-4">
						<div className="grid gap-2">
							<Label htmlFor="destination">Destination Country</Label>
							<Input
								id="destination"
								placeholder="Canada"
								value={destination}
								onChange={(e) => setDestination(e.target.value)}
								required
							/>
						</div>
						<div className="grid grid-cols-2 gap-4">
							<div className="grid gap-2">
								<Label htmlFor="departureDate">Departure Date</Label>
								<Input
									id="departureDate"
									type="date"
									value={departureDate}
									onChange={(e) => setDepartureDate(e.target.value)}
									required
								/>
							</div>
							<div className="grid gap-2">
								<Label htmlFor="returnDate">Return Date</Label>
								<Input
									id="returnDate"
									type="date"
									value={returnDate}
									onChange={(e) => setReturnDate(e.target.value)}
									min={departureDate}
									required
								/>
							</div>
						</div>
						<div className="grid gap-2">
							<Label htmlFor="purpose">Purpose (Optional)</Label>
							<Input
								id="purpose"
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
							{loading ? "Adding..." : "Add Trip"}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
