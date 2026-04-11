import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { CreateMatchForm } from "@/components/admin/CreateMatchForm";
import Link from "next/link";

export default async function CreateMatchPage() {
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

	// Get all teams for selection
	const teams = await prisma.team.findMany({
		orderBy: { name: "asc" },
	});

	return (
		<div className="min-h-screen bg-gray-900">
			<nav className="bg-gray-800 shadow-sm">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="flex justify-between items-center h-16">
						<div className="flex items-center gap-4">
							<Link
								href="/admin"
								className="text-2xl font-bold text-gray-100 hover:text-gray-300"
							>
								⚽ Admin Panel
							</Link>
							<span className="text-gray-400">→</span>
							<span className="text-gray-400">Create Match</span>
						</div>
					</div>
				</div>
			</nav>

			<main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
				<div className="mb-6">
					<Link
						href="/admin"
						className="text-blue-600 hover:text-blue-700 font-medium text-sm"
					>
						← Back to Admin Dashboard
					</Link>
				</div>

				<div className="bg-gray-800 rounded-lg shadow p-8">
					<h1 className="text-3xl font-bold text-gray-100 mb-2">
						Create New Match
					</h1>
					<p className="text-gray-400 mb-8">
						Create a new match for knockout stages or future group matches
					</p>

					<CreateMatchForm teams={teams} />
				</div>
			</main>
		</div>
	);
}
