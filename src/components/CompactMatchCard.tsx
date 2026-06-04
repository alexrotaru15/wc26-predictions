"use client";

import { useState } from "react";
import { submitPrediction } from "@/app/actions/predictions";
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

export function CompactMatchCard({ match }: { match: Match }) {
	const [homeScore, setHomeScore] = useState(
		match.userPrediction?.homeScore?.toString() || "",
	);
	const [awayScore, setAwayScore] = useState(
		match.userPrediction?.awayScore?.toString() || "",
	);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [message, setMessage] = useState("");

	const matchDate = new Date(match.scheduledAt);
	const deadline = new Date(matchDate.getTime() - 30 * 60 * 1000);
	const canPredict = new Date() < deadline && !match.isFinished;

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (homeScore === "" || awayScore === "") return;

		const parsedHome = parseInt(homeScore);
		const parsedAway = parseInt(awayScore);
		if (isNaN(parsedHome) || isNaN(parsedAway)) return;

		setIsSubmitting(true);
		setMessage("");

		try {
			const result = await submitPrediction({
				matchId: match.id,
				homeScore: parsedHome,
				awayScore: parsedAway,
			});

			if (result.success) {
				setMessage("✅");
				setTimeout(() => setMessage(""), 2000);
			} else {
				setMessage("❌");
			}
		} catch (error) {
			setMessage("❌");
		} finally {
			setIsSubmitting(false);
		}
	};

	const hasPrediction = match.userPrediction !== null;

	return (
		<div
			className={`bg-gray-800 rounded-lg p-3 hover:shadow-md transition ${
				hasPrediction ? "border border-green-500/50" : "border border-gray-700"
			}`}
		>
			{/* Match Date */}
			<div className="text-xs text-gray-500 mb-2 text-center">
				{matchDate.toLocaleDateString("ro-RO", {
					day: "numeric",
					month: "short",
					hour: "2-digit",
					minute: "2-digit",
				})}
			</div>

			{/* Teams */}
			<div className="flex items-center justify-between gap-2 mb-2">
				{/* Home Team */}
				<div className="flex items-center gap-1.5 flex-1 min-w-0">
					<img
						src={getFlagUrl(match.homeTeam.code)}
						alt={match.homeTeam.code}
						className="w-5 h-4 object-cover rounded-sm flex-shrink-0"
					/>
					<span className="text-gray-100 text-sm font-medium truncate">
						{match.homeTeam.code}
					</span>
				</div>

				{/* Score Display or Input */}
				<div className="flex items-center gap-1.5 flex-shrink-0">
					{match.isFinished ? (
						<div className="text-lg font-bold text-gray-100">
							{match.homeScore} - {match.awayScore}
						</div>
					) : canPredict ? (
						<form
							onSubmit={handleSubmit}
							className="flex items-center gap-1"
						>
							<input
								type="number"
								min="0"
								max="20"
								value={homeScore}
								onChange={(e) => setHomeScore(e.target.value)}
								className="w-10 h-8 text-center text-sm font-bold border border-gray-600 rounded focus:border-blue-500 focus:outline-none bg-gray-900"
								placeholder="0"
								disabled={isSubmitting}
							/>
							<span className="text-sm font-bold text-gray-400">-</span>
							<input
								type="number"
								min="0"
								max="20"
								value={awayScore}
								onChange={(e) => setAwayScore(e.target.value)}
								className="w-10 h-8 text-center text-sm font-bold border border-gray-600 rounded focus:border-blue-500 focus:outline-none bg-gray-900"
								placeholder="0"
								disabled={isSubmitting}
							/>
							<button
								type="submit"
								disabled={isSubmitting || homeScore === "" || awayScore === ""}
								className="ml-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white px-2 py-1 rounded text-xs font-medium transition cursor-pointer"
							>
								{isSubmitting ? "..." : "✓"}
							</button>
						</form>
					) : (
						<div className="text-sm font-semibold text-gray-400">
							{match.userPrediction
								? `${match.userPrediction.homeScore} - ${match.userPrediction.awayScore}`
								: "- : -"}
						</div>
					)}
				</div>

				{/* Away Team */}
				<div className="flex items-center gap-1.5 flex-1 justify-end min-w-0">
					<span className="text-gray-100 text-sm font-medium truncate">
						{match.awayTeam.code}
					</span>
					<img
						src={getFlagUrl(match.awayTeam.code)}
						alt={match.awayTeam.code}
						className="w-5 h-4 object-cover rounded-sm flex-shrink-0"
					/>
				</div>
			</div>

			{/* Status & Points */}
			<div className="flex justify-between items-center text-xs">
				<div>
					{!canPredict && !match.isFinished && (
						<span className="text-orange-400">🔒</span>
					)}
					{match.isFinished && <span className="text-green-400">✅</span>}
					{canPredict && <span className="text-blue-400">⏰</span>}
				</div>
				<div>
					{match.userPrediction?.points !== null &&
						match.userPrediction?.points !== undefined && (
							<span className="text-xs font-bold text-green-600">
								+{match.userPrediction.points}
							</span>
						)}
					{message && <span className="ml-1">{message}</span>}
				</div>
			</div>
		</div>
	);
}
