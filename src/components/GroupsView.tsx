"use client";

import { useState } from "react";
import { GroupStandings } from "./GroupStandings";
import { ThirdPlaceStandings } from "./ThirdPlaceStandings";
import { CompactMatchCard } from "./CompactMatchCard";

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
};

function calculateStandings(teams: Team[], matches: Match[]): TeamStanding[] {
	const standings: Record<string, TeamStanding> = {};

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

	matches.forEach((match) => {
		if (!match.homeTeamId || !match.awayTeamId) return;

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
	const sorted = [...standings].sort((a, b) => {
		if (a.points !== b.points) return b.points - a.points;

		const tiedTeams = standings.filter((t) => t.points === a.points);

		if (
			tiedTeams.length === 2 &&
			tiedTeams.some((t) => t.team.id === a.team.id) &&
			tiedTeams.some((t) => t.team.id === b.team.id)
		) {
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

			if (aH2HPoints !== bH2HPoints) return bH2HPoints - aH2HPoints;
			if (aH2HGoalDiff !== bH2HGoalDiff) return bH2HGoalDiff - aH2HGoalDiff;
			if (aH2HGoalsFor !== bH2HGoalsFor) return bH2HGoalsFor - aH2HGoalsFor;
		}

		if (a.goalDifference !== b.goalDifference)
			return b.goalDifference - a.goalDifference;
		if (a.goalsFor !== b.goalsFor) return b.goalsFor - a.goalsFor;

		return a.team.name.localeCompare(b.team.name);
	});

	return sorted;
}

export function GroupsView({ matches, teams }: Props) {
	const groups = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L"];
	const [activeGroup, setActiveGroup] = useState<string>("A");

	// Calculate third place teams across all groups
	const thirdPlaceTeams = groups
		.map((group) => {
			const groupTeams = teams.filter((t) => t.group === group);
			const groupMatches = matches.filter((m) => m.group === group);
			const standings = calculateStandings(groupTeams, groupMatches);
			const sorted = applyTiebreaker(standings, groupMatches);

			if (sorted.length >= 3) {
				return {
					...sorted[2],
					group,
				};
			}
			return null;
		})
		.filter((t) => t !== null) as Array<TeamStanding & { group: string }>;

	// Sort third place teams
	const sortedThirdPlace = [...thirdPlaceTeams].sort((a, b) => {
		if (a.points !== b.points) return b.points - a.points;
		if (a.goalDifference !== b.goalDifference)
			return b.goalDifference - a.goalDifference;
		if (a.goalsFor !== b.goalsFor) return b.goalsFor - a.goalsFor;
		return a.team.name.localeCompare(b.team.name);
	});

	// Create a map of team ID to third place rank
	const thirdPlaceRanks = new Map<string, number>();
	sortedThirdPlace.forEach((team, index) => {
		thirdPlaceRanks.set(team.team.id, index);
	});

	// Get data for active group
	const groupTeams = teams.filter((t) => t.group === activeGroup);
	const groupMatches = matches.filter((m) => m.group === activeGroup);
	const standings = calculateStandings(groupTeams, groupMatches);
	const sorted = applyTiebreaker(standings, groupMatches);
	const thirdPlaceTeam = sorted[2];
	const thirdPlaceRank = thirdPlaceTeam
		? thirdPlaceRanks.get(thirdPlaceTeam.team.id)
		: undefined;

	return (
		<div className="space-y-6">
			{/* Group Tabs */}
			<div className="flex flex-wrap gap-2 border-b border-gray-700 pb-2">
				{groups.map((group) => (
					<button
						key={group}
						onClick={() => setActiveGroup(group)}
						className={`px-4 py-2 font-medium rounded-t-lg transition cursor-pointer ${
							activeGroup === group
								? "bg-gray-700 text-blue-400 border-b-2 border-blue-400"
								: "text-gray-400 hover:text-gray-300 hover:bg-gray-800"
						}`}
					>
						Grupa {group}
					</button>
				))}
			</div>

			{/* Active Group Content */}
			{groupTeams.length > 0 && (
				<div className="space-y-6">
					{/* Group Standings */}
					<GroupStandings
						group={activeGroup}
						teams={groupTeams}
						matches={groupMatches}
						thirdPlaceRank={thirdPlaceRank}
					/>

					{/* Group Matches */}
					{groupMatches.length > 0 && (
						<div className="space-y-3">
							<h4 className="text-sm font-medium text-gray-400 uppercase tracking-wider px-1">
								Meciurile Grupei {activeGroup}
							</h4>
							<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
								{groupMatches.map((match) => (
									<CompactMatchCard
										key={match.id}
										match={match}
									/>
								))}
							</div>
						</div>
					)}

					{/* Third Place Standings - shown on every tab */}
					{sortedThirdPlace.length > 0 && (
						<div className="pt-4">
							<ThirdPlaceStandings thirdPlaceTeams={sortedThirdPlace} />
						</div>
					)}
				</div>
			)}
		</div>
	);
}
