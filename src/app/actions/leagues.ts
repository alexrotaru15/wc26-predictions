"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

// Generate a random 6-character invite code
function generateInviteCode(): string {
	const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // Removed confusing chars
	let code = "";
	for (let i = 0; i < 6; i++) {
		code += chars.charAt(Math.floor(Math.random() * chars.length));
	}
	return code;
}

export async function createLeague({
	name,
	creatorId,
}: {
	name: string;
	creatorId: string;
}) {
	try {
		const session = await auth();
		if (!session?.user?.id || session.user.id !== creatorId) {
			return { success: false, error: "Not authenticated" };
		}

		// Generate unique invite code
		let inviteCode = generateInviteCode();
		let attempts = 0;
		while (attempts < 10) {
			const existing = await prisma.league.findUnique({
				where: { inviteCode },
			});
			if (!existing) break;
			inviteCode = generateInviteCode();
			attempts++;
		}

		// Create league and add creator as member
		const league = await prisma.league.create({
			data: {
				name,
				inviteCode,
				createdById: creatorId,
				members: {
					create: {
						userId: creatorId,
					},
				},
			},
		});

		revalidatePath("/leagues");
		return { success: true, inviteCode: league.inviteCode };
	} catch (error) {
		console.error("Error creating league:", error);
		return { success: false, error: "Failed to create league" };
	}
}

export async function joinLeague({
	inviteCode,
	userId,
}: {
	inviteCode: string;
	userId: string;
}) {
	try {
		const session = await auth();
		if (!session?.user?.id || session.user.id !== userId) {
			return { success: false, error: "Not authenticated" };
		}

		// Find league by invite code
		const league = await prisma.league.findUnique({
			where: { inviteCode },
		});

		if (!league) {
			return { success: false, error: "Invalid invite code" };
		}

		// Check if already a member
		const existingMember = await prisma.leagueMember.findUnique({
			where: {
				leagueId_userId: {
					leagueId: league.id,
					userId,
				},
			},
		});

		if (existingMember) {
			return { success: false, error: "Already a member of this league" };
		}

		// Add user to league
		await prisma.leagueMember.create({
			data: {
				userId,
				leagueId: league.id,
			},
		});

		revalidatePath("/leagues");
		return { success: true, leagueName: league.name };
	} catch (error) {
		console.error("Error joining league:", error);
		return { success: false, error: "Failed to join league" };
	}
}
