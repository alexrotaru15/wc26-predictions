import { config } from "dotenv";
import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";

// Load environment variables from .env.local
config({ path: ".env.local" });

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
	const email = process.argv[2];

	if (!email) {
		console.error("❌ Please provide an email address");
		console.log("Usage: npm run make-admin <email>");
		process.exit(1);
	}

	const user = await prisma.user.findFirst({
		where: { email },
	});

	if (!user) {
		console.error(`❌ User with email ${email} not found`);
		process.exit(1);
	}

	await prisma.user.update({
		where: { id: user.id },
		data: { isAdmin: true },
	});

	console.log(`✅ User ${email} is now an admin!`);
}

main()
	.catch((e) => {
		console.error("❌ Error:", e);
		process.exit(1);
	})
	.finally(async () => {
		await prisma.$disconnect();
		await pool.end();
	});
