import { auth, signOut } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { CopyInviteLink } from "@/components/leagues/CopyInviteLink";
import { UserPredictionsModal } from "@/components/UserPredictionsModal";

export default async function LeagueLeaderboardPage({
	params,
}: {
	params: Promise<{ id: string }>;
}) {
	const session = await auth();

	if (!session?.user) {
		redirect("/login");
	}

	const { id } = await params;

	// Get league details
	const league = await prisma.league.findUnique({
		where: { id },
		include: {
			createdBy: {
				select: { name: true, email: true },
			},
			members: {
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
			},
		},
	});

	if (!league) {
		redirect("/leagues");
	}

	// Check if user is a member
	const isMember = league.members.some((m) => m.user.id === session.user.id);
	if (!isMember) {
		redirect("/leagues");
	}

	// Get all predictions for league members with points or for matches that have started
	const memberIds = league.members.map((m) => m.user.id);
	const predictions = await prisma.prediction.findMany({
		where: {
			userId: { in: memberIds },
			OR: [
				{ points: { not: null } },
				{
					match: {
						scheduledAt: { lte: new Date() },
					},
				},
			],
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
			match: {
				select: {
					homeScore: true,
					awayScore: true,
					scheduledAt: true,
					homeTeam: { select: { name: true, code: true } },
					awayTeam: { select: { name: true, code: true } },
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

	// Initialize all members with 0 points
	for (const member of league.members) {
		userStats.set(member.user.id, {
			userId: member.user.id,
			userName: member.user.name || member.user.email || "Unknown",
			userImage: member.user.image,
			points: 0,
			correctScores: 0,
			correctOutcomes: 0,
			totalPredictions: 0,
		});
	}

	// Add points from predictions
	for (const prediction of predictions) {
		const stats = userStats.get(prediction.user.id)!;
		const points = prediction.points || 0;
		stats.points += points;
		stats.totalPredictions++;

		if (points === 3) {
			stats.correctScores++;
		} else if (points === 1) {
			stats.correctOutcomes++;
		}
	}

	// Group predictions by user
	const predictionsByUser = new Map<string, typeof predictions>();
	for (const prediction of predictions) {
		const userId = prediction.user.id;
		if (!predictionsByUser.has(userId)) {
			predictionsByUser.set(userId, []);
		}
		predictionsByUser.get(userId)!.push(prediction);
	}

	// Convert to array and sort by points, then by exact scores
	const leaderboard = Array.from(userStats.values())
		.sort((a, b) => {
			if (b.points !== a.points) return b.points - a.points;
			if (b.correctScores !== a.correctScores)
				return b.correctScores - a.correctScores;
			return a.totalPredictions - b.totalPredictions;
		})
		.map((entry, index) => ({
			rank: index + 1,
			...entry,
		}));

	const currentUserRank = leaderboard.find(
		(entry) => entry.userId === session.user.id,
	);

	// Check if user is admin
	const user = await prisma.user.findUnique({
		where: { id: session.user.id },
		select: { isAdmin: true },
	});

	return (
		<div className="min-h-screen bg-gray-900">
			<nav className="bg-gray-800 shadow-sm">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="flex justify-between items-center h-16">
						<div className="flex items-center">
							<Link
								href="/"
								className="text-2xl font-bold text-gray-100 hover:text-gray-300"
							>
								⚽ WC 2026
							</Link>
						</div>
						<div className="flex items-center gap-4">
							<span className="text-sm text-gray-300">
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
				{/* Header */}
				<div className="mb-8">
					<Link
						href="/leagues"
						className="text-blue-600 hover:text-blue-700 font-medium text-sm mb-4 inline-block"
					>
						← Înapoi la Ligi
					</Link>
					<div className="flex justify-between items-start">
						<div>
							<h1 className="text-3xl font-bold text-gray-100 mb-2">
								{league.name}
							</h1>
							<p className="text-gray-400">
								{/* Creat de {league.createdBy.name || league.createdBy.email} •{" "} */}
								{league.members.length} membri
							</p>
						</div>
						<div className="text-right">
							<div className="text-sm text-gray-500 mb-2">Cod Invitație</div>
							<div className="font-mono text-2xl font-bold bg-gray-800 px-4 py-2 rounded-lg mb-3">
								{league.inviteCode}
							</div>
							<CopyInviteLink inviteCode={league.inviteCode} />
						</div>
					</div>
				</div>

				{/* Current User Stats */}
				{currentUserRank && currentUserRank.points > 0 && (
					<div className="bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg shadow-lg p-6 mb-8">
						<div className="flex items-center justify-between">
							<div>
								<div className="text-sm opacity-90 mb-1">Locul Tău</div>
								<div className="text-4xl font-bold">
									#{currentUserRank.rank}
								</div>
							</div>
							<div className="text-right">
								<div className="text-sm opacity-90 mb-1">Puncte Totale</div>
								<div className="text-4xl font-bold">
									{currentUserRank.points}
								</div>
							</div>
							<div className="text-right">
								<div className="text-sm opacity-90 mb-1">Scoruri Exacte</div>
								<div className="text-2xl font-bold">
									{currentUserRank.correctScores}
								</div>
							</div>
							<div className="text-right">
								<div className="text-sm opacity-90 mb-1">Rezultate Corecte</div>
								<div className="text-2xl font-bold">
									{currentUserRank.correctOutcomes}
								</div>
							</div>
						</div>
					</div>
				)}

				{/* Leaderboard Table */}
				<div className="bg-gray-800 rounded-lg shadow overflow-hidden">
					<table className="w-full">
						<thead className="bg-gray-900">
							<tr>
								<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
									Loc
								</th>
								<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
									Jucător
								</th>
								<th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
									Puncte
								</th>
								<th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
									Scoruri Exacte
								</th>
								<th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
									Rezultate Corecte
								</th>
								<th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
									Predicții
								</th>
								<th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
									Acțiuni
								</th>
							</tr>
						</thead>
						<tbody className="bg-gray-800 divide-y divide-gray-200">
							{leaderboard.map((entry) => {
								const isCurrentUser = entry.userId === session.user.id;
								const rawPredictions =
									predictionsByUser.get(entry.userId) || [];
								const userPredictions = rawPredictions.map((p) => ({
									...p,
									match: {
										...p.match,
										date: p.match.scheduledAt.toISOString(),
									},
								}));
								return (
									<tr
										key={entry.userId}
										className={`${
											isCurrentUser
												? "bg-purple-900/30 border-l-4 border-purple-500"
												: "hover:bg-gray-900"
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
													<div className="text-sm font-medium text-gray-100">
														{entry.userName}
														{isCurrentUser && (
															<span className="ml-2 text-xs bg-purple-500/20 text-purple-300 border border-purple-500/50 px-2 py-1 rounded-full font-semibold">
																Tu
															</span>
														)}
													</div>
												</div>
											</div>
										</td>
										<td className="px-6 py-4 whitespace-nowrap text-center">
											<span className="text-2xl font-bold text-purple-600">
												{entry.points}
											</span>
										</td>
										<td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-100 font-medium">
											{entry.correctScores}
										</td>
										<td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-100 font-medium">
											{entry.correctOutcomes}
										</td>
										<td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-500">
											{entry.totalPredictions}
										</td>
										<td className="px-6 py-4 whitespace-nowrap text-center">
											<UserPredictionsModal
												userId={entry.userId}
												userName={entry.userName}
												predictions={userPredictions}
											/>
										</td>
									</tr>
								);
							})}
						</tbody>
					</table>
				</div>
			</main>
		</div>
	);
}
