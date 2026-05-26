"use client";

import { useState } from "react";
import { submitPrediction } from "@/app/actions/predictions";
import { GroupLeaderboard } from "./GroupLeaderboard";
import { getFlagUrl } from "@/lib/flags";

type Match = {
	id: string;
	matchNumber: number;
	scheduledAt: Date;
	homeTeam: { name: string; code: string; flagUrl: string | null };
	awayTeam: { name: string; code: string; flagUrl: string | null };
	homeScore: number | null;
	awayScore: number | null;
	isFinished: boolean;
	group: string | null;
	stage: string;
	userPrediction?: {
		homeScore: number;
		awayScore: number;
		points: number | null;
	} | null;
};

export function MatchCard({ match }: { match: Match }) {
	const [homeScore, setHomeScore] = useState(
		match.userPrediction?.homeScore?.toString() || "",
	);
	const [awayScore, setAwayScore] = useState(
		match.userPrediction?.awayScore?.toString() || "",
	);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [message, setMessage] = useState("");
	const [showLeaderboard, setShowLeaderboard] = useState(false);

	const matchDate = new Date(match.scheduledAt);
	const deadline = new Date(matchDate.getTime() - 30 * 60 * 1000);
	const canPredict = new Date() < deadline && !match.isFinished;
	const isGroupStage = match.stage === "GROUP";

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!homeScore || !awayScore) return;

		setIsSubmitting(true);
		setMessage("");

		try {
			const result = await submitPrediction({
				matchId: match.id,
				homeScore: parseInt(homeScore),
				awayScore: parseInt(awayScore),
			});

			if (result.success) {
				setMessage("✅ Prediction saved!");
				setTimeout(() => setMessage(""), 3000);
			} else {
				setMessage(`❌ ${result.error}`);
			}
		} catch (error) {
			setMessage("❌ Failed to save prediction");
		} finally {
			setIsSubmitting(false);
		}
	};

	const hasPrediction = match.userPrediction !== null;

	return (
		<>
			<div
				className={`bg-gray-800 rounded-lg p-4 sm:p-6 hover:shadow-md transition ${
					hasPrediction
						? "border-2 border-green-500/50 shadow-lg shadow-green-500/20"
						: "border border-gray-700"
				}`}
			>
				{/* Match Header */}
				<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-2">
					<div className="flex items-center gap-2">
						{isGroupStage && match.group && (
							<>
								<span className="text-sm font-medium text-gray-500">
									Group {match.group}
								</span>
								<button
									onClick={() => setShowLeaderboard(true)}
									className="text-blue-600 hover:text-blue-700 transition"
									title="View group leaderboard"
								>
									<svg
										xmlns="http://www.w3.org/2000/svg"
										className="h-5 w-5"
										viewBox="0 0 20 20"
										fill="currentColor"
									>
										<path
											fillRule="evenodd"
											d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
											clipRule="evenodd"
										/>
									</svg>
								</button>
							</>
						)}
					</div>
					<div className="text-xs sm:text-sm text-gray-500">
						{matchDate.toLocaleDateString("ro-RO", {
							day: "numeric",
							month: "short",
							hour: "2-digit",
							minute: "2-digit",
						})}
					</div>
				</div>

				{/* Teams */}
				<div className="flex flex-col sm:flex-row items-center justify-between mb-6 gap-4">
					{/* Home Team */}
					<div className="flex items-center gap-2 sm:gap-3 flex-1 w-full sm:w-auto">
						<img
							src={getFlagUrl(match.homeTeam.code)}
							alt={match.homeTeam.code}
							className="w-8 h-6 sm:w-10 sm:h-7 object-cover rounded-sm shadow-sm"
						/>
						<div className="flex-1 sm:flex-none">
							<div className="font-semibold text-sm sm:text-base text-gray-100">
								{match.homeTeam.name}
							</div>
							<div className="text-xs text-gray-500">{match.homeTeam.code}</div>
						</div>
					</div>

					{/* Score Display or Input */}
					<div className="flex items-center gap-2 sm:gap-4 px-2 sm:px-6 w-full sm:w-auto justify-center">
						{match.isFinished ? (
							<div className="text-3xl font-bold text-gray-100">
								{match.homeScore} - {match.awayScore}
							</div>
						) : canPredict ? (
							<form
								onSubmit={handleSubmit}
								className="flex items-center gap-2"
							>
								<input
									type="number"
									min="0"
									max="20"
									value={homeScore}
									onChange={(e) => setHomeScore(e.target.value)}
									className="w-12 sm:w-16 h-10 sm:h-12 text-center text-lg sm:text-xl font-bold border-2 border-gray-600 rounded-lg focus:border-blue-500 focus:outline-none"
									placeholder="0"
									disabled={isSubmitting}
								/>
								<span className="text-xl sm:text-2xl font-bold text-gray-400">
									-
								</span>
								<input
									type="number"
									min="0"
									max="20"
									value={awayScore}
									onChange={(e) => setAwayScore(e.target.value)}
									className="w-12 sm:w-16 h-10 sm:h-12 text-center text-lg sm:text-xl font-bold border-2 border-gray-600 rounded-lg focus:border-blue-500 focus:outline-none"
									placeholder="0"
									disabled={isSubmitting}
								/>
								<button
									type="submit"
									disabled={isSubmitting || !homeScore || !awayScore}
									className="ml-1 sm:ml-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-sm sm:text-base font-medium transition"
								>
									{isSubmitting ? "..." : "Save"}
								</button>
							</form>
						) : (
							<div className="text-xl font-semibold text-gray-400">
								{match.userPrediction
									? `${match.userPrediction.homeScore} - ${match.userPrediction.awayScore}`
									: "- : -"}
							</div>
						)}
					</div>

					{/* Away Team */}
					<div className="flex items-center gap-2 sm:gap-3 flex-1 justify-end w-full sm:w-auto">
						<div className="text-right flex-1 sm:flex-none">
							<div className="font-semibold text-sm sm:text-base text-gray-100">
								{match.awayTeam.name}
							</div>
							<div className="text-xs text-gray-500">{match.awayTeam.code}</div>
						</div>
						<img
							src={getFlagUrl(match.awayTeam.code)}
							alt={match.awayTeam.code}
							className="w-8 h-6 sm:w-10 sm:h-7 object-cover rounded-sm shadow-sm"
						/>
					</div>
				</div>

				{/* Status & Points */}
				<div className="flex justify-between items-center pt-4 border-t border-gray-700">
					<div>
						{!canPredict && !match.isFinished && (
							<span className="text-sm text-orange-400 font-medium">
								🔒 Predictions closed
							</span>
						)}
						{match.isFinished && (
							<span className="text-sm text-green-400 font-medium">
								✅ Match finished
							</span>
						)}
						{canPredict && (
							<span className="text-sm text-blue-400 font-medium">
								⏰ Predictions open
							</span>
						)}
					</div>
					<div>
						{match.userPrediction?.points !== null &&
							match.userPrediction?.points !== undefined && (
								<span className="text-sm font-bold text-green-600">
									+{match.userPrediction.points} points
								</span>
							)}
					</div>
				</div>

				{/* Message */}
				{message && (
					<div className="mt-3 text-sm text-center font-medium">{message}</div>
				)}
			</div>

			{/* Group Leaderboard Modal */}
			{isGroupStage && match.group && (
				<GroupLeaderboard
					group={match.group}
					isOpen={showLeaderboard}
					onClose={() => setShowLeaderboard(false)}
				/>
			)}
		</>
	);
}
