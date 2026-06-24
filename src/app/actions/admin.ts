"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

// Calculate points for a prediction
function calculatePoints(
	predictedHome: number,
	predictedAway: number,
	actualHome: number,
	actualAway: number,
): number {
	// Exact score = 3 points
	if (predictedHome === actualHome && predictedAway === actualAway) {
		return 3;
	}

	// Correct outcome = 1 point
	const predictedOutcome =
		predictedHome > predictedAway
			? "home"
			: predictedHome < predictedAway
				? "away"
				: "draw";
	const actualOutcome =
		actualHome > actualAway
			? "home"
			: actualHome < actualAway
				? "away"
				: "draw";

	if (predictedOutcome === actualOutcome) {
		return 1;
	}

	// Wrong prediction = 0 points
	return 0;
}

export async function submitMatchResult({
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

		// Check if user is admin
		const user = await prisma.user.findUnique({
			where: { id: session.user.id },
			select: { isAdmin: true },
		});

		if (!user?.isAdmin) {
			return { success: false, error: "Not authorized" };
		}

		// Validate scores
		if (homeScore < 0 || awayScore < 0 || homeScore > 20 || awayScore > 20) {
			return { success: false, error: "Invalid score" };
		}

		// Get all predictions for this match
		const predictions = await prisma.prediction.findMany({
			where: { matchId },
		});

		// Calculate points for each prediction
		const updates = predictions.map((prediction) => {
			const points = calculatePoints(
				prediction.homeScore,
				prediction.awayScore,
				homeScore,
				awayScore,
			);

			return prisma.prediction.update({
				where: { id: prediction.id },
				data: { points },
			});
		});

		// Update match result and all predictions in a transaction
		await prisma.$transaction([
			prisma.match.update({
				where: { id: matchId },
				data: {
					homeScore,
					awayScore,
					isFinished: true,
				},
			}),
			...updates,
		]);

		revalidatePath("/admin");
		revalidatePath("/");

		return {
			success: true,
			predictionsScored: predictions.length,
		};
	} catch (error) {
		console.error("Error submitting match result:", error);
		return { success: false, error: "Failed to save result" };
	}
}

export async function assignTeamsToMatch({
	matchId,
	homeTeamId,
	awayTeamId,
}: {
	matchId: string;
	homeTeamId: string | null;
	awayTeamId: string | null;
}) {
	try {
		const session = await auth();
		if (!session?.user?.id) {
			return { success: false, error: "Not authenticated" };
		}

		const user = await prisma.user.findUnique({
			where: { id: session.user.id },
			select: { isAdmin: true },
		});

		if (!user?.isAdmin) {
			return { success: false, error: "Not authorized" };
		}

		await prisma.match.update({
			where: { id: matchId },
			data: {
				homeTeamId: homeTeamId || null,
				awayTeamId: awayTeamId || null,
			},
		});

		revalidatePath("/admin");
		revalidatePath("/");

		return { success: true };
	} catch (error) {
		console.error("Error assigning teams:", error);
		return { success: false, error: "Failed to assign teams" };
	}
}

export async function createMatch({
	stage,
	homeTeamId,
	awayTeamId,
	scheduledAt,
	group,
}: {
	stage: "GROUP" | "ROUND_32" | "ROUND_16" | "QUARTER" | "SEMI" | "FINAL";
	homeTeamId: string;
	awayTeamId: string;
	scheduledAt: Date;
	group?: string;
}) {
	try {
		const session = await auth();
		if (!session?.user?.id) {
			return { success: false, error: "Not authenticated" };
		}

		// Check if user is admin
		const user = await prisma.user.findUnique({
			where: { id: session.user.id },
			select: { isAdmin: true },
		});

		if (!user?.isAdmin) {
			return { success: false, error: "Not authorized" };
		}

		// Get the highest match number
		const lastMatch = await prisma.match.findFirst({
			orderBy: { matchNumber: "desc" },
			select: { matchNumber: true },
		});

		const matchNumber = (lastMatch?.matchNumber || 0) + 1;

		// Create the match
		await prisma.match.create({
			data: {
				matchNumber,
				stage,
				group,
				homeTeamId,
				awayTeamId,
				scheduledAt,
				isFinished: false,
			},
		});

		revalidatePath("/admin");
		revalidatePath("/");

		return { success: true };
	} catch (error) {
		console.error("Error creating match:", error);
		return { success: false, error: "Failed to create match" };
	}
}
