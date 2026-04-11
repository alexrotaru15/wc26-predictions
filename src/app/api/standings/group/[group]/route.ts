import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
	request: NextRequest,
	{ params }: { params: Promise<{ group: string }> },
) {
	try {
		const { group } = await params;

		// Get all GROUP STAGE matches for this specific group (finished and unfinished) to get all teams
		const allMatches = await prisma.match.findMany({
			where: {
				group: {
					equals: group,
					not: null,
				},
				stage: "GROUP",
			},
			include: {
				homeTeam: {
					select: {
						id: true,
						name: true,
						code: true,
						flagUrl: true,
					},
				},
				awayTeam: {
					select: {
						id: true,
						name: true,
						code: true,
						flagUrl: true,
					},
				},
			},
		});

		if (allMatches.length === 0) {
			return NextResponse.json([]);
		}

		// Calculate standings
		const teamStats = new Map<
			string,
			{
				teamId: string;
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
			}
		>();

		// Initialize all teams in the group with 0 stats
		for (const match of allMatches) {
			// Initialize home team if not exists
			if (!teamStats.has(match.homeTeam.id)) {
				teamStats.set(match.homeTeam.id, {
					teamId: match.homeTeam.id,
					teamName: match.homeTeam.name,
					teamCode: match.homeTeam.code,
					teamFlag: match.homeTeam.flagUrl,
					played: 0,
					won: 0,
					drawn: 0,
					lost: 0,
					goalsFor: 0,
					goalsAgainst: 0,
					goalDifference: 0,
					points: 0,
				});
			}

			// Initialize away team if not exists
			if (!teamStats.has(match.awayTeam.id)) {
				teamStats.set(match.awayTeam.id, {
					teamId: match.awayTeam.id,
					teamName: match.awayTeam.name,
					teamCode: match.awayTeam.code,
					teamFlag: match.awayTeam.flagUrl,
					played: 0,
					won: 0,
					drawn: 0,
					lost: 0,
					goalsFor: 0,
					goalsAgainst: 0,
					goalDifference: 0,
					points: 0,
				});
			}
		}

		// Process only finished matches for stats
		const finishedMatches = allMatches.filter((m) => m.isFinished);

		for (const match of finishedMatches) {
			const homeScore = match.homeScore!;
			const awayScore = match.awayScore!;

			const homeTeam = teamStats.get(match.homeTeam.id)!;
			const awayTeam = teamStats.get(match.awayTeam.id)!;

			// Update played
			homeTeam.played++;
			awayTeam.played++;

			// Update goals
			homeTeam.goalsFor += homeScore;
			homeTeam.goalsAgainst += awayScore;
			awayTeam.goalsFor += awayScore;
			awayTeam.goalsAgainst += homeScore;

			// Update results and points
			if (homeScore > awayScore) {
				// Home win
				homeTeam.won++;
				homeTeam.points += 3;
				awayTeam.lost++;
			} else if (homeScore < awayScore) {
				// Away win
				awayTeam.won++;
				awayTeam.points += 3;
				homeTeam.lost++;
			} else {
				// Draw
				homeTeam.drawn++;
				awayTeam.drawn++;
				homeTeam.points += 1;
				awayTeam.points += 1;
			}

			// Update goal difference
			homeTeam.goalDifference = homeTeam.goalsFor - homeTeam.goalsAgainst;
			awayTeam.goalDifference = awayTeam.goalsFor - awayTeam.goalsAgainst;
		}

		// Convert to array and sort by FIFA rules
		const standings = Array.from(teamStats.values())
			.sort((a, b) => {
				// 1. Points
				if (b.points !== a.points) return b.points - a.points;
				// 2. Goal difference
				if (b.goalDifference !== a.goalDifference)
					return b.goalDifference - a.goalDifference;
				// 3. Goals scored
				if (b.goalsFor !== a.goalsFor) return b.goalsFor - a.goalsFor;
				// 4. Alphabetical
				return a.teamName.localeCompare(b.teamName);
			})
			.map((team, index) => ({
				rank: index + 1,
				...team,
			}));

		// Prepare matches data sorted by date
		const matchesData = allMatches
			.sort(
				(a, b) =>
					new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime(),
			)
			.map((match) => ({
				id: match.id,
				scheduledAt: match.scheduledAt.toISOString(),
				homeTeam: {
					code: match.homeTeam.code,
					flagUrl: match.homeTeam.flagUrl,
				},
				awayTeam: {
					code: match.awayTeam.code,
					flagUrl: match.awayTeam.flagUrl,
				},
				homeScore: match.homeScore,
				awayScore: match.awayScore,
				isFinished: match.isFinished,
			}));

		return NextResponse.json({
			standings,
			matches: matchesData,
		});
	} catch (error) {
		console.error("Error fetching group standings:", error);
		return NextResponse.json(
			{ error: "Failed to fetch standings" },
			{ status: 500 },
		);
	}
}
