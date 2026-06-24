"use client";

import { getFlagUrl } from "@/lib/flags";

type KnockoutMatch = {
	id: string;
	matchNumber: number;
	stage: string;
	homeTeamId: string | null;
	awayTeamId: string | null;
	homeTeamLabel: string | null;
	awayTeamLabel: string | null;
	homeScore: number | null;
	awayScore: number | null;
	isFinished: boolean;
	homeTeam: { name: string; code: string; flagUrl: string | null } | null;
	awayTeam: { name: string; code: string; flagUrl: string | null } | null;
};

type Props = {
	matches: KnockoutMatch[];
};

const BRACKET_STRUCTURE = [
	{
		title: "Round of 32",
		matchNumbers: [74, 77, 73, 75, 83, 84, 81, 82, 76, 78, 79, 80, 86, 88, 85, 87],
	},
	{
		title: "Round of 16",
		matchNumbers: [89, 90, 93, 94, 91, 92, 95, 96],
	},
	{
		title: "Quarter-finals",
		matchNumbers: [97, 98, 99, 100],
	},
	{
		title: "Semi-finals",
		matchNumbers: [101, 102],
	},
	{
		title: "3rd Place",
		matchNumbers: [103],
	},
	{
		title: "Final",
		matchNumbers: [104],
	},
];

function getTeamDisplay(
	match: KnockoutMatch,
	side: "home" | "away",
): { label: string; code: string | null; hasFlag: boolean } {
	const team = side === "home" ? match.homeTeam : match.awayTeam;
	const fallback =
		(side === "home" ? match.homeTeamLabel : match.awayTeamLabel) || "TBD";

	if (team) {
		return { label: team.code, code: team.code, hasFlag: true };
	}
	return { label: fallback, code: null, hasFlag: false };
}

export function ActualKnockoutBracket({ matches }: Props) {
	const matchByNumber = new Map(matches.map((m) => [m.matchNumber, m]));

	return (
		<div className="mt-6">
			<h3 className="text-lg font-bold text-gray-100 mb-4">
				Faza Eliminatorie — Bracket
			</h3>

			<style jsx>{`
				.ab-bracket {
					display: flex;
					flex-direction: row;
					overflow-x: auto;
				}
				.ab-round {
					display: flex;
					flex-direction: column;
					justify-content: center;
				}
				.ab-round-title {
					color: #8f8f8f;
					font-weight: 400;
					text-align: center;
					font-size: 14px;
					margin-bottom: 8px;
				}
				.ab-seeds-list {
					margin: 0;
					padding: 0;
					display: flex;
					flex-direction: column;
					justify-content: space-around;
					height: 100%;
				}
				.ab-seed {
					padding: 1em 1.5em;
					min-width: 200px;
					position: relative;
					display: flex;
					align-items: center;
					flex-direction: column;
					justify-content: center;
					font-size: 14px;
				}
				.ab-seed::after {
					content: "";
					position: absolute;
					height: 50%;
					width: 1.5em;
					right: 0px;
				}
				.ab-seed:nth-child(even)::before {
					content: "";
					border-top: 1px solid #707070;
					position: absolute;
					top: -0.5px;
					width: 1.5em;
					right: -1.5em;
				}
				.ab-seed:nth-child(even)::after {
					border-bottom: 1px solid #707070;
					border-right: 1px solid #707070;
					top: -0.5px;
				}
				.ab-seed:nth-child(odd):not(:last-child)::after {
					border-top: 1px solid #707070;
					border-right: 1px solid #707070;
					top: calc(50% - 0.5px);
				}
				.ab-seed-item {
					color: #fff;
					width: 100%;
					background-color: #1a1d2e;
					padding: 0;
					border-radius: 0.2em;
					box-shadow: 0 2px 4px -2px #111630;
				}
				.ab-seed-team {
					padding: 0.3rem 0.5rem;
					display: flex;
					align-items: center;
					gap: 6px;
				}
				.ab-seed-score {
					padding: 0.2rem 0.5rem;
					font-size: 11px;
					color: #9ca3af;
					border-top: 1px solid #2a2d3e;
					display: flex;
					justify-content: center;
					gap: 6px;
					font-weight: 600;
				}
			`}</style>

			<div className="ab-bracket">
				{BRACKET_STRUCTURE.map((round, roundIdx) => (
					<div
						key={roundIdx}
						className="ab-round"
					>
						<div className="ab-round-title">{round.title}</div>
						<div className="ab-seeds-list">
							{round.matchNumbers.map((num) => {
								const match = matchByNumber.get(num);
								if (!match) return null;
								const home = getTeamDisplay(match, "home");
								const away = getTeamDisplay(match, "away");

								return (
									<div
										key={num}
										className="ab-seed"
									>
										<div className="ab-seed-item">
											<div className="ab-seed-team">
												{home.hasFlag && home.code && (
													<img
														src={getFlagUrl(home.code)}
														alt=""
														style={{
															width: "14px",
															height: "10px",
															objectFit: "cover",
															borderRadius: "2px",
														}}
													/>
												)}
												<span
													style={{
														color: home.hasFlag ? "#fff" : "#6b7280",
														fontSize: "13px",
													}}
												>
													{home.label}
												</span>
											</div>
											<div className="ab-seed-team">
												{away.hasFlag && away.code && (
													<img
														src={getFlagUrl(away.code)}
														alt=""
														style={{
															width: "14px",
															height: "10px",
															objectFit: "cover",
															borderRadius: "2px",
														}}
													/>
												)}
												<span
													style={{
														color: away.hasFlag ? "#fff" : "#6b7280",
														fontSize: "13px",
													}}
												>
													{away.label}
												</span>
											</div>
											{match.isFinished && (
												<div className="ab-seed-score">
													<span>{match.homeScore}</span>
													<span>–</span>
													<span>{match.awayScore}</span>
												</div>
											)}
										</div>
									</div>
								);
							})}
						</div>
					</div>
				))}
			</div>
		</div>
	);
}
