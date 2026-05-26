"use client";

import { useState, useEffect } from "react";
import { getFlagUrl } from "@/lib/flags";

type TeamStanding = {
	rank: number;
	teamName: string;
	teamCode: string;
	teamFlag: string;
	played: number;
	won: number;
	drawn: number;
	lost: number;
	goalsFor: number;
	goalsAgainst: number;
	goalDifference: number;
	points: number;
};

type GroupMatch = {
	id: string;
	scheduledAt: string;
	homeTeam: {
		code: string;
		flagUrl: string;
	};
	awayTeam: {
		code: string;
		flagUrl: string;
	};
	homeScore: number | null;
	awayScore: number | null;
	isFinished: boolean;
};

type GroupData = {
	standings: TeamStanding[];
	matches: GroupMatch[];
};

export function GroupLeaderboard({
	group,
	isOpen,
	onClose,
}: {
	group: string;
	isOpen: boolean;
	onClose: () => void;
}) {
	const [standings, setStandings] = useState<TeamStanding[]>([]);
	const [matches, setMatches] = useState<GroupMatch[]>([]);
	const [loading, setLoading] = useState(false);

	useEffect(() => {
		if (isOpen) {
			fetchGroupData();
		}
	}, [isOpen, group]);

	const fetchGroupData = async () => {
		setLoading(true);
		try {
			const response = await fetch(`/api/standings/group/${group}`);
			const data: GroupData = await response.json();
			setStandings(data.standings);
			setMatches(data.matches);
		} catch (error) {
			console.error("Failed to fetch group data:", error);
		} finally {
			setLoading(false);
		}
	};

	if (!isOpen) return null;

	return (
		<div
			className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
			onClick={onClose}
		>
			<div
				className="bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-hidden"
				onClick={(e) => e.stopPropagation()}
			>
				{/* Header */}
				<div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-4 flex justify-between items-center">
					<h3 className="text-xl font-bold">Group {group} Standings</h3>
					<button
						onClick={onClose}
						className="text-white hover:text-gray-700 text-2xl font-bold"
					>
						×
					</button>
				</div>

				{/* Content */}
				<div className="overflow-y-auto max-h-[calc(80vh-80px)]">
					{loading ? (
						<div className="p-12 text-center text-gray-500">
							Loading standings...
						</div>
					) : standings.length > 0 ? (
						<table className="w-full">
							<thead className="bg-gray-900 sticky top-0">
								<tr>
									<th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
										Pos
									</th>
									<th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
										Team
									</th>
									<th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">
										P
									</th>
									<th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">
										W
									</th>
									<th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">
										D
									</th>
									<th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">
										L
									</th>
									<th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">
										GF
									</th>
									<th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">
										GA
									</th>
									<th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">
										GD
									</th>
									<th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">
										Pts
									</th>
								</tr>
							</thead>
							<tbody className="bg-gray-800 divide-y divide-gray-200">
								{standings.map((team) => (
									<tr
										key={team.rank}
										className="hover:bg-gray-900 transition"
									>
										<td className="px-4 py-3 whitespace-nowrap">
											<span className="text-sm font-bold text-gray-300">
												{team.rank}
											</span>
										</td>
										<td className="px-4 py-3 whitespace-nowrap">
											<div className="flex items-center gap-2">
												<img
													src={getFlagUrl(team.teamCode)}
													alt={team.teamCode}
													className="w-7 h-5 object-cover rounded-sm"
												/>
												<div>
													<div className="text-sm font-medium text-gray-100">
														{team.teamCode}
													</div>
												</div>
											</div>
										</td>
										<td className="px-4 py-3 text-center text-sm text-gray-300">
											{team.played}
										</td>
										<td className="px-4 py-3 text-center text-sm text-gray-300">
											{team.won}
										</td>
										<td className="px-4 py-3 text-center text-sm text-gray-300">
											{team.drawn}
										</td>
										<td className="px-4 py-3 text-center text-sm text-gray-300">
											{team.lost}
										</td>
										<td className="px-4 py-3 text-center text-sm text-gray-300">
											{team.goalsFor}
										</td>
										<td className="px-4 py-3 text-center text-sm text-gray-300">
											{team.goalsAgainst}
										</td>
										<td className="px-4 py-3 text-center text-sm font-medium text-gray-100">
											{team.goalDifference > 0 ? "+" : ""}
											{team.goalDifference}
										</td>
										<td className="px-4 py-3 text-center">
											<span className="text-sm font-bold text-blue-600">
												{team.points}
											</span>
										</td>
									</tr>
								))}
							</tbody>
						</table>
					) : (
						<div className="p-12 text-center text-gray-500">
							No matches played yet in this group
						</div>
					)}

					{/* Matches Section */}
					{matches.length > 0 && (
						<div className="border-t border-gray-700 p-6">
							<h4 className="text-lg font-bold text-gray-100 mb-4">
								Group Matches
							</h4>
							<div className="space-y-3">
								{matches.map((match) => {
									const matchDate = new Date(match.scheduledAt);
									return (
										<div
											key={match.id}
											className="flex items-center justify-between p-4 bg-gray-900 rounded-lg"
										>
											{/* Teams */}
											<div className="flex items-center gap-4 flex-1">
												<div className="flex items-center gap-2 w-24 justify-end">
													<span className="text-sm font-medium">
														{match.homeTeam.code}
													</span>
													<img
														src={getFlagUrl(match.homeTeam.code)}
														alt={match.homeTeam.code}
														className="w-7 h-5 object-cover rounded-sm"
													/>
												</div>

												{/* Score */}
												<div className="flex items-center gap-2 min-w-[80px] justify-center">
													{match.isFinished ? (
														<div className="text-xl font-bold">
															{match.homeScore} - {match.awayScore}
														</div>
													) : (
														<div className="text-sm text-gray-400 font-medium">
															vs
														</div>
													)}
												</div>

												<div className="flex items-center gap-2 w-24">
													<img
														src={getFlagUrl(match.awayTeam.code)}
														alt={match.awayTeam.code}
														className="w-7 h-5 object-cover rounded-sm"
													/>
													<span className="text-sm font-medium">
														{match.awayTeam.code}
													</span>
												</div>
											</div>

											{/* Date/Time & Status */}
											<div className="text-right">
												<div className="text-xs text-gray-500">
													{matchDate.toLocaleDateString("ro-RO", {
														day: "numeric",
														month: "short",
													})}
												</div>
												<div className="text-xs text-gray-500">
													{matchDate.toLocaleTimeString("ro-RO", {
														hour: "2-digit",
														minute: "2-digit",
													})}
												</div>
												{match.isFinished && (
													<div className="text-xs text-green-600 font-medium mt-1">
														FT
													</div>
												)}
											</div>
										</div>
									);
								})}
							</div>
						</div>
					)}
				</div>
			</div>
		</div>
	);
}
