import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

export default async function JoinLeagueByLinkPage({
	params,
}: {
	params: Promise<{ inviteCode: string }>;
}) {
	const session = await auth();

	if (!session?.user) {
		// Redirect to login with return URL
		const { inviteCode } = await params;
		redirect(`/login?returnUrl=/leagues/join/${inviteCode}`);
	}

	const { inviteCode } = await params;

	// Find league by invite code
	const league = await prisma.league.findUnique({
		where: { inviteCode: inviteCode.toUpperCase() },
	});

	if (!league) {
		redirect("/leagues?error=invalid-code");
	}

	// Check if already a member
	const existingMember = await prisma.leagueMember.findUnique({
		where: {
			leagueId_userId: {
				leagueId: league.id,
				userId: session.user.id,
			},
		},
	});

	if (existingMember) {
		// Already a member, just redirect to league
		redirect(`/leagues/${league.id}`);
	}

	// Add user to league
	await prisma.leagueMember.create({
		data: {
			userId: session.user.id,
			leagueId: league.id,
		},
	});

	// Redirect to league page with success message
	redirect(`/leagues/${league.id}?joined=true`);
}
