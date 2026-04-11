import { auth, signOut } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function LeaderboardPage() {
	const session = await auth();

	if (!session?.user) {
		redirect("/login");
	}

	// Check if user is admin
	const user = await prisma.user.findUnique({
		where: { id: session.user.id },
		select: { isAdmin: true },
	});

	// Get all predictions with points
	const predictions = await prisma.prediction.findMany({
		where: {
			points: { not: null },
		},
		include: {
			user: {
				select: {
					id: true,
					name: true,
					email: true,
					image: true,
				},
			},
		},
	});

	// Calculate leaderboard
	const userStats = new Map<
		string,
		{
			userId: string;
			userName: string;
			userImage: string | null;
			points: number;
			correctScores: number;
			correctOutcomes: number;
			totalPredictions: number;
		}
	>();

	for (const prediction of predictions) {
		const userId = prediction.user.id;
		const userName = prediction.user.name || prediction.user.email || "Unknown";
		const userImage = prediction.user.image;
		const points = prediction.points || 0;

		if (!userStats.has(userId)) {
			userStats.set(userId, {
				userId,
				userName,
				userImage,
				points: 0,
				correctScores: 0,
				correctOutcomes: 0,
				totalPredictions: 0,
			});
		}

		const stats = userStats.get(userId)!;
		stats.points += points;
		stats.totalPredictions++;

		// Check if exact score (3 points) or just outcome (1 point)
		if (points === 3) {
			stats.correctScores++;
		} else if (points === 1) {
			stats.correctOutcomes++;
		}
	}

	// Convert to array and sort by points
	const leaderboard = Array.from(userStats.values())
		.sort((a, b) => b.points - a.points)
		.map((entry, index) => ({
			rank: index + 1,
			...entry,
		}));

	const currentUserRank = leaderboard.find(
		(entry) => entry.userId === session.user.id,
	);

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
						🏆 Global Leaderboard
					</h1>
					<p className="text-gray-600">
						See how you rank against all players worldwide
					</p>
				</div>

				{/* Current User Stats */}
				{currentUserRank && (
					<div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg shadow-lg p-6 mb-8">
						<div className="flex items-center justify-between">
							<div>
								<div className="text-sm opacity-90 mb-1">Your Rank</div>
								<div className="text-4xl font-bold">#{currentUserRank.rank}</div>
							</div>
							<div className="text-right">
								<div className="text-sm opacity-90 mb-1">Total Points</div>
								<div className="text-4xl font-bold">
									{currentUserRank.points}
								</div>
							</div>
							<div className="text-right">
								<div className="text-sm opacity-90 mb-1">Exact Scores</div>
								<div className="text-2xl font-bold">
									{currentUserRank.correctScores}
								</div>
							</div>
							<div className="text-right">
								<div className="text-sm opacity-90 mb-1">Correct Outcomes</div>
								<div className="text-2xl font-bold">
									{currentUserRank.correctOutcomes}
								</div>
							</div>
						</div>
					</div>
				)}

				{/* Leaderboard Table */}
				<div className="bg-white rounded-lg shadow overflow-hidden">
					{leaderboard.length > 0 ? (
						<table className="w-full">
							<thead className="bg-gray-50">
								<tr>
									<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
										Rank
									</th>
									<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
										Player
									</th>
									<th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
										Points
									</th>
									<th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
										Exact Scores
									</th>
									<th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
										Correct Outcomes
									</th>
									<th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
										Predictions
									</th>
								</tr>
							</thead>
							<tbody className="bg-white divide-y divide-gray-200">
								{leaderboard.map((entry) => {
									const isCurrentUser = entry.userId === session.user.id;
									return (
										<tr
											key={entry.userId}
											className={`${
												isCurrentUser
													? "bg-blue-50 border-l-4 border-blue-600"
													: "hover:bg-gray-50"
											} transition`}
										>
											<td className="px-6 py-4 whitespace-nowrap">
												<div className="flex items-center">
													{entry.rank <= 3 ? (
														<span className="text-3xl">
															{entry.rank === 1
																? "🥇"
																: entry.rank === 2
																	? "🥈"
																	: "🥉"}
														</span>
													) : (
														<span className="text-gray-500 font-medium text-lg">
															#{entry.rank}
														</span>
													)}
												</div>
											</td>
											<td className="px-6 py-4 whitespace-nowrap">
												<div className="flex items-center gap-3">
													{entry.userImage && (
														<img
															src={entry.userImage}
															alt={entry.userName}
															className="w-8 h-8 rounded-full"
														/>
													)}
													<div>
														<div className="text-sm font-medium text-gray-900">
															{entry.userName}
															{isCurrentUser && (
																<span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
																	You
																</span>
															)}
														</div>
													</div>
												</div>
											</td>
											<td className="px-6 py-4 whitespace-nowrap text-center">
												<span className="text-2xl font-bold text-blue-600">
													{entry.points}
												</span>
											</td>
											<td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-900 font-medium">
												{entry.correctScores}
											</td>
											<td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-900 font-medium">
												{entry.correctOutcomes}
											</td>
											<td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-500">
												{entry.totalPredictions}
											</td>
										</tr>
									);
								})}
							</tbody>
						</table>
					) : (
						<div className="p-12 text-center text-gray-500">
							<div className="text-4xl mb-4">📊</div>
							<p className="text-lg">No predictions scored yet</p>
							<p className="text-sm mt-2">
								The leaderboard will appear once matches are finished and
								predictions are scored
							</p>
						</div>
					)}
				</div>
			</main>
		</div>
	);
}
