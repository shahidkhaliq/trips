import { Users } from "lucide-react";
import { NewUserModal } from "@/components/new-user-modal";
import { UserCard } from "@/components/user-card";
import { getUsers } from "@/lib/actions/users";
import { calculateUserStats } from "@/lib/calculator";

export const dynamic = "force-dynamic";

export default async function HomePage() {
	const users = await getUsers();

	const sortedUsers = [...users].sort((a, b) => {
		const statsA = calculateUserStats(a.greenCardDate, a.citizenshipTrack, a.trips);
		const statsB = calculateUserStats(b.greenCardDate, b.citizenshipTrack, b.trips);
		return statsA.daysToEligibility - statsB.daysToEligibility;
	});

	return (
		<div className="container mx-auto px-4 py-8">
			<div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
				<div>
					<h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
					<p className="text-muted-foreground">
						Track green card holders and their trips outside the US
					</p>
				</div>
				<NewUserModal />
			</div>

			{sortedUsers.length === 0 ? (
				<div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-16">
					<div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
						<Users className="h-8 w-8 text-muted-foreground" />
					</div>
					<h2 className="mt-4 text-lg font-semibold">No users yet</h2>
					<p className="mt-1 text-center text-sm text-muted-foreground">
						Add a green card holder to start tracking their trips.
					</p>
					<div className="mt-4">
						<NewUserModal />
					</div>
				</div>
			) : (
				<div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
					{sortedUsers.map((user) => (
						<UserCard key={user.id} user={user} allUsers={users} />
					))}
				</div>
			)}
		</div>
	);
}
