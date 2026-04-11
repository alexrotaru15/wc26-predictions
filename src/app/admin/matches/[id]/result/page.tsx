import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { MatchResultForm } from "@/components/admin/MatchResultForm";

export default async function MatchResultPage({
	params,
}: {
	params: Promise<{ id: string }>;
}) {
	const session = await auth();

	if (!session?.user) {
		redirect("/login");
	}

	// Check if user is admin
	const user = await prisma.user.findUnique({
		where: { id: session.user.id },
		select: { isAdmin: true },
	});

	if (!user?.isAdmin) {
		redirect("/");
	}

	// Await params for Next.js 15+
	const { id } = await params;

	// Fetch match details
	const match = await prisma.match.findUnique({
		where: { id },
		include: {
			homeTeam: true,
			awayTeam: true,
			predictions: {
				include: {
					user: {
						select: { name: true, email: true },
					},
				},
			},
		},
	});

	if (!match) {
		redirect("/admin");
	}

	return (
		<div className="min-h-screen bg-gray-50">
			<nav className="bg-white shadow-sm border-b-4 border-red-600">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="flex justify-between items-center h-16">
						<div className="flex items-center gap-4">
							<h1 className="text-2xl font-bold text-gray-900">
								⚽ World Cup 2026
							</h1>
							<span className="bg-red-600 text-white px-3 py-1 rounded-full text-xs font-bold">
								ADMIN
							</span>
						</div>
					</div>
				</div>
			</nav>

			<main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
				<div className="mb-6">
					<a
						href="/admin"
						className="text-blue-600 hover:text-blue-700 font-medium text-sm"
					>
						← Back to Admin Dashboard
					</a>
				</div>

				<div className="bg-white rounded-lg shadow p-6">
					<h2 className="text-2xl font-bold text-gray-900 mb-6">
						{match.isFinished ? "Edit Match Result" : "Add Match Result"}
					</h2>

					{/* Match Info */}
					<div className="bg-gray-50 rounded-lg p-6 mb-6">
						<div className="flex items-center justify-between mb-4">
							<div className="flex items-center gap-3">
								<span className="text-4xl">{match.homeTeam.flagUrl}</span>
								<div>
									<div className="text-xl font-bold">{match.homeTeam.name}</div>
									<div className="text-sm text-gray-500">
										{match.homeTeam.code}
									</div>
								</div>
							</div>

							<div className="text-2xl font-bold text-gray-400">VS</div>

							<div className="flex items-center gap-3">
								<div className="text-right">
									<div className="text-xl font-bold">{match.awayTeam.name}</div>
									<div className="text-sm text-gray-500">
										{match.awayTeam.code}
									</div>
								</div>
								<span className="text-4xl">{match.awayTeam.flagUrl}</span>
							</div>
						</div>

						<div className="text-center text-sm text-gray-600">
							{new Date(match.scheduledAt).toLocaleString("ro-RO", {
								dateStyle: "full",
								timeStyle: "short",
							})}
							{match.group && ` • Group ${match.group}`}
						</div>
					</div>

					{/* Predictions Count */}
					<div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
						<p className="text-blue-800 text-sm">
							<strong>{match.predictions.length} predictions</strong> will be
							scored when you submit this result.
						</p>
					</div>

					{/* Result Form */}
					<MatchResultForm match={match} />
				</div>
			</main>
		</div>
	);
}
