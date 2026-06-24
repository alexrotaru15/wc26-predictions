import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { AssignTeamsForm } from "@/components/admin/AssignTeamsForm";
import { LocalDateTime } from "@/components/LocalDateTime";

const STAGE_LABELS: Record<string, string> = {
	ROUND_32: "Round of 32",
	ROUND_16: "Round of 16",
	QUARTER: "Quarter-final",
	SEMI: "Semi-final",
	THIRD_PLACE: "3rd Place",
	FINAL: "Final",
};

export default async function AssignTeamsPage({
	params,
}: {
	params: Promise<{ id: string }>;
}) {
	const { id } = await params;
	const session = await auth();

	if (!session?.user) redirect("/login");

	const user = await prisma.user.findUnique({
		where: { id: session.user.id },
		select: { isAdmin: true },
	});

	if (!user?.isAdmin) redirect("/");

	const match = await prisma.match.findUnique({
		where: { id },
		include: {
			homeTeam: { select: { id: true, name: true, code: true } },
			awayTeam: { select: { id: true, name: true, code: true } },
		},
	});

	if (!match || match.stage === "GROUP") notFound();

	const teams = await prisma.team.findMany({
		select: { id: true, name: true, code: true, flagUrl: true },
		orderBy: { name: "asc" },
	});

	return (
		<div className="min-h-screen bg-gray-900">
			<nav className="bg-gray-800 shadow-sm border-b-4 border-red-600">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="flex justify-between items-center h-16">
						<div className="flex items-center gap-4">
							<Link
								href="/"
								className="text-2xl font-bold text-gray-100 hover:text-gray-300"
							>
								⚽ World Cup 2026
							</Link>
							<span className="bg-red-600 text-white px-3 py-1 rounded-full text-xs font-bold">
								ADMIN
							</span>
						</div>
						<Link
							href="/admin?tab=upcoming"
							className="text-sm text-blue-400 hover:text-blue-300 font-medium"
						>
							← Back to Admin
						</Link>
					</div>
				</div>
			</nav>

			<main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
				<div className="mb-8">
					<h1 className="text-3xl font-bold text-gray-100 mb-2">
						Assign Teams
					</h1>
					<p className="text-gray-400">
						Match #{match.matchNumber} ·{" "}
						{STAGE_LABELS[match.stage] || match.stage} ·{" "}
						<LocalDateTime date={match.scheduledAt} />
					</p>
				</div>

				<div className="bg-gray-800 rounded-lg shadow p-6 border border-gray-700">
					<AssignTeamsForm
						matchId={match.id}
						matchNumber={match.matchNumber}
						stage={match.stage}
						homeTeamLabel={match.homeTeamLabel}
						awayTeamLabel={match.awayTeamLabel}
						currentHomeTeamId={match.homeTeamId}
						currentAwayTeamId={match.awayTeamId}
						teams={teams}
					/>
				</div>
			</main>
		</div>
	);
}
