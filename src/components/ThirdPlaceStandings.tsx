"use client";

import { getFlagUrl } from "@/lib/flags";

type Team = {
	id: string;
	name: string;
	code: string;
	flagUrl: string | null;
	group: string | null;
};

type ThirdPlaceTeam = {
	team: Team;
	group: string;
	played: number;
	won: number;
	drawn: number;
	lost: number;
	goalsFor: number;
	goalsAgainst: number;
	goalDifference: number;
	points: number;
};

type Props = {
	thirdPlaceTeams: ThirdPlaceTeam[];
};

export function ThirdPlaceStandings({ thirdPlaceTeams }: Props) {
	// Sort third place teams by points, goal difference, goals scored
	const sortedTeams = [...thirdPlaceTeams].sort((a, b) => {
		if (a.points !== b.points) return b.points - a.points;
		if (a.goalDifference !== b.goalDifference)
			return b.goalDifference - a.goalDifference;
		if (a.goalsFor !== b.goalsFor) return b.goalsFor - a.goalsFor;
		return a.team.name.localeCompare(b.team.name);
	});

	return (
		<div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
			<div className="bg-gray-750 px-4 py-3 border-b border-gray-700">
				<h3 className="text-lg font-bold text-gray-100">
					Third Place Rankings
				</h3>
				<p className="text-xs text-gray-400 mt-1">
					Top 8 teams qualify for Round of 32
				</p>
			</div>
			<div className="overflow-x-auto">
				<table className="w-full">
					<thead className="bg-gray-750/50 text-xs text-gray-400 uppercase">
						<tr>
							<th className="px-4 py-2 text-left">#</th>
							<th className="px-4 py-2 text-left">Team</th>
							<th className="px-2 py-2 text-center">Group</th>
							<th className="px-2 py-2 text-center">P</th>
							<th className="px-2 py-2 text-center">W</th>
							<th className="px-2 py-2 text-center">D</th>
							<th className="px-2 py-2 text-center">L</th>
							<th className="px-2 py-2 text-center">GF</th>
							<th className="px-2 py-2 text-center">GA</th>
							<th className="px-2 py-2 text-center">GD</th>
							<th className="px-2 py-2 text-center font-bold">Pts</th>
						</tr>
					</thead>
					<tbody className="divide-y divide-gray-700">
						{sortedTeams.map((standing, index) => {
							const isQualified = index < 8;

							return (
								<tr
									key={standing.team.id}
									className={`
										${isQualified ? "bg-yellow-900/20 border-l-4 border-yellow-500" : "bg-gray-800/50"}
										hover:bg-gray-700/50 transition
									`}
								>
									<td className="px-4 py-3 text-gray-300 font-medium">
										{index + 1}
									</td>
									<td className="px-4 py-3">
										<div className="flex items-center gap-2">
											<img
												src={getFlagUrl(standing.team.code)}
												alt={standing.team.code}
												className="w-6 h-4 object-cover rounded"
											/>
											<span className="text-gray-100 font-medium">
												{standing.team.code}
											</span>
										</div>
									</td>
									<td className="px-2 py-3 text-center text-gray-300 font-medium">
										{standing.group}
									</td>
									<td className="px-2 py-3 text-center text-gray-300">
										{standing.played}
									</td>
									<td className="px-2 py-3 text-center text-gray-300">
										{standing.won}
									</td>
									<td className="px-2 py-3 text-center text-gray-300">
										{standing.drawn}
									</td>
									<td className="px-2 py-3 text-center text-gray-300">
										{standing.lost}
									</td>
									<td className="px-2 py-3 text-center text-gray-300">
										{standing.goalsFor}
									</td>
									<td className="px-2 py-3 text-center text-gray-300">
										{standing.goalsAgainst}
									</td>
									<td className="px-2 py-3 text-center text-gray-300">
										{standing.goalDifference > 0 ? "+" : ""}
										{standing.goalDifference}
									</td>
									<td className="px-2 py-3 text-center font-bold text-gray-100">
										{standing.points}
									</td>
								</tr>
							);
						})}
					</tbody>
				</table>
			</div>
		</div>
	);
}
