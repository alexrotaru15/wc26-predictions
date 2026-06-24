import { config } from "dotenv";
import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";

config({ path: ".env.local" });

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

function convertToRomanianTime(date: string, time: string): Date {
	const timeMatch = time.match(/(\d{2}):(\d{2})\s+UTC([+-]\d+)/);
	if (!timeMatch) throw new Error(`Invalid time format: ${time}`);
	const [, hours, minutes, utcOffset] = timeMatch;
	const offset = parseInt(utcOffset);
	const dateTime = new Date(`${date}T${hours}:${minutes}:00`);
	dateTime.setHours(dateTime.getHours() - offset);
	dateTime.setHours(dateTime.getHours() + 3);
	return dateTime;
}

const knockoutMatches = [
	{ num: 73, stage: "ROUND_32" as const, date: "2026-06-28", time: "12:00 UTC-7", homeLabel: "2A", awayLabel: "2B" },
	{ num: 74, stage: "ROUND_32" as const, date: "2026-06-29", time: "16:30 UTC-4", homeLabel: "1E", awayLabel: "3A/B/C/D/F" },
	{ num: 75, stage: "ROUND_32" as const, date: "2026-06-29", time: "19:00 UTC-6", homeLabel: "1F", awayLabel: "2C" },
	{ num: 76, stage: "ROUND_32" as const, date: "2026-06-29", time: "12:00 UTC-5", homeLabel: "1C", awayLabel: "2F" },
	{ num: 77, stage: "ROUND_32" as const, date: "2026-06-30", time: "17:00 UTC-4", homeLabel: "1I", awayLabel: "3C/D/F/G/H" },
	{ num: 78, stage: "ROUND_32" as const, date: "2026-06-30", time: "12:00 UTC-5", homeLabel: "2E", awayLabel: "2I" },
	{ num: 79, stage: "ROUND_32" as const, date: "2026-06-30", time: "19:00 UTC-6", homeLabel: "1A", awayLabel: "3C/E/F/H/I" },
	{ num: 80, stage: "ROUND_32" as const, date: "2026-07-01", time: "12:00 UTC-4", homeLabel: "1L", awayLabel: "3E/H/I/J/K" },
	{ num: 81, stage: "ROUND_32" as const, date: "2026-07-01", time: "17:00 UTC-7", homeLabel: "1D", awayLabel: "3B/E/F/I/J" },
	{ num: 82, stage: "ROUND_32" as const, date: "2026-07-01", time: "13:00 UTC-7", homeLabel: "1G", awayLabel: "3A/E/H/I/J" },
	{ num: 83, stage: "ROUND_32" as const, date: "2026-07-02", time: "19:00 UTC-4", homeLabel: "2K", awayLabel: "2L" },
	{ num: 84, stage: "ROUND_32" as const, date: "2026-07-02", time: "12:00 UTC-7", homeLabel: "1H", awayLabel: "2J" },
	{ num: 85, stage: "ROUND_32" as const, date: "2026-07-02", time: "20:00 UTC-7", homeLabel: "1B", awayLabel: "3E/F/G/I/J" },
	{ num: 86, stage: "ROUND_32" as const, date: "2026-07-03", time: "18:00 UTC-4", homeLabel: "1J", awayLabel: "2H" },
	{ num: 87, stage: "ROUND_32" as const, date: "2026-07-03", time: "20:30 UTC-5", homeLabel: "1K", awayLabel: "3D/E/I/J/L" },
	{ num: 88, stage: "ROUND_32" as const, date: "2026-07-03", time: "13:00 UTC-5", homeLabel: "2D", awayLabel: "2G" },
	{ num: 89, stage: "ROUND_16" as const, date: "2026-07-04", time: "17:00 UTC-4", homeLabel: "W74", awayLabel: "W77" },
	{ num: 90, stage: "ROUND_16" as const, date: "2026-07-04", time: "12:00 UTC-5", homeLabel: "W73", awayLabel: "W75" },
	{ num: 91, stage: "ROUND_16" as const, date: "2026-07-05", time: "16:00 UTC-4", homeLabel: "W76", awayLabel: "W78" },
	{ num: 92, stage: "ROUND_16" as const, date: "2026-07-05", time: "18:00 UTC-6", homeLabel: "W79", awayLabel: "W80" },
	{ num: 93, stage: "ROUND_16" as const, date: "2026-07-06", time: "14:00 UTC-5", homeLabel: "W83", awayLabel: "W84" },
	{ num: 94, stage: "ROUND_16" as const, date: "2026-07-06", time: "17:00 UTC-7", homeLabel: "W81", awayLabel: "W82" },
	{ num: 95, stage: "ROUND_16" as const, date: "2026-07-07", time: "12:00 UTC-4", homeLabel: "W86", awayLabel: "W88" },
	{ num: 96, stage: "ROUND_16" as const, date: "2026-07-07", time: "13:00 UTC-7", homeLabel: "W85", awayLabel: "W87" },
	{ num: 97, stage: "QUARTER" as const, date: "2026-07-09", time: "16:00 UTC-4", homeLabel: "W89", awayLabel: "W90" },
	{ num: 98, stage: "QUARTER" as const, date: "2026-07-10", time: "12:00 UTC-7", homeLabel: "W93", awayLabel: "W94" },
	{ num: 99, stage: "QUARTER" as const, date: "2026-07-11", time: "17:00 UTC-4", homeLabel: "W91", awayLabel: "W92" },
	{ num: 100, stage: "QUARTER" as const, date: "2026-07-11", time: "20:00 UTC-5", homeLabel: "W95", awayLabel: "W96" },
	{ num: 101, stage: "SEMI" as const, date: "2026-07-14", time: "14:00 UTC-5", homeLabel: "W97", awayLabel: "W98" },
	{ num: 102, stage: "SEMI" as const, date: "2026-07-15", time: "15:00 UTC-4", homeLabel: "W99", awayLabel: "W100" },
	{ num: 103, stage: "THIRD_PLACE" as const, date: "2026-07-18", time: "17:00 UTC-4", homeLabel: "L101", awayLabel: "L102" },
	{ num: 104, stage: "FINAL" as const, date: "2026-07-19", time: "15:00 UTC-4", homeLabel: "W101", awayLabel: "W102" },
];

async function main() {
	console.log("⚽ Seeding knockout matches...\n");

	for (const m of knockoutMatches) {
		const scheduledAt = convertToRomanianTime(m.date, m.time);

		const existing = await prisma.match.findUnique({
			where: { matchNumber: m.num },
		});

		if (existing) {
			console.log(`  ⚠️  Match ${m.num} already exists — skipping`);
			continue;
		}

		await prisma.match.create({
			data: {
				matchNumber: m.num,
				stage: m.stage,
				homeTeamLabel: m.homeLabel,
				awayTeamLabel: m.awayLabel,
				scheduledAt,
				isFinished: false,
			},
		});

		console.log(
			`  ✅ Match ${m.num} (${m.stage}): ${m.homeLabel} vs ${m.awayLabel} — ${scheduledAt.toLocaleString("ro-RO", { timeZone: "Europe/Bucharest" })}`,
		);
	}

	console.log("\n🎉 Knockout matches seeded successfully!");
}

main()
	.catch((e) => {
		console.error("❌ Error seeding knockout matches:", e);
		process.exit(1);
	})
	.finally(async () => {
		await prisma.$disconnect();
		await pool.end();
	});
