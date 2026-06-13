"use client";

import { getFlagUrl } from "@/lib/flags";

type TeamStanding = {
	team: { id: string; name: string; code: string; flagUrl: string | null };
	played: number;
	won: number;
	drawn: number;
	lost: number;
	goalsFor: number;
	goalsAgainst: number;
	goalDifference: number;
	points: number;
	group?: string;
};

type Props = {
	groupStandings: Record<string, TeamStanding[]>;
	thirdPlaceTeams: Array<TeamStanding & { group: string }>;
};

type Match = {
	id: number;
	team1: string;
	team2: string;
};

function resolveTeamCode(
	code: string,
	groupStandings: Record<string, TeamStanding[]>,
	thirdPlaceAllocation: Record<string, string>,
): string {
	const groupMatch = code.match(/^(\d)([A-L])$/);
	if (groupMatch) {
		const position = parseInt(groupMatch[1]);
		const group = groupMatch[2];
		const standings = groupStandings[group];
		if (standings && standings[position - 1]) {
			return standings[position - 1].team.code;
		}
		return `${position}${group}`;
	}

	if (code.startsWith("3") && code.includes("/")) {
		return thirdPlaceAllocation[code] || code;
	}

	return code;
}

function isPlaceholder(name: string): boolean {
	return (
		name.includes("/") ||
		name.startsWith("W") ||
		name.startsWith("L") ||
		/^\d[A-L]$/.test(name)
	);
}

