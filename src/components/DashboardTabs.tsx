"use client";

import { useState } from "react";
import { MatchCard } from "./MatchCard";
import { GroupsView } from "./GroupsView";

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

export function DashboardTabs({ matches, teams }: Props) {
	const [activeTab, setActiveTab] = useState<"all" | "groups">("groups");

	// Filter unfinished matches for "All Matches" tab
	const unfinishedMatches = matches.filter((match) => !match.isFinished);

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
					{unfinishedMatches.length > 0 ? (
						<div className="grid grid-cols-1 gap-4">
							{unfinishedMatches.map((match) => (
								<MatchCard
									key={match.id}
									match={match}
								/>
							))}
						</div>
					) : (
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
