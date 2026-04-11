import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function AdminPage() {
	const session = await auth();

	if (!session?.user) {
		redirect("/login");
	}

	// Check if user is admin
	const user = await prisma.user.findUnique({
		where: { id: session.user.id },
		select: { isAdmin: true },
	});

	if (!user?.isAdmin) {
		redirect("/");
	}

	// Fetch all matches
	const matches = await prisma.match.findMany({
		include: {
			homeTeam: {
				select: { name: true, code: true, flagUrl: true },
			},
			awayTeam: {
				select: { name: true, code: true, flagUrl: true },
			},
			_count: {
				select: { predictions: true },
			},
		},
		orderBy: { scheduledAt: "asc" },
	});

	const now = new Date();
	const upcomingMatches = matches.filter((m) => new Date(m.scheduledAt) > now);
	const pastMatches = matches.filter((m) => new Date(m.scheduledAt) <= now);

	return (
		<div className="min-h-screen bg-gray-900">
			<nav className="bg-gray-800 shadow-sm border-b-4 border-red-600">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="flex justify-between items-center h-16">
						<div className="flex items-center gap-4">
							<Link
								href="/"
								className="text-2xl font-bold text-gray-100 hover:text-gray-300"
							>
								⚽ World Cup 2026
							</Link>
							<span className="bg-red-600 text-white px-3 py-1 rounded-full text-xs font-bold">
								ADMIN
							</span>
						</div>
						<div className="flex items-center gap-4">
							<Link
								href="/leaderboard"
								className="text-sm text-gray-400 hover:text-gray-100 font-medium flex items-center gap-1"
							>
								🏆 Leaderboard
							</Link>
							<Link
								href="/"
								className="text-sm text-blue-600 hover:text-blue-700 font-medium"
							>
								← Dashboard
							</Link>
						</div>
					</div>
				</div>
			</nav>

			<main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
				{/* Header */}
				<div className="mb-8 flex justify-between items-start">
					<div>
						<h1 className="text-3xl font-bold text-gray-100 mb-2">
							Admin Dashboard
						</h1>
						<p className="text-gray-400">
							Manage matches, add results, and oversee the tournament
						</p>
					</div>
					<a
						href="/admin/matches/create"
						className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium shadow-lg transition flex items-center gap-2"
					>
						<span className="text-xl">➕</span>
						Create Match
					</a>
				</div>

				{/* Quick Actions */}
				<div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
					<Link
						href="/admin/matches/create"
						className="bg-blue-600 hover:bg-blue-700 text-white p-6 rounded-lg shadow transition text-center"
					>
						<div className="text-3xl mb-2">➕</div>
						<div className="font-bold">Create Match</div>
						<div className="text-sm opacity-90">Add knockout stage matches</div>
					</Link>

					<div className="bg-green-600 text-white p-6 rounded-lg shadow text-center">
						<div className="text-3xl mb-2">📊</div>
						<div className="font-bold">{matches.length}</div>
						<div className="text-sm opacity-90">Total Matches</div>
					</div>

					<div className="bg-purple-600 text-white p-6 rounded-lg shadow text-center">
						<div className="text-3xl mb-2">⏰</div>
						<div className="font-bold">
							{pastMatches.filter((m) => !m.isFinished).length}
						</div>
						<div className="text-sm opacity-90">Pending Results</div>
					</div>
				</div>

				{/* Tabs */}
				<div className="bg-gray-800 rounded-lg shadow">
					<div className="border-b border-gray-700">
						<nav className="flex -mb-px">
							<button className="border-b-2 border-blue-600 text-blue-600 px-6 py-4 font-medium">
								Past Matches ({pastMatches.length})
							</button>
							<button className="border-b-2 border-transparent text-gray-500 hover:text-gray-300 px-6 py-4 font-medium">
								Upcoming Matches ({upcomingMatches.length})
							</button>
						</nav>
					</div>

					{/* Past Matches Table */}
					<div className="overflow-x-auto">
						<table className="w-full">
							<thead className="bg-gray-900">
								<tr>
									<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
										Date
									</th>
									<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
										Match
									</th>
									<th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">
										Score
									</th>
									<th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">
										Predictions
									</th>
									<th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">
										Status
									</th>
									<th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
										Actions
									</th>
								</tr>
							</thead>
							<tbody className="bg-gray-800 divide-y divide-gray-200">
								{pastMatches.map((match) => (
									<tr
										key={match.id}
										className="hover:bg-gray-900"
									>
										<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
											{new Date(match.scheduledAt).toLocaleDateString("ro-RO", {
												day: "numeric",
												month: "short",
												hour: "2-digit",
												minute: "2-digit",
											})}
										</td>
										<td className="px-6 py-4 whitespace-nowrap">
											<div className="flex items-center gap-2">
												<span>{match.homeTeam.flagUrl}</span>
												<span className="font-medium">
													{match.homeTeam.code}
												</span>
												<span className="text-gray-400">vs</span>
												<span className="font-medium">
													{match.awayTeam.code}
												</span>
												<span>{match.awayTeam.flagUrl}</span>
											</div>
											{match.group && (
												<div className="text-xs text-gray-500 mt-1">
													Group {match.group}
												</div>
											)}
										</td>
										<td className="px-6 py-4 whitespace-nowrap text-center">
											{match.isFinished ? (
												<span className="text-lg font-bold">
													{match.homeScore} - {match.awayScore}
												</span>
											) : (
												<span className="text-gray-400">-</span>
											)}
										</td>
										<td className="px-6 py-4 whitespace-nowrap text-center text-sm">
											{match._count.predictions}
										</td>
										<td className="px-6 py-4 whitespace-nowrap text-center">
											{match.isFinished ? (
												<span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
													Finished
												</span>
											) : (
												<span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
													Pending
												</span>
											)}
										</td>
										<td className="px-6 py-4 whitespace-nowrap text-right text-sm">
											<Link
												href={`/admin/matches/${match.id}/result`}
												className="text-blue-600 hover:text-blue-900 font-medium"
											>
												{match.isFinished ? "Edit Result" : "Add Result"}
											</Link>
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				</div>
			</main>
		</div>
	);
}
