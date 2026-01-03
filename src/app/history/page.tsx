import { format, parseISO } from "date-fns";
import { History, PlaneTakeoff, Trash2, UserPlus } from "lucide-react";
import { getActivityLog } from "@/lib/actions/activity";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function HistoryPage() {
	const activities = await getActivityLog();

	return (
		<div className="container mx-auto px-4 py-8">
			<div className="mb-8">
				<h1 className="text-3xl font-bold tracking-tight">Activity History</h1>
				<p className="text-muted-foreground">A complete log of all actions performed in the app</p>
			</div>

			{activities.length === 0 ? (
				<div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-16">
					<div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
						<History className="h-8 w-8 text-muted-foreground" />
					</div>
					<h2 className="mt-4 text-lg font-semibold">No activity yet</h2>
					<p className="mt-1 text-center text-sm text-muted-foreground">
						Actions will appear here once you start adding users and trips.
					</p>
				</div>
			) : (
				<div className="space-y-4">
					{activities.map((activity) => (
						<ActivityItem key={activity.id} activity={activity} />
					))}
				</div>
			)}
		</div>
	);
}

interface ActivityItemProps {
	activity: {
		id: number;
		action: string;
		entityType: string;
		entityId: number | null;
		details: string | null;
		createdAt: string | null;
	};
}

function ActivityItem({ activity }: ActivityItemProps) {
	const getIcon = () => {
		if (activity.entityType === "user") {
			if (activity.action === "created") {
				return UserPlus;
			}
			return Trash2;
		}
		if (activity.action === "created") {
			return PlaneTakeoff;
		}
		return Trash2;
	};

	const getIconColor = () => {
		if (activity.action === "deleted") {
			return "bg-red-100 text-red-600 dark:bg-red-950 dark:text-red-400";
		}
		if (activity.entityType === "user") {
			return "bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400";
		}
		return "bg-blue-100 text-blue-600 dark:bg-blue-950 dark:text-blue-400";
	};

	const Icon = getIcon();

	return (
		<div className="flex items-start gap-4 rounded-lg border p-4">
			<div
				className={cn(
					"flex h-10 w-10 shrink-0 items-center justify-center rounded-full",
					getIconColor()
				)}
			>
				<Icon className="h-5 w-5" />
			</div>
			<div className="min-w-0 flex-1">
				<p className="font-medium">{activity.details}</p>
				<p className="text-sm text-muted-foreground">
					{activity.createdAt
						? format(parseISO(activity.createdAt), "MMM d, yyyy 'at' h:mm a")
						: "Unknown time"}
				</p>
			</div>
		</div>
	);
}
