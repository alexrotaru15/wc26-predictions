import { auth, signOut } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { CreateLeagueForm } from "@/components/leagues/CreateLeagueForm";
import { JoinLeagueForm } from "@/components/leagues/JoinLeagueForm";
import { LeagueCard } from "@/components/leagues/LeagueCard";

export default async function LeaguesPage() {
	const session = await auth();

	if (!session?.user) {
		redirect("/login");
	}

	// Check if user is admin
	const user = await prisma.user.findUnique({
		where: { id: session.user.id },
		select: { isAdmin: true },
	});

	// Get user's leagues
	const userLeagues = await prisma.leagueMember.findMany({
		where: { userId: session.user.id },
		include: {
			league: {
				include: {
					createdBy: {
						select: { name: true, email: true },
					},
					_count: {
						select: { members: true },
					},
				},
			},
		},
		orderBy: {
			joinedAt: "desc",
		},
	});

	return (
		<div className="min-h-screen bg-gray-50">
			<nav className="bg-white shadow-sm">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="flex justify-between items-center h-16">
						<div className="flex items-center">
							<Link
								href="/"
								className="text-2xl font-bold text-gray-900 hover:text-gray-700"
							>
								⚽ World Cup 2026
							</Link>
						</div>
						<div className="flex items-center gap-4">
							<span className="text-sm text-gray-700">
								{session.user.name || session.user.email}
							</span>
							{user?.isAdmin && (
								<Link
									href="/admin"
									className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
								>
									Admin
								</Link>
							)}
							<form
								action={async () => {
									"use server";
									await signOut({ redirectTo: "/login" });
								}}
							>
								<button
									type="submit"
									className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
								>
									Sign Out
								</button>
							</form>
						</div>
					</div>
				</div>
			</nav>

			<main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
				{/* Header */}
				<div className="mb-8">
					<Link
						href="/"
						className="text-blue-600 hover:text-blue-700 font-medium text-sm mb-4 inline-block"
					>
						← Back to Dashboard
					</Link>
					<h1 className="text-3xl font-bold text-gray-900 mb-2">
						🏆 My Leagues
					</h1>
					<p className="text-gray-600">
						Create private leagues and compete with friends
					</p>
				</div>

				<div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
					{/* Left Column - My Leagues */}
					<div className="lg:col-span-2">
						<h2 className="text-xl font-bold text-gray-900 mb-4">
							Your Leagues ({userLeagues.length})
						</h2>

						{userLeagues.length > 0 ? (
							<div className="space-y-4">
								{userLeagues.map(({ league }) => (
									<LeagueCard
										key={league.id}
										league={league}
									/>
								))}
							</div>
						) : (
							<div className="bg-white rounded-lg shadow p-12 text-center">
								<div className="text-4xl mb-4">🏆</div>
								<p className="text-gray-500 mb-4">
									You haven't joined any leagues yet
								</p>
								<p className="text-sm text-gray-400">
									Create a new league or join one using an invite code
								</p>
							</div>
						)}
					</div>

					{/* Right Column - Create & Join */}
					<div className="space-y-6">
						{/* Create League */}
						<div className="bg-white rounded-lg shadow p-6">
							<h3 className="text-lg font-bold text-gray-900 mb-4">
								Create League
							</h3>
							<CreateLeagueForm userId={session.user.id} />
						</div>

						{/* Join League */}
						<div className="bg-white rounded-lg shadow p-6">
							<h3 className="text-lg font-bold text-gray-900 mb-4">
								Join League
							</h3>
							<JoinLeagueForm userId={session.user.id} />
						</div>
					</div>
				</div>
			</main>
		</div>
	);
}
