import { auth, signOut } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function Home() {
	const session = await auth();

	if (!session?.user) {
		redirect("/login");
	}

	return (
		<div className="min-h-screen bg-gray-50">
			<nav className="bg-white shadow-sm">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="flex justify-between items-center h-16">
						<div className="flex items-center">
							<h1 className="text-2xl font-bold text-gray-900">
								⚽ World Cup 2026
							</h1>
						</div>
						<div className="flex items-center gap-4">
							<span className="text-sm text-gray-700">
								{session.user.name || session.user.email}
							</span>
							<form
								action={async () => {
									"use server";
									await signOut({ redirectTo: "/login" });
								}}
							>
								<button
									type="submit"
									className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
								>
									Sign Out
								</button>
							</form>
						</div>
					</div>
				</div>
			</nav>

			<main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
				<div className="bg-white rounded-lg shadow p-6">
					<h2 className="text-3xl font-bold text-gray-900 mb-4">
						Welcome to World Cup 2026 Predictions! 🎉
					</h2>
					<p className="text-gray-600 mb-6">
						You're successfully logged in with Twitch. Here's what you can do:
					</p>

					<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
						<div className="border border-gray-200 rounded-lg p-6">
							<h3 className="text-xl font-semibold text-gray-900 mb-2">
								📊 Make Predictions
							</h3>
							<p className="text-gray-600 text-sm">
								Predict match results before they start. Earn 3 points for exact
								scores, 1 point for correct outcomes.
							</p>
						</div>

						<div className="border border-gray-200 rounded-lg p-6">
							<h3 className="text-xl font-semibold text-gray-900 mb-2">
								🏆 Join Leagues
							</h3>
							<p className="text-gray-600 text-sm">
								Create or join private leagues with friends. Compete on
								leaderboards and see who's the best predictor!
							</p>
						</div>

						<div className="border border-gray-200 rounded-lg p-6">
							<h3 className="text-xl font-semibold text-gray-900 mb-2">
								📈 Track Progress
							</h3>
							<p className="text-gray-600 text-sm">
								View your ranking, total points, and prediction history across
								all your leagues.
							</p>
						</div>
					</div>

					<div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
						<p className="text-blue-800 text-sm">
							<strong>Coming soon:</strong> Matches, predictions, and league
							management features are being built!
						</p>
					</div>
				</div>
			</main>
		</div>
	);
}
