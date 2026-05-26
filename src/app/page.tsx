import { auth, signOut } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { MatchCard } from "@/components/MatchCard";
import { PastMatches } from "@/components/PastMatches";

export default async function Home() {
	const session = await auth();

	if (!session?.user) {
		redirect("/login");
	}

	// Check if user is admin
	const user = await prisma.user.findUnique({
		where: { id: session.user.id },
		select: { isAdmin: true },
	});

	const now = new Date();

	// Fetch upcoming matches
	const matches = await prisma.match.findMany({
		where: {
			scheduledAt: {
				gte: now,
			},
		},
		include: {
			homeTeam: {
				select: { name: true, code: true, flagUrl: true },
			},
			awayTeam: {
				select: { name: true, code: true, flagUrl: true },
			},
			predictions: {
				where: { userId: session.user.id },
				select: { homeScore: true, awayScore: true, points: true },
			},
		},
		orderBy: { scheduledAt: "asc" },
	});

	const matchesWithPredictions = matches.map((match) => ({
		...match,
		userPrediction: match.predictions[0] || null,
	}));

	// Fetch past finished matches
	const pastMatches = await prisma.match.findMany({
		where: {
			isFinished: true,
		},
		include: {
			homeTeam: {
				select: { name: true, code: true, flagUrl: true },
			},
			awayTeam: {
				select: { name: true, code: true, flagUrl: true },
			},
			predictions: {
				where: { userId: session.user.id },
				select: { homeScore: true, awayScore: true, points: true },
			},
		},
		orderBy: { scheduledAt: "desc" },
	});

	const pastMatchesWithPredictions = pastMatches.map((match) => ({
		...match,
		userPrediction: match.predictions[0] || null,
	}));

	// Fetch user's leagues (max 3)
	const userLeagues = await prisma.leagueMember.findMany({
		where: { userId: session.user.id },
		include: { league: { select: { id: true, name: true } } },
		take: 3,
		orderBy: { joinedAt: "asc" },
	});

	return (
		<div className="min-h-screen bg-gray-900">
			<nav className="bg-gray-800 shadow-sm border-b border-gray-700">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="flex justify-between items-center h-16">
						<div className="flex items-center">
							<h1 className="text-2xl font-bold text-gray-100">
								⚽ World Cup 2026
							</h1>
						</div>
						<div className="flex items-center gap-4">
							<span className="text-sm text-gray-300">
								{session.user.name || session.user.email}
							</span>
							{user?.isAdmin && (
								<a
									href="/admin"
									className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
								>
									Admin
								</a>
							)}
							<form
								action={async () => {
									"use server";
									await signOut({ redirectTo: "/login" });
								}}
							>
								<button
									type="submit"
									className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition cursor-pointer"
								>
									Sign Out
								</button>
							</form>
						</div>
					</div>
				</div>
			</nav>

			<main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
				{/* Past Matches Section */}
				<PastMatches matches={pastMatchesWithPredictions} />

				{/* Header */}
				<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
					<div>
						<h2 className="text-2xl sm:text-3xl font-bold text-gray-100 mb-2">
							Upcoming Matches
						</h2>
						<p className="text-sm sm:text-base text-gray-400">
							Make your predictions before the matches start!
						</p>
					</div>
					<div className="flex gap-2 sm:gap-3 w-full sm:w-auto">
						<a
							href="/leagues"
							className="flex-1 sm:flex-none bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-bold shadow-lg transition flex items-center justify-center gap-2 text-sm sm:text-base"
						>
							<span className="text-lg sm:text-xl">👥</span>
							Leagues
						</a>
						<a
							href="/leaderboard"
							className="flex-1 sm:flex-none bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-bold shadow-lg transition flex items-center justify-center gap-2 text-sm sm:text-base"
						>
							<span className="text-lg sm:text-xl">🏆</span>
							Leaderboard
						</a>
					</div>
				</div>

				{/* My Leagues */}
				{userLeagues.length > 0 && (
					<div className="mb-6">
						<h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-3">
							My Leagues
						</h3>
						<div className="flex flex-wrap gap-2">
							{userLeagues.map(({ league }) => (
								<a
									key={league.id}
									href={`/leagues/${league.id}`}
									className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 border border-gray-700 hover:border-purple-500 text-gray-200 px-4 py-2 rounded-lg text-sm font-medium transition cursor-pointer"
								>
									<span>👥</span>
									{league.name}
								</a>
							))}
						</div>
					</div>
				)}

				{/* Deadline info */}
				<div className="mb-4 flex items-center gap-2 text-sm text-gray-400 bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-2.5">
					<span>ℹ️</span>
					<span>
						Predictions close{" "}
						<span className="text-white font-medium">30 minutes</span> before
						each match kicks off.
					</span>
				</div>

				{/* Matches Grid */}
				{matchesWithPredictions.length > 0 ? (
					<div className="grid grid-cols-1 gap-4">
						{matchesWithPredictions.map((match) => (
							<MatchCard
								key={match.id}
								match={match}
							/>
						))}
					</div>
				) : (
					<div className="bg-gray-800 rounded-lg shadow p-12 text-center border border-gray-700">
						<div className="text-4xl mb-4">⚽</div>
						<p className="text-gray-400">No upcoming matches at the moment</p>
					</div>
				)}
			</main>
		</div>
	);
}
