"use client";

import { getFlagUrl } from "@/lib/flags";

type Team = {
	id: string;
	name: string;
	code: string;
	flagUrl: string | null;
};

type Match = {
	id: string;
	homeTeamId: string | null;
	awayTeamId: string | null;
	homeScore: number | null;
	awayScore: number | null;
	isFinished: boolean;
	userPrediction: {
		homeScore: number;
		awayScore: number;
	} | null;
};

type TeamStanding = {
	team: Team;
	played: number;
	won: number;
	drawn: number;
	lost: number;
	goalsFor: number;
	goalsAgainst: number;
	goalDifference: number;
	points: number;
	isQualified?: boolean;
	isThirdPlaceQualified?: boolean;
};

type Props = {
	group: string;
	teams: Team[];
	matches: Match[];
	thirdPlaceRank?: number;
};

function calculateStandings(teams: Team[], matches: Match[]): TeamStanding[] {
	const standings: Record<string, TeamStanding> = {};

	// Initialize standings
	teams.forEach((team) => {
		standings[team.id] = {
			team,
			played: 0,
			won: 0,
			drawn: 0,
			lost: 0,
			goalsFor: 0,
			goalsAgainst: 0,
			goalDifference: 0,
			points: 0,
		};
	});

	// Process matches
	matches.forEach((match) => {
		if (!match.homeTeamId || !match.awayTeamId) return;

		let homeScore: number | null = null;
		let awayScore: number | null = null;

		// Use actual score if finished, otherwise use prediction
		if (match.isFinished) {
			homeScore = match.homeScore;
			awayScore = match.awayScore;
		} else if (match.userPrediction) {
			homeScore = match.userPrediction.homeScore;
			awayScore = match.userPrediction.awayScore;
		}

		if (homeScore === null || awayScore === null) return;

		const homeTeam = standings[match.homeTeamId];
		const awayTeam = standings[match.awayTeamId];

		if (!homeTeam || !awayTeam) return;

		homeTeam.played++;
		awayTeam.played++;
		homeTeam.goalsFor += homeScore;
		homeTeam.goalsAgainst += awayScore;
		awayTeam.goalsFor += awayScore;
		awayTeam.goalsAgainst += homeScore;

		if (homeScore > awayScore) {
			homeTeam.won++;
			homeTeam.points += 3;
			awayTeam.lost++;
		} else if (awayScore > homeScore) {
			awayTeam.won++;
			awayTeam.points += 3;
			homeTeam.lost++;
		} else {
			homeTeam.drawn++;
			awayTeam.drawn++;
			homeTeam.points += 1;
			awayTeam.points += 1;
		}

		homeTeam.goalDifference = homeTeam.goalsFor - homeTeam.goalsAgainst;
		awayTeam.goalDifference = awayTeam.goalsFor - awayTeam.goalsAgainst;
	});

	return Object.values(standings);
}

function applyTiebreaker(
	standings: TeamStanding[],
	matches: Match[],
): TeamStanding[] {
	// Sort by points first
	const sorted = [...standings].sort((a, b) => {
		if (a.points !== b.points) return b.points - a.points;

		// Find teams with same points for head-to-head
		const tiedTeams = standings.filter((t) => t.points === a.points);

		if (
			tiedTeams.length === 2 &&
			tiedTeams.some((t) => t.team.id === a.team.id) &&
			tiedTeams.some((t) => t.team.id === b.team.id)
		) {
			// Head-to-head between two teams
			const h2hMatches = matches.filter(
				(m) =>
					(m.homeTeamId === a.team.id && m.awayTeamId === b.team.id) ||
					(m.homeTeamId === b.team.id && m.awayTeamId === a.team.id),
			);

			let aH2HPoints = 0;
			let bH2HPoints = 0;
			let aH2HGoalsFor = 0;
			let bH2HGoalsFor = 0;
			let aH2HGoalDiff = 0;
			let bH2HGoalDiff = 0;

			h2hMatches.forEach((match) => {
				let homeScore: number | null = null;
				let awayScore: number | null = null;

				if (match.isFinished) {
					homeScore = match.homeScore;
					awayScore = match.awayScore;
				} else if (match.userPrediction) {
					homeScore = match.userPrediction.homeScore;
					awayScore = match.userPrediction.awayScore;
				}

				if (homeScore === null || awayScore === null) return;

				if (match.homeTeamId === a.team.id) {
					aH2HGoalsFor += homeScore;
					bH2HGoalsFor += awayScore;
					aH2HGoalDiff += homeScore - awayScore;
					bH2HGoalDiff += awayScore - homeScore;

					if (homeScore > awayScore) aH2HPoints += 3;
					else if (awayScore > homeScore) bH2HPoints += 3;
					else {
						aH2HPoints += 1;
						bH2HPoints += 1;
					}
				} else {
					bH2HGoalsFor += homeScore;
					aH2HGoalsFor += awayScore;
					bH2HGoalDiff += homeScore - awayScore;
					aH2HGoalDiff += awayScore - homeScore;

					if (homeScore > awayScore) bH2HPoints += 3;
					else if (awayScore > homeScore) aH2HPoints += 3;
					else {
						aH2HPoints += 1;
						bH2HPoints += 1;
					}
				}
			});

			// Apply FIFA tiebreaker rules
			if (aH2HPoints !== bH2HPoints) return bH2HPoints - aH2HPoints;
			if (aH2HGoalDiff !== bH2HGoalDiff) return bH2HGoalDiff - aH2HGoalDiff;
			if (aH2HGoalsFor !== bH2HGoalsFor) return bH2HGoalsFor - aH2HGoalsFor;
		}

		// Fall back to overall stats
		if (a.goalDifference !== b.goalDifference)
			return b.goalDifference - a.goalDifference;
		if (a.goalsFor !== b.goalsFor) return b.goalsFor - a.goalsFor;

		return a.team.name.localeCompare(b.team.name);
	});

	return sorted;
}

export function GroupStandings({
	group,
	teams,
	matches,
	thirdPlaceRank,
}: Props) {
	const standings = calculateStandings(teams, matches);
	const sortedStandings = applyTiebreaker(standings, matches);

	return (
		<div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
			<div className="bg-gray-750 px-4 py-3 border-b border-gray-700">
				<h3 className="text-lg font-bold text-gray-100">Group {group}</h3>
			</div>
			<div className="overflow-x-auto">
				<table className="w-full">
					<thead className="bg-gray-750/50 text-xs text-gray-400 uppercase">
						<tr>
							<th className="px-4 py-2 text-left">#</th>
							<th className="px-4 py-2 text-left">Team</th>
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
						{sortedStandings.map((standing, index) => {
							const isTop2 = index < 2;
							const isThird = index === 2;
							const isThirdQualified =
								isThird && thirdPlaceRank !== undefined && thirdPlaceRank < 8;

							return (
								<tr
									key={standing.team.id}
									className={`
										${isTop2 ? "bg-green-900/20 border-l-4 border-green-500" : ""}
										${isThirdQualified ? "bg-yellow-900/20 border-l-4 border-yellow-500" : ""}
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
