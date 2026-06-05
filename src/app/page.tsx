import { auth, signOut } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { PastMatches } from "@/components/PastMatches";
import { DashboardTabs } from "@/components/DashboardTabs";

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

	// Fetch all teams for group standings
	const teams = await prisma.team.findMany({
		select: {
			id: true,
			name: true,
			code: true,
			flagUrl: true,
			group: true,
		},
	});

	return (
		<div className="min-h-screen bg-gray-900">
			<nav className="bg-gray-800 shadow-sm border-b border-gray-700">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="flex justify-between items-center h-16">
						<div className="flex items-center">
							<h1 className="text-2xl font-bold text-gray-100">⚽ WC 2026</h1>
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
									Deconectare
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
							Meciuri Viitoare
						</h2>
						<p className="text-sm sm:text-base text-gray-400">
							Fă-ți predicțiile înainte să înceapă meciurile!
						</p>
					</div>
					<div className="flex gap-2 sm:gap-3 w-full sm:w-auto">
						<a
							href="/leagues"
							className="flex-1 sm:flex-none bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-bold shadow-lg transition flex items-center justify-center gap-2 text-sm sm:text-base"
						>
							<span className="text-lg sm:text-xl">👥</span>
							Ligi
						</a>
						<a
							href="/leaderboard"
							className="flex-1 sm:flex-none bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-bold shadow-lg transition flex items-center justify-center gap-2 text-sm sm:text-base"
						>
							<span className="text-lg sm:text-xl">🏆</span>
							Clasament
						</a>
					</div>
				</div>

				{/* My Leagues */}
				{userLeagues.length > 0 && (
					<div className="mb-6">
						<h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-3">
							Ligiile Mele
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
						Predicțiile se închid{" "}
						<span className="text-white font-medium">30 de minute</span> înainte
						de fiecare meci.
					</span>
				</div>

				{/* Dashboard Tabs */}
				<DashboardTabs
					matches={matchesWithPredictions}
					teams={teams}
				/>
			</main>
		</div>
	);
}
