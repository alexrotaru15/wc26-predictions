import { config } from "dotenv";
import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";

config({ path: ".env.local" });

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const LEAGUE_ID = "cmpmpp741000004jsvr6zmanp";

async function main() {
	const league = await prisma.league.findUnique({ where: { id: LEAGUE_ID } });
	if (!league) {
		console.error(`League with id "${LEAGUE_ID}" not found.`);
		process.exit(1);
	}
	console.log(`Enrolling users into league: "${league.name}"`);

	const users = await prisma.user.findMany({
		select: { id: true, name: true, email: true },
	});
	console.log(`Found ${users.length} users.`);

	let added = 0;
	let skipped = 0;

	for (const user of users) {
		const result = await prisma.leagueMember.upsert({
			where: { leagueId_userId: { leagueId: LEAGUE_ID, userId: user.id } },
			update: {},
			create: { leagueId: LEAGUE_ID, userId: user.id },
		});
		if (result) {
			console.log(`  ✓ ${user.name || user.email || user.id}`);
			added++;
		}
	}

	console.log(`\nDone. ${added} users enrolled (${skipped} already members).`);
}

main()
	.catch((e) => {
		console.error(e);
		process.exit(1);
	})
	.finally(() => prisma.$disconnect());
