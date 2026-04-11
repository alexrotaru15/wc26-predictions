import { config } from "dotenv";
import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import teamsData from "../worldcup_teams_meta.json";
import matchesData from "../worldcup.json";

// Load environment variables from .env.local
config({ path: ".env.local" });

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// Helper to convert UTC offset time to Romanian time (EEST = UTC+3)
function convertToRomanianTime(date: string, time: string): Date {
	// Extract UTC offset from time string (e.g., "13:00 UTC-6")
	const timeMatch = time.match(/(\d{2}):(\d{2})\s+UTC([+-]\d+)/);
	if (!timeMatch) {
		throw new Error(`Invalid time format: ${time}`);
	}

	const [, hours, minutes, utcOffset] = timeMatch;
	const offset = parseInt(utcOffset);

	// Create date in the original timezone
	const dateTime = new Date(`${date}T${hours}:${minutes}:00`);

	// Adjust from original UTC offset to UTC
	dateTime.setHours(dateTime.getHours() - offset);

	// Then adjust from UTC to Romanian time (UTC+3)
	dateTime.setHours(dateTime.getHours() + 3);

	return dateTime;
}

// Map group letter to stage
function getMatchStage(group: string): "GROUP" {
	return "GROUP";
}

// Extract group letter from "Group A" format
function extractGroupLetter(groupStr: string): string {
	return groupStr.replace("Group ", "");
}

async function main() {
	console.log("🌍 Starting World Cup 2026 database seeding...\n");

	// 1. Seed Teams
	console.log("📊 Seeding teams...");
	const teamMap = new Map<string, string>(); // name -> id

	for (const teamData of teamsData) {
		const team = await prisma.team.create({
			data: {
				name: teamData.name,
				code: teamData.fifa_code,
				flagUrl: teamData.flag_icon,
				group: teamData.group,
			},
		});
		teamMap.set(teamData.name, team.id);
		console.log(
			`  ✅ Created team: ${teamData.name} (${teamData.fifa_code}) - Group ${teamData.group}`,
		);
	}

	console.log(`\n✅ Created ${teamMap.size} teams\n`);

	// 2. Seed Matches
	console.log("⚽ Seeding matches...");
	let matchNumber = 1;

	for (const matchData of matchesData.matches) {
		const homeTeamId = teamMap.get(matchData.team1);
		const awayTeamId = teamMap.get(matchData.team2);

		if (!homeTeamId || !awayTeamId) {
			console.warn(
				`  ⚠️  Skipping match: ${matchData.team1} vs ${matchData.team2} (team not found)`,
			);
			continue;
		}

		const scheduledAt = convertToRomanianTime(matchData.date, matchData.time);
		const groupLetter = extractGroupLetter(matchData.group);

		const match = await prisma.match.create({
			data: {
				matchNumber,
				stage: getMatchStage(matchData.group),
				group: groupLetter,
				homeTeamId,
				awayTeamId,
				scheduledAt,
				isFinished: false,
			},
		});

		console.log(
			`  ✅ Match ${matchNumber}: ${matchData.team1} vs ${matchData.team2} - ${scheduledAt.toLocaleString("ro-RO", { timeZone: "Europe/Bucharest" })}`,
		);
		matchNumber++;
	}

	console.log(`\n✅ Created ${matchNumber - 1} matches\n`);
	console.log("🎉 Database seeding completed successfully!");
}

main()
	.catch((e) => {
		console.error("❌ Error seeding database:", e);
		process.exit(1);
	})
	.finally(async () => {
		await prisma.$disconnect();
		await pool.end();
	});
