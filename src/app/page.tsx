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

	return (
		<div className="min-h-screen bg-gray-50">
			<nav className="bg-white shadow-sm">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="flex justify-between items-center h-16">
						<div className="flex items-center">
							<h1 className="text-2xl font-bold text-gray-900">
								⚽ World Cup 2026
							</h1>
						</div>
						<div className="flex items-center gap-4">
							<span className="text-sm text-gray-700">
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
				{/* Past Matches Section */}
				<PastMatches matches={pastMatchesWithPredictions} />

				{/* Header */}
				<div className="mb-8 flex justify-between items-center">
					<div>
						<h2 className="text-3xl font-bold text-gray-900 mb-2">
							Upcoming Matches
						</h2>
						<p className="text-gray-600">
							Make your predictions before the matches start!
						</p>
					</div>
					<div className="flex gap-3">
						<a
							href="/leagues"
							className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white px-6 py-3 rounded-lg font-bold shadow-lg transition flex items-center gap-2"
						>
							<span className="text-xl">👥</span>
							Leagues
						</a>
						<a
							href="/leaderboard"
							className="bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white px-6 py-3 rounded-lg font-bold shadow-lg transition flex items-center gap-2"
						>
							<span className="text-xl">🏆</span>
							Leaderboard
						</a>
					</div>
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
					<div className="bg-white rounded-lg shadow p-12 text-center">
						<p className="text-gray-500 text-lg">
							No upcoming matches in the next 7 days
						</p>
					</div>
				)}
			</main>
		</div>
	);
}
