"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function submitPrediction({
	matchId,
	homeScore,
	awayScore,
}: {
	matchId: string;
	homeScore: number;
	awayScore: number;
}) {
	try {
		const session = await auth();
		if (!session?.user?.id) {
			return { success: false, error: "Not authenticated" };
		}

		// Check if match exists and hasn't started
		const match = await prisma.match.findUnique({
			where: { id: matchId },
		});

		if (!match) {
			return { success: false, error: "Match not found" };
		}

		if (new Date() >= match.scheduledAt) {
			return { success: false, error: "Match has already started" };
		}

		if (match.isFinished) {
			return { success: false, error: "Match is finished" };
		}

		// Validate scores
		if (homeScore < 0 || awayScore < 0 || homeScore > 20 || awayScore > 20) {
			return { success: false, error: "Invalid score" };
		}

		// Upsert prediction
		await prisma.prediction.upsert({
			where: {
				userId_matchId: {
					userId: session.user.id,
					matchId,
				},
			},
			update: {
				homeScore,
				awayScore,
			},
			create: {
				userId: session.user.id,
				matchId,
				homeScore,
				awayScore,
			},
		});

		revalidatePath("/");
		return { success: true };
	} catch (error) {
		console.error("Error submitting prediction:", error);
		return { success: false, error: "Failed to save prediction" };
	}
}
