"use client";

import { useState } from "react";
import { MatchCard } from "./MatchCard";
import { GroupsView } from "./GroupsView";
import { KnockoutMatchCard } from "./KnockoutMatchCard";
import { ActualKnockoutBracket } from "./ActualKnockoutBracket";

type Team = {
	id: string;
	name: string;
	code: string;
	flagUrl: string | null;
	group: string | null;
};

type Match = {
	id: string;
	matchNumber: number;
	stage: string;
	group: string | null;
	scheduledAt: Date;
	homeTeamId: string | null;
	awayTeamId: string | null;
	homeTeamLabel: string | null;
	awayTeamLabel: string | null;
	homeScore: number | null;
	awayScore: number | null;
	isFinished: boolean;
	homeTeam: {
		name: string;
		code: string;
		flagUrl: string | null;
	} | null;
	awayTeam: {
		name: string;
		code: string;
		flagUrl: string | null;
	} | null;
	userPrediction: {
		homeScore: number;
		awayScore: number;
		points: number | null;
	} | null;
};

type Props = {
	matches: Match[];
	teams: Team[];
};

const STAGE_ORDER = [
	"ROUND_32",
	"ROUND_16",
	"QUARTER",
	"SEMI",
	"THIRD_PLACE",
	"FINAL",
];

const STAGE_LABELS: Record<string, string> = {
	ROUND_32: "Round of 32",
	ROUND_16: "Round of 16",
	QUARTER: "Quarter-final",
	SEMI: "Semi-final",
	THIRD_PLACE: "3rd Place Play-off",
	FINAL: "Final",
};

export function DashboardTabs({ matches, teams }: Props) {
	const [activeTab, setActiveTab] = useState<"all" | "groups">("all");

	const upcomingGroupMatches = matches.filter(
		(m) => !m.isFinished && m.stage === "GROUP",
	);

	const allKnockoutMatches = matches.filter((m) => m.stage !== "GROUP");
	const upcomingKnockoutMatches = allKnockoutMatches.filter(
		(m) => !m.isFinished,
	);

	const knockoutByStage = STAGE_ORDER.map((stage) => ({
		stage,
		label: STAGE_LABELS[stage],
		matches: upcomingKnockoutMatches
			.filter((m) => m.stage === stage)
			.sort(
				(a, b) =>
					new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime(),
			),
	})).filter((r) => r.matches.length > 0);

	return (
		<div>
			{/* Tabs */}
			<div className="flex gap-2 mb-6 border-b border-gray-700">
				<button
					onClick={() => setActiveTab("all")}
					className={`px-6 py-3 font-medium transition relative cursor-pointer ${
						activeTab === "all"
							? "text-blue-400 border-b-2 border-blue-400"
							: "text-gray-400 hover:text-gray-300"
					}`}
				>
					Toate Meciurile
				</button>
				<button
					onClick={() => setActiveTab("groups")}
					className={`px-6 py-3 font-medium transition relative cursor-pointer ${
						activeTab === "groups"
							? "text-blue-400 border-b-2 border-blue-400"
							: "text-gray-400 hover:text-gray-300"
					}`}
				>
					Grupe & Clasamente
				</button>
			</div>

			{/* Tab Content */}
			{activeTab === "all" ? (
				<div>
					{/* Upcoming group stage matches */}
					{upcomingGroupMatches.length > 0 && (
						<div className="grid grid-cols-1 gap-4 mb-8">
							{upcomingGroupMatches.map((match) => (
								<MatchCard
									key={match.id}
									// eslint-disable-next-line @typescript-eslint/no-explicit-any
									match={match as any}
								/>
							))}
						</div>
					)}

					{/* Knockout section */}
					{knockoutByStage.length > 0 && (
						<div className={upcomingGroupMatches.length > 0 ? "mt-4" : ""}>
							<div className="flex items-center gap-3 mb-6">
								<div className="flex-1 h-px bg-gray-700" />
								<h3 className="text-base font-bold text-gray-300 uppercase tracking-widest whitespace-nowrap">
									🏆 Faza Eliminatorie
								</h3>
								<div className="flex-1 h-px bg-gray-700" />
							</div>

							{knockoutByStage.map(
								({ stage, label, matches: stageMatches }) => (
									<div
										key={stage}
										className="mb-8"
									>
										<h4 className="text-xs font-semibold text-blue-400 uppercase tracking-wider mb-3 pl-1">
											{label}
										</h4>
										<div className="grid grid-cols-1 gap-3">
											{stageMatches.map((match) => (
												<KnockoutMatchCard
													key={match.id}
													match={match}
												/>
											))}
										</div>
									</div>
								),
							)}

							<ActualKnockoutBracket matches={allKnockoutMatches} />
						</div>
					)}

					{upcomingGroupMatches.length === 0 &&
						knockoutByStage.length === 0 && (
							<div className="bg-gray-800 rounded-lg shadow p-12 text-center border border-gray-700">
								<div className="text-4xl mb-4">⚽</div>
								<p className="text-gray-400">Nicio meci viitor momentan</p>
							</div>
						)}
				</div>
			) : (
				<GroupsView
					matches={matches}
					teams={teams}
				/>
			)}
		</div>
	);
}
