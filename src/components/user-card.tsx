"use client";

import { format, parseISO } from "date-fns";
import {
	Calendar,
	ChevronDown,
	Clock,
	Globe,
	MapPin,
	Plane,
	PlaneLanding,
	PlaneTakeoff,
	RotateCcw,
	Trash2,
} from "lucide-react";
import { useState } from "react";
import { AddTripModal } from "@/components/add-trip-modal";
import { EditUserModal } from "@/components/edit-user-modal";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { deleteTrip } from "@/lib/actions/trips";
import { deleteUser } from "@/lib/actions/users";
import { calculateUserStats, formatDaysRemaining } from "@/lib/calculator";
import type { UserWithTrips } from "@/lib/types";
import { cn } from "@/lib/utils";

interface UserCardProps {
	user: UserWithTrips;
}

function getInitials(name: string): string {
	return name
		.split(" ")
		.map((n) => n[0])
		.join("")
		.toUpperCase()
		.slice(0, 2);
}

export function UserCard({ user }: UserCardProps) {
	const [isTripsOpen, setIsTripsOpen] = useState(false);
	const [deletingUser, setDeletingUser] = useState(false);
	const [deletingTripId, setDeletingTripId] = useState<number | null>(null);

	const stats = calculateUserStats(user.greenCardDate, user.citizenshipTrack, user.trips);

	const handleDeleteUser = async () => {
		setDeletingUser(true);
		await deleteUser(user.id);
		setDeletingUser(false);
	};

	const handleDeleteTrip = async (tripId: number) => {
		setDeletingTripId(tripId);
		await deleteTrip(tripId);
		setDeletingTripId(null);
	};

	const totalDaysRequired = user.citizenshipTrack === "5-year" ? 5 * 365 : 3 * 365;
	const daysCompleted = totalDaysRequired - stats.daysToEligibility;
	const progressPercent = Math.min(100, Math.max(0, (daysCompleted / totalDaysRequired) * 100));
	const isComplete = stats.daysToEligibility <= 0;

	return (
		<Card className="relative max-w-md overflow-hidden">
			<div className="absolute top-0 right-0 left-0 h-1.5 bg-muted">
				<div
					className={cn(
						"h-full transition-all duration-500",
						isComplete ? "bg-emerald-500" : stats.hasWarnings ? "bg-amber-500" : "bg-sky-500"
					)}
					style={{ width: `${progressPercent}%` }}
				/>
			</div>
			<CardHeader className="pb-2 pt-4">
				<div className="flex items-start justify-between gap-3">
					<div className="flex items-start gap-3">
						<Avatar className="h-12 w-12 shrink-0">
							<AvatarImage src={user.avatar || undefined} alt={user.name} />
							<AvatarFallback className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300">
								{getInitials(user.name)}
							</AvatarFallback>
						</Avatar>
						<div>
							<CardTitle className="text-xl">{user.name}</CardTitle>
							<div className="mt-1 flex flex-wrap items-center gap-2">
								<span
									className={cn(
										"inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
										user.citizenshipTrack === "5-year"
											? "bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-300"
											: "bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300"
									)}
								>
									{user.citizenshipTrack === "5-year" ? "5-Year" : "3-Year"}
								</span>
								<span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
									<Calendar className="h-3 w-3" />
									{format(parseISO(user.greenCardDate), "MMM d, yyyy")}
								</span>
							</div>
						</div>
					</div>
					<div className="flex items-center gap-1">
						<EditUserModal user={user} />
						<AlertDialog>
							<AlertDialogTrigger asChild>
								<Button
									variant="ghost"
									size="icon"
									className="h-8 w-8 text-muted-foreground hover:text-destructive"
								>
									<Trash2 className="h-4 w-4" />
								</Button>
							</AlertDialogTrigger>
							<AlertDialogContent>
								<AlertDialogHeader>
									<AlertDialogTitle>Delete {user.name}?</AlertDialogTitle>
									<AlertDialogDescription>
										This will permanently delete this user and all their trip records. This action
										cannot be undone.
									</AlertDialogDescription>
								</AlertDialogHeader>
								<AlertDialogFooter>
									<AlertDialogCancel>Cancel</AlertDialogCancel>
									<AlertDialogAction
										onClick={handleDeleteUser}
										disabled={deletingUser}
										className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
									>
										{deletingUser ? "Deleting..." : "Delete"}
									</AlertDialogAction>
								</AlertDialogFooter>
							</AlertDialogContent>
						</AlertDialog>
					</div>
				</div>
			</CardHeader>
			<CardContent className="space-y-4">
				<div
					className="grid gap-3"
					style={{ gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))" }}
				>
					<StatItem
						icon={Clock}
						label="Days to Citizenship"
						value={formatDaysRemaining(stats.daysToEligibility)}
						highlight={stats.daysToEligibility <= 90}
					/>
					<StatItem
						icon={Calendar}
						label="Can Apply"
						value={format(stats.canApplyDate, "MMM d, yyyy")}
						highlight={stats.canApplyDate <= new Date()}
					/>
					<StatItem
						icon={Plane}
						label="Days Outside US"
						value={stats.daysOutsideUSSinceReset.toString()}
					/>
					<StatItem
						icon={MapPin}
						label="Days Inside US"
						value={stats.physicalPresenceMet.toString()}
					/>
				</div>

				<div className="flex items-center gap-2">
					<AddTripModal userId={user.id} userName={user.name} />
				</div>

				{user.trips.length > 0 && (
					<Collapsible open={isTripsOpen} onOpenChange={setIsTripsOpen}>
						<CollapsibleTrigger asChild>
							<Button
								variant="ghost"
								className="w-full justify-between rounded-lg border bg-muted/30 px-3 py-2 hover:bg-muted/50"
							>
								<div className="flex items-center gap-2">
									<Globe className="h-4 w-4 text-muted-foreground" />
									<span className="text-sm font-medium">
										{user.trips.length} trip{user.trips.length !== 1 ? "s" : ""} recorded
									</span>
								</div>
								<ChevronDown
									className={cn(
										"h-4 w-4 text-muted-foreground transition-transform",
										isTripsOpen && "rotate-180"
									)}
								/>
							</Button>
						</CollapsibleTrigger>
						<CollapsibleContent className="mt-3">
							<div className="relative space-y-0">
								{user.trips.length > 1 && (
									<div
										className="absolute left-[15px] top-5 w-px bg-border"
										style={{
											height: `calc(100% - 5rem)`,
										}}
									/>
								)}

								{user.trips
									.sort(
										(a, b) =>
											parseISO(b.departureDate).getTime() - parseISO(a.departureDate).getTime()
									)
									.map((trip, index) => {
										const tripDays = Math.ceil(
											(parseISO(trip.returnDate).getTime() -
												parseISO(trip.departureDate).getTime()) /
												(1000 * 60 * 60 * 24)
										);
										const isLast = index === user.trips.length - 1;
										const isClockReset = tripDays >= 180;

										return (
											<div key={trip.id} className={cn("relative pl-9", !isLast && "pb-4")}>
												<div
													className={cn(
														"absolute left-2 top-[14px] h-3 w-3 rounded-full border-2 bg-background",
														isClockReset ? "border-red-500" : "border-muted-foreground/40"
													)}
												/>

												<div className="group flex items-start justify-between gap-2 rounded-lg p-2 transition-colors hover:bg-muted/40">
													<div className="min-w-0 flex-1 space-y-1">
														<div className="flex items-center gap-2">
															<span className="font-medium">{trip.destination}</span>
															<span
																className={cn(
																	"inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium",
																	isClockReset
																		? "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300"
																		: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
																)}
															>
																{isClockReset && <RotateCcw className="h-3 w-3" />}
																{tripDays} days
															</span>
														</div>
														<div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
															<span className="flex items-center gap-1">
																<PlaneTakeoff className="h-3 w-3" />
																{format(parseISO(trip.departureDate), "MMM d, yyyy")}
															</span>
															<span className="flex items-center gap-1">
																<PlaneLanding className="h-3 w-3" />
																{format(parseISO(trip.returnDate), "MMM d, yyyy")}
															</span>
														</div>
														{trip.purpose && (
															<p className="text-xs italic text-muted-foreground/70">
																{trip.purpose}
															</p>
														)}
													</div>
													<AlertDialog>
														<AlertDialogTrigger asChild>
															<Button
																variant="ghost"
																size="icon"
																className="h-7 w-7 shrink-0 opacity-0 transition-opacity group-hover:opacity-100 hover:text-destructive"
															>
																<Trash2 className="h-3.5 w-3.5" />
															</Button>
														</AlertDialogTrigger>
														<AlertDialogContent>
															<AlertDialogHeader>
																<AlertDialogTitle>Delete this trip?</AlertDialogTitle>
																<AlertDialogDescription>
																	This will remove the trip to {trip.destination} from{" "}
																	{format(parseISO(trip.departureDate), "MMM d, yyyy")} -{" "}
																	{format(parseISO(trip.returnDate), "MMM d, yyyy")}.
																</AlertDialogDescription>
															</AlertDialogHeader>
															<AlertDialogFooter>
																<AlertDialogCancel>Cancel</AlertDialogCancel>
																<AlertDialogAction
																	onClick={() => handleDeleteTrip(trip.id)}
																	disabled={deletingTripId === trip.id}
																	className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
																>
																	{deletingTripId === trip.id ? "Deleting..." : "Delete"}
																</AlertDialogAction>
															</AlertDialogFooter>
														</AlertDialogContent>
													</AlertDialog>
												</div>
											</div>
										);
									})}
							</div>
						</CollapsibleContent>
					</Collapsible>
				)}
			</CardContent>
		</Card>
	);
}

interface StatItemProps {
	icon: React.ComponentType<{ className?: string }>;
	label: string;
	value: string;
	subValue?: string;
	highlight?: boolean;
}

function StatItem({ icon: Icon, label, value, subValue, highlight }: StatItemProps) {
	return (
		<div
			className={cn(
				"rounded-lg border p-3",
				highlight && "border-emerald-300 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-950"
			)}
		>
			<div className="flex items-center gap-2 text-muted-foreground">
				<Icon className="h-4 w-4 shrink-0" />
				<span className="text-xs">{label}</span>
			</div>
			<div className="mt-1 flex items-baseline gap-2">
				<p className={cn("font-semibold", highlight && "text-emerald-700 dark:text-emerald-300")}>
					{value}
				</p>
				{subValue && <span className="text-xs text-muted-foreground">{subValue}</span>}
			</div>
		</div>
	);
}