export function KnockoutBracket({ groupStandings, thirdPlaceTeams }: Props) {
	// Allocate third place teams to bracket positions
	const thirdPlaceAllocation: Record<string, string> = {};

	const slots = [
		"3A/B/C/D/F",
		"3C/D/F/G/H",
		"3C/E/F/H/I",
		"3E/H/I/J/K",
		"3B/E/F/I/J",
		"3A/E/H/I/J",
		"3E/F/G/I/J",
		"3D/E/I/J/L",
	];

	// Create map of teams that can go in each slot
	const teamsBySlot = slots.map((slot) => {
		const allowedGroups = slot.replace("3", "").split("/");
		return {
			slot,
			teams: thirdPlaceTeams.filter((t) => allowedGroups.includes(t.group)),
		};
	});

	// Backtracking allocation to ensure all 8 teams are placed
	const usedTeams = new Set<string>();

	function allocate(slotIndex: number): boolean {
		if (slotIndex === slots.length) return true;

		const { slot, teams } = teamsBySlot[slotIndex];
		for (const team of teams) {
			if (!usedTeams.has(team.group)) {
				usedTeams.add(team.group);
				thirdPlaceAllocation[slot] = team.team.code;

				if (allocate(slotIndex + 1)) return true;

				usedTeams.delete(team.group);
				delete thirdPlaceAllocation[slot];
			}
		}
		return false;
	}

	allocate(0);

	const rounds = [
		{
			title: "Round of 32",
			matches: [
				{
					id: 74,
					team1: resolveTeamCode("1E", groupStandings, thirdPlaceAllocation),
					team2: resolveTeamCode(
						"3A/B/C/D/F",
						groupStandings,
						thirdPlaceAllocation,
					),
				},
				{
					id: 77,
					team1: resolveTeamCode("1I", groupStandings, thirdPlaceAllocation),
					team2: resolveTeamCode(
						"3C/D/F/G/H",
						groupStandings,
						thirdPlaceAllocation,
					),
				},
				{
					id: 73,
					team1: resolveTeamCode("2A", groupStandings, thirdPlaceAllocation),
					team2: resolveTeamCode("2B", groupStandings, thirdPlaceAllocation),
				},
				{
					id: 75,
					team1: resolveTeamCode("1F", groupStandings, thirdPlaceAllocation),
					team2: resolveTeamCode("2C", groupStandings, thirdPlaceAllocation),
				},
				{
					id: 83,
					team1: resolveTeamCode("2K", groupStandings, thirdPlaceAllocation),
					team2: resolveTeamCode("2L", groupStandings, thirdPlaceAllocation),
				},
				{
					id: 84,
					team1: resolveTeamCode("1H", groupStandings, thirdPlaceAllocation),
					team2: resolveTeamCode("2J", groupStandings, thirdPlaceAllocation),
				},
				{
					id: 81,
					team1: resolveTeamCode("1D", groupStandings, thirdPlaceAllocation),
					team2: resolveTeamCode(
						"3B/E/F/I/J",
						groupStandings,
						thirdPlaceAllocation,
					),
				},
				{
					id: 82,
					team1: resolveTeamCode("1G", groupStandings, thirdPlaceAllocation),
					team2: resolveTeamCode(
						"3A/E/H/I/J",
						groupStandings,
						thirdPlaceAllocation,
					),
				},
				{
					id: 76,
					team1: resolveTeamCode("1C", groupStandings, thirdPlaceAllocation),
					team2: resolveTeamCode("2F", groupStandings, thirdPlaceAllocation),
				},
				{
					id: 78,
					team1: resolveTeamCode("2E", groupStandings, thirdPlaceAllocation),
					team2: resolveTeamCode("2I", groupStandings, thirdPlaceAllocation),
				},
				{
					id: 79,
					team1: resolveTeamCode("1A", groupStandings, thirdPlaceAllocation),
					team2: resolveTeamCode(
						"3C/E/F/H/I",
						groupStandings,
						thirdPlaceAllocation,
					),
				},
				{
					id: 80,
					team1: resolveTeamCode("1L", groupStandings, thirdPlaceAllocation),
					team2: resolveTeamCode(
						"3E/H/I/J/K",
						groupStandings,
						thirdPlaceAllocation,
					),
				},
				{
					id: 86,
					team1: resolveTeamCode("1J", groupStandings, thirdPlaceAllocation),
					team2: resolveTeamCode("2H", groupStandings, thirdPlaceAllocation),
				},
				{
					id: 88,
					team1: resolveTeamCode("2D", groupStandings, thirdPlaceAllocation),
					team2: resolveTeamCode("2G", groupStandings, thirdPlaceAllocation),
				},
				{
					id: 85,
					team1: resolveTeamCode("1B", groupStandings, thirdPlaceAllocation),
					team2: resolveTeamCode(
						"3E/F/G/I/J",
						groupStandings,
						thirdPlaceAllocation,
					),
				},
				{
					id: 87,
					team1: resolveTeamCode("1K", groupStandings, thirdPlaceAllocation),
					team2: resolveTeamCode(
						"3D/E/I/J/L",
						groupStandings,
						thirdPlaceAllocation,
					),
				},
			],
		},
		{
			title: "Round of 16",
			matches: [
				{ id: 89, team1: "W74", team2: "W77" },
				{ id: 90, team1: "W73", team2: "W75" },
				{ id: 93, team1: "W83", team2: "W84" },
				{ id: 94, team1: "W81", team2: "W82" },
				{ id: 91, team1: "W76", team2: "W78" },
				{ id: 92, team1: "W79", team2: "W80" },
				{ id: 95, team1: "W86", team2: "W88" },
				{ id: 96, team1: "W85", team2: "W87" },
			],
		},
		{
			title: "Quarter-finals",
			matches: [
				{ id: 97, team1: "W89", team2: "W90" },
				{ id: 98, team1: "W93", team2: "W94" },
				{ id: 99, team1: "W91", team2: "W92" },
				{ id: 100, team1: "W95", team2: "W96" },
			],
		},
		{
			title: "Semi-finals",
			matches: [
				{ id: 101, team1: "W97", team2: "W98" },
				{ id: 102, team1: "W99", team2: "W100" },
			],
		},
		{
			title: "3rd Place",
			matches: [{ id: 103, team1: "L101", team2: "L102" }],
		},
		{
			title: "Final",
			matches: [{ id: 104, team1: "W101", team2: "W102" }],
		},
	];

	return (
		<div className="mt-6">
			<h3 className="text-lg font-bold text-gray-100 mb-4">
				Faza Eliminatoare
			</h3>

			<style jsx>{`
				.bracket {
					display: flex;
					flex-direction: row;
					overflow-x: auto;
				}
				.round {
					display: flex;
					flex-direction: column;
					justify-content: center;
				}
				.round-title {
					color: #8f8f8f;
					font-weight: 400;
					text-align: center;
					font-size: 14px;
					margin-bottom: 8px;
				}
				.seeds-list {
					margin: 0;
					padding: 0;
					display: flex;
					flex-direction: column;
					justify-content: space-around;
					height: 100%;
				}
				.seed {
					padding: 1em 1.5em;
					min-width: 225px;
					position: relative;
					display: flex;
					align-items: center;
					flex-direction: column;
					justify-content: center;
					font-size: 14px;
				}
				.seed::after {
					content: "";
					position: absolute;
					height: 50%;
					width: 1.5em;
					right: 0px;
				}
				.seed:nth-child(even)::before {
					content: "";
					border-top: 1px solid #707070;
					position: absolute;
					top: -0.5px;
					width: 1.5em;
					right: -1.5em;
				}
				.seed:nth-child(even)::after {
					border-bottom: 1px solid #707070;
					border-right: 1px solid #707070;
					top: -0.5px;
				}
				.seed:nth-child(odd):not(:last-child)::after {
					border-top: 1px solid #707070;
					border-right: 1px solid #707070;
					top: calc(50% - 0.5px);
				}
				.seed-item {
					color: #fff;
					width: 100%;
					background-color: #1a1d2e;
					padding: 0;
					border-radius: 0.2em;
					box-shadow: 0 2px 4px -2px #111630;
					text-align: center;
				}
				.seed-team {
					padding: 0.3rem 0.5rem;
					display: flex;
					align-items: center;
					gap: 6px;
					border-radius: 0.2em;
				}
			`}</style>

			<div className="bracket">
				{rounds.map((round, roundIdx) => (
					<div
						key={roundIdx}
						className="round"
					>
						<div className="round-title">{round.title}</div>
						<div className="seeds-list">
							{round.matches.map((match) => (
								<div
									key={match.id}
									className="seed"
								>
									<div className="seed-item">
										<div>
											<div className="seed-team">
												{!isPlaceholder(match.team1) && (
													<img
														src={getFlagUrl(match.team1)}
														alt=""
														style={{
															width: "14px",
															height: "10px",
															objectFit: "cover",
															borderRadius: "2px",
														}}
													/>
												)}
												<span>{match.team1 || "-----------"}</span>
											</div>
											<div className="seed-team">
												{!isPlaceholder(match.team2) && (
													<img
														src={getFlagUrl(match.team2)}
														alt=""
														style={{
															width: "14px",
															height: "10px",
															objectFit: "cover",
															borderRadius: "2px",
														}}
													/>
												)}
												<span>{match.team2 || "-----------"}</span>
											</div>
										</div>
									</div>
								</div>
							))}
						</div>
					</div>
				))}
			</div>
		</div>
	);
}
