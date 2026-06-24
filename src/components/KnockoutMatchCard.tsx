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
			className={`bg-gray-800 rounded-lg p-4 hover:shadow-md transition ${
				hasPrediction
					? "border-2 border-green-500/50 shadow-lg shadow-green-500/20"
					: "border border-gray-700"
			}`}
		>
			<div className="flex justify-between items-center mb-3">
				<span className="text-xs font-medium text-blue-400 uppercase tracking-wider">
					{stageLabel} · #{match.matchNumber}
				</span>
				<span className="text-xs text-gray-500">
					{matchDate.toLocaleDateString("ro-RO", {
						day: "numeric",
						month: "short",
						hour: "2-digit",
						minute: "2-digit",
					})}
				</span>
			</div>

			<div className="flex items-center justify-between gap-3">
				{/* Home */}
				<div className="flex items-center gap-2 flex-1 min-w-0">
					{match.homeTeam ? (
						<img
							src={getFlagUrl(match.homeTeam.code)}
							alt={match.homeTeam.code}
							className="w-8 h-6 object-cover rounded-sm shadow-sm flex-shrink-0"
						/>
					) : (
						<div className="w-8 h-6 bg-gray-700 rounded-sm flex items-center justify-center flex-shrink-0">
							<span className="text-gray-500 text-xs">?</span>
						</div>
					)}
					<span
						className={`font-semibold text-sm truncate ${match.homeTeam ? "text-gray-100" : "text-gray-400"}`}
					>
						{homeDisplay}
					</span>
				</div>

				{/* Score / Prediction */}
				<div className="flex items-center gap-2 px-2 flex-shrink-0">
					{match.isFinished ? (
						<span className="text-xl font-bold text-gray-100">
							{match.homeScore} – {match.awayScore}
						</span>
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
								className="w-12 h-10 text-center text-lg font-bold border-2 border-gray-600 rounded-lg focus:border-blue-500 focus:outline-none"
								placeholder="0"
								disabled={isSubmitting}
							/>
							<span className="text-gray-400 font-bold">-</span>
							<input
								type="number"
								min="0"
								max="20"
								value={awayScore}
								onChange={(e) => setAwayScore(e.target.value)}
								className="w-12 h-10 text-center text-lg font-bold border-2 border-gray-600 rounded-lg focus:border-blue-500 focus:outline-none"
								placeholder="0"
								disabled={isSubmitting}
							/>
							<button
								type="submit"
								disabled={
									isSubmitting || homeScore === "" || awayScore === ""
								}
								className="ml-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white px-3 py-1.5 rounded-lg text-sm font-medium transition cursor-pointer"
							>
								{isSubmitting ? "..." : "Salvează"}
							</button>
						</form>
					) : !bothTeamsKnown ? (
						<span className="text-gray-500 text-sm font-medium px-4">vs</span>
					) : match.userPrediction ? (
						<span className="text-lg font-semibold text-gray-400">
							{match.userPrediction.homeScore} – {match.userPrediction.awayScore}
						</span>
					) : (
						<span className="text-gray-500 text-sm">🔒</span>
					)}
				</div>

				{/* Away */}
				<div className="flex items-center gap-2 flex-1 justify-end min-w-0">
					<span
						className={`font-semibold text-sm text-right truncate ${match.awayTeam ? "text-gray-100" : "text-gray-400"}`}
					>
						{awayDisplay}
					</span>
					{match.awayTeam ? (
						<img
							src={getFlagUrl(match.awayTeam.code)}
							alt={match.awayTeam.code}
							className="w-8 h-6 object-cover rounded-sm shadow-sm flex-shrink-0"
						/>
					) : (
						<div className="w-8 h-6 bg-gray-700 rounded-sm flex items-center justify-center flex-shrink-0">
							<span className="text-gray-500 text-xs">?</span>
						</div>
					)}
				</div>
			</div>

			{/* Status & points */}
			<div className="flex justify-between items-center mt-3 pt-3 border-t border-gray-700 text-xs">
				<div>
					{!bothTeamsKnown && (
						<span className="text-gray-500">⏳ Echipe necunoscute</span>
					)}
					{bothTeamsKnown && canPredict && (
						<span className="text-blue-400 font-medium">
							⏰ Predicții deschise
						</span>
					)}
					{bothTeamsKnown && !canPredict && !match.isFinished && (
						<span className="text-orange-400 font-medium">
							🔒 Predicțiile s-au închis
						</span>
					)}
					{match.isFinished && (
						<span className="text-green-400 font-medium">✅ Meci terminat</span>
					)}
				</div>
				{match.userPrediction?.points != null && (
					<span className="font-bold text-green-600">
						+{match.userPrediction.points} puncte
					</span>
				)}
			</div>

			{message && (
				<div className="mt-2 text-xs text-center font-medium">{message}</div>
			)}
		</div>
	);
}
