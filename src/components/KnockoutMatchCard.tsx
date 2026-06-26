"use client";

import { useState } from "react";
import { submitPrediction } from "@/app/actions/predictions";
import { getFlagUrl } from "@/lib/flags";

type KnockoutMatch = {
	id: string;
	matchNumber: number;
	stage: string;
	scheduledAt: Date;
	homeTeamId: string | null;
	awayTeamId: string | null;
	homeTeamLabel: string | null;
	awayTeamLabel: string | null;
	homeScore: number | null;
	awayScore: number | null;
	isFinished: boolean;
	homeTeam: { name: string; code: string; flagUrl: string | null } | null;
	awayTeam: { name: string; code: string; flagUrl: string | null } | null;
	userPrediction: {
		homeScore: number;
		awayScore: number;
		points: number | null;
	} | null;
};

const STAGE_LABELS: Record<string, string> = {
	ROUND_32: "Round of 32",
	ROUND_16: "Round of 16",
	QUARTER: "Quarter-final",
	SEMI: "Semi-final",
	THIRD_PLACE: "3rd Place",
	FINAL: "Final",
};

export function KnockoutMatchCard({ match }: { match: KnockoutMatch }) {
	const bothTeamsKnown = !!match.homeTeamId && !!match.awayTeamId;
	const matchDate = new Date(match.scheduledAt);
	const deadline = new Date(matchDate.getTime() - 30 * 60 * 1000);
	const canPredict =
		bothTeamsKnown && new Date() < deadline && !match.isFinished;

	const [homeScore, setHomeScore] = useState(
		match.userPrediction?.homeScore?.toString() || "",
	);
	const [awayScore, setAwayScore] = useState(
		match.userPrediction?.awayScore?.toString() || "",
	);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [message, setMessage] = useState("");

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
				setMessage("✅ Predicție salvată!");
				setTimeout(() => setMessage(""), 3000);
			} else {
				setMessage(`❌ ${result.error}`);
			}
		} catch {
			setMessage("❌ Nu s-a putut salva predicția");
		} finally {
			setIsSubmitting(false);
		}
	};

	const homeDisplay = match.homeTeam?.name || match.homeTeamLabel || "TBD";
	const awayDisplay = match.awayTeam?.name || match.awayTeamLabel || "TBD";
	const stageLabel = STAGE_LABELS[match.stage] || match.stage;
	const hasPrediction = !!match.userPrediction;

	return (
		<div
			className={`bg-gray-800 rounded-lg p-4 sm:p-6 hover:shadow-md transition ${
				hasPrediction
					? "border-2 border-green-500/50 shadow-lg shadow-green-500/20"
					: "border border-gray-700"
			}`}
		>
			{/* Match Header */}
			<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-2">
				<span className="text-sm font-medium text-blue-400 uppercase tracking-wider">
					{stageLabel} · #{match.matchNumber}
				</span>
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
					{match.homeTeam ? (
						<img
							src={getFlagUrl(match.homeTeam.code)}
							alt={match.homeTeam.code}
							className="w-8 h-6 sm:w-10 sm:h-7 object-cover rounded-sm shadow-sm flex-shrink-0"
						/>
					) : (
						<div className="w-8 h-6 sm:w-10 sm:h-7 bg-gray-700 rounded-sm flex items-center justify-center flex-shrink-0">
							<span className="text-gray-500 text-xs">?</span>
						</div>
					)}
					<div className="flex-1 sm:flex-none min-w-0">
						<div
							className={`font-semibold text-sm sm:text-base truncate ${match.homeTeam ? "text-gray-100" : "text-gray-400"}`}
						>
							{homeDisplay}
						</div>
						{match.homeTeam && (
							<div className="text-xs text-gray-500">{match.homeTeam.code}</div>
						)}
					</div>
				</div>

				{/* Score / Prediction */}
				<div className="flex flex-col items-center gap-1 px-2 sm:px-6 w-full sm:w-auto">
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
								disabled={isSubmitting || homeScore === "" || awayScore === ""}
								className="ml-1 sm:ml-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-sm sm:text-base font-medium transition cursor-pointer"
							>
								{isSubmitting ? "..." : "Salvează"}
							</button>
						</form>
					) : !bothTeamsKnown ? (
						<span className="text-xl font-semibold text-gray-400">vs</span>
					) : (
						<div className="text-xl font-semibold text-gray-400">
							{match.userPrediction
								? `${match.userPrediction.homeScore} - ${match.userPrediction.awayScore}`
								: "- : -"}
						</div>
					)}
					{canPredict && (
						<span className="text-xs text-gray-500 mt-1">90 minute</span>
					)}
					{match.isFinished && (
						<span className="text-xs text-gray-500 mt-1">90 minute</span>
					)}
				</div>

				{/* Away Team */}
				<div className="flex items-center gap-2 sm:gap-3 flex-1 justify-end w-full sm:w-auto">
					<div className="text-right flex-1 sm:flex-none min-w-0">
						<div
							className={`font-semibold text-sm sm:text-base truncate ${match.awayTeam ? "text-gray-100" : "text-gray-400"}`}
						>
							{awayDisplay}
						</div>
						{match.awayTeam && (
							<div className="text-xs text-gray-500">{match.awayTeam.code}</div>
						)}
					</div>
					{match.awayTeam ? (
						<img
							src={getFlagUrl(match.awayTeam.code)}
							alt={match.awayTeam.code}
							className="w-8 h-6 sm:w-10 sm:h-7 object-cover rounded-sm shadow-sm flex-shrink-0"
						/>
					) : (
						<div className="w-8 h-6 sm:w-10 sm:h-7 bg-gray-700 rounded-sm flex items-center justify-center flex-shrink-0">
							<span className="text-gray-500 text-xs">?</span>
						</div>
					)}
				</div>
			</div>

			{/* Status & Points */}
			<div className="flex justify-between items-center pt-4 border-t border-gray-700">
				<div>
					{!bothTeamsKnown && (
						<span className="text-sm text-gray-500 font-medium">
							⏳ Echipe necunoscute
						</span>
					)}
					{bothTeamsKnown && !canPredict && !match.isFinished && (
						<span className="text-sm text-orange-400 font-medium">
							🔒 Predicțiile s-au închis
						</span>
					)}
					{bothTeamsKnown && canPredict && (
						<span className="text-sm text-blue-400 font-medium">
							⏰ Predicții deschise
						</span>
					)}
					{match.isFinished && (
						<span className="text-sm text-green-400 font-medium">
							✅ Meci terminat
						</span>
					)}
				</div>
				<div>
					{match.userPrediction?.points != null && (
						<span className="text-sm font-bold text-green-600">
							+{match.userPrediction.points} puncte
						</span>
					)}
				</div>
			</div>

			{message && (
				<div className="mt-3 text-sm text-center font-medium">{message}</div>
			)}
		</div>
	);
}
