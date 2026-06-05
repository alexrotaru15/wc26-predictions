import { auth, signOut } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { CreateLeagueForm } from "@/components/leagues/CreateLeagueForm";
import { JoinLeagueForm } from "@/components/leagues/JoinLeagueForm";
import { LeagueCard } from "@/components/leagues/LeagueCard";

export default async function LeaguesPage() {
	const session = await auth();

	if (!session?.user) {
		redirect("/login");
	}

	// Check if user is admin
	const user = await prisma.user.findUnique({
		where: { id: session.user.id },
		select: { isAdmin: true },
	});

	// Get user's leagues
	const userLeagues = await prisma.leagueMember.findMany({
		where: { userId: session.user.id },
		include: {
			league: {
				include: {
					createdBy: {
						select: { name: true, email: true },
					},
					_count: {
						select: { members: true },
					},
				},
			},
		},
		orderBy: {
			joinedAt: "desc",
		},
	});

	return (
		<div className="min-h-screen bg-gray-900">
			<nav className="bg-gray-800 shadow-sm">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="flex justify-between items-center h-16">
						<div className="flex items-center">
							<Link
								href="/"
								className="text-2xl font-bold text-gray-100 hover:text-gray-300"
							>
								⚽ WC 2026
							</Link>
						</div>
						<div className="flex items-center gap-4">
							<span className="text-sm text-gray-300">
								{session.user.name || session.user.email}
							</span>
							{user?.isAdmin && (
								<Link
									href="/admin"
									className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
								>
									Admin
								</Link>
							)}
							<form
								action={async () => {
									"use server";
									await signOut({ redirectTo: "/login" });
								}}
							>
								<button
									type="submit"
									className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition cursor-pointer"
								>
									Deconectare
								</button>
							</form>
						</div>
					</div>
				</div>
			</nav>

			<main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
				{/* Header */}
				<div className="mb-8">
					<Link
						href="/"
						className="text-blue-600 hover:text-blue-700 font-medium text-sm mb-4 inline-block"
					>
						← Înapoi la Dashboard
					</Link>
					<h1 className="text-3xl font-bold text-gray-100 mb-2">
						🏆 Ligiile Mele
					</h1>
					<p className="text-gray-400">
						Creează ligi private și concurează cu prietenii
					</p>
				</div>

				<div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
					{/* Left Column - My Leagues */}
					<div className="lg:col-span-2">
						<h2 className="text-xl font-bold text-gray-100 mb-4">
							Ligiile Tale ({userLeagues.length})
						</h2>

						{userLeagues.length > 0 ? (
							<div className="space-y-4">
								{userLeagues.map(({ league }) => (
									<LeagueCard
										key={league.id}
										league={league}
									/>
								))}
							</div>
						) : (
							<div className="bg-gray-800 rounded-lg shadow p-12 text-center">
								<div className="text-4xl mb-4">🏆</div>
								<p className="text-gray-500 mb-4">
									Nu te-ai alăturat încă nicioi ligi
								</p>
								<p className="text-sm text-gray-400">
									Creează o ligă nouă sau alătură-te uneia folosind un cod de
									invitație
								</p>
							</div>
						)}
					</div>

					{/* Right Column - Create & Join */}
					<div className="space-y-6">
						{/* Creează Ligă */}
						<div className="bg-gray-800 rounded-lg shadow p-6">
							<h3 className="text-lg font-bold text-gray-100 mb-4">
								Creează Ligă
							</h3>
							<CreateLeagueForm userId={session.user.id} />
						</div>

						{/* Alătură-te Ligi */}
						<div className="bg-gray-800 rounded-lg shadow p-6">
							<h3 className="text-lg font-bold text-gray-100 mb-4">
								Alătură-te Ligi
							</h3>
							<JoinLeagueForm userId={session.user.id} />
						</div>
					</div>
				</div>
			</main>
		</div>
	);
}
