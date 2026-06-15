"use client";

import { useState } from "react";
import { getFlagUrl } from "@/lib/flags";

type PastMatch = {
	id: string;
	matchNumber: number;
	scheduledAt: Date;
	homeTeam: {
		name: string;
		code: string;
		flagUrl: string;
	};
	awayTeam: {
		name: string;
		code: string;
		flagUrl: string;
	};
	homeScore: number | null;
	awayScore: number | null;
	group: string | null;
	stage: string;
	userPrediction: {
		homeScore: number;
		awayScore: number;
		points: number | null;
	} | null;
};

export function PastMatches({ matches }: { matches: PastMatch[] }) {
	const [isExpanded, setIsExpanded] = useState(false);

	if (matches.length === 0) {
		return null;
	}

	return (
		<div className="mb-8">
			<button
				onClick={() => setIsExpanded(!isExpanded)}
				className="w-full bg-gray-800 border border-gray-700 rounded-lg p-4 hover:shadow-md transition flex items-center justify-between cursor-pointer"
			>
				<div className="flex items-center gap-2">
					<span className="text-lg">{isExpanded ? "▼" : "▶"}</span>
					<div className="text-left">
						<h2 className="text-xs font-bold text-gray-100">
							Rezultate Anterioare
						</h2>
						<p className="text-xs text-gray-400">
							{matches.length} finalizate{" "}
							{matches.length === 1 ? "meci" : "meciuri"}
						</p>
					</div>
				</div>
				<div className="text-sm text-gray-500">
					{isExpanded ? "Click pentru a restrânge" : "Click pentru a extinde"}
				</div>
			</button>

			{isExpanded && (
				<div className="mt-4 space-y-4">
					{matches.map((match) => {
						const matchDate = new Date(match.scheduledAt);
						const isGroupStage = match.stage === "GROUP";
						const userPredicted = match.userPrediction !== null;
						const isCorrectScore =
							userPredicted && match.userPrediction!.points === 3;
						const isCorrectOutcome =
							userPredicted && match.userPrediction!.points === 1;

						return (
							<div
								key={match.id}
								className="bg-gray-800 border border-gray-700 rounded-lg p-4"
							>
								{/* Match Header */}
								<div className="flex justify-between items-center mb-1">
									<div className="flex items-center gap-2">
										{isGroupStage && match.group && (
											<span className="text-sm font-medium text-gray-500">
												Grupa {match.group}
											</span>
										)}
										{!isGroupStage && (
											<span className="text-sm font-medium text-gray-500">
												{match.stage.replace("_", " ")}
											</span>
										)}
									</div>
									<div className="text-sm text-gray-500">
										{matchDate.toLocaleDateString("ro-RO", {
											day: "numeric",
											month: "short",
											hour: "2-digit",
											minute: "2-digit",
										})}
									</div>
								</div>

								{/* Teams & Score */}
								<div className="flex items-center justify-between mb-1">
									{/* Home Team */}
									<div className="flex items-center gap-1.5 flex-1">
										<img
											src={getFlagUrl(match.homeTeam.code)}
											alt={match.homeTeam.code}
											className="w-6 h-4 object-cover rounded flex-shrink-0"
										/>
										<div>
											<div className="font-medium text-gray-100 text-sm">
												{match.homeTeam.name}
											</div>
											<div className="text-sm text-gray-500">
												{match.homeTeam.code}
											</div>
										</div>
									</div>

									{/* Final Score */}
									<div className="text-center px-2">
										<div className="text-lg font-bold text-gray-100">
											{match.homeScore} - {match.awayScore}
										</div>
										<div className="text-xs text-gray-500 mt-1">FT</div>
									</div>

									{/* Away Team */}
									<div className="flex items-center gap-1.5 flex-1 justify-end">
										<div className="text-right">
											<div className="font-medium text-gray-100 text-sm">
												{match.awayTeam.name}
											</div>
											<div className="text-sm text-gray-500">
												{match.awayTeam.code}
											</div>
										</div>
										<img
											src={getFlagUrl(match.awayTeam.code)}
											alt={match.awayTeam.code}
											className="w-6 h-4 object-cover rounded flex-shrink-0"
										/>
									</div>
								</div>

								{/* User Prediction */}
								{userPredicted ? (
									<div
										className={`p-1 rounded-lg ${
											isCorrectScore
												? "bg-green-900/30 border border-green-700"
												: isCorrectOutcome
													? "bg-blue-900/30 border border-blue-700"
													: "bg-gray-700/50 border border-gray-600"
										}`}
									>
										<div className="flex items-center justify-between">
											<div className="flex items-center gap-2">
												<div className="text-xs text-gray-400">Tu:</div>
												<div className="text-xs font-bold">
													{match.userPrediction!.homeScore} -{" "}
													{match.userPrediction!.awayScore}
												</div>
											</div>
											<div className="flex items-center gap-2">
												{isCorrectScore && (
													<>
														<span>🎯</span>
														<span className="text-green-400 font-bold">
															+3 puncte
														</span>
													</>
												)}
												{isCorrectOutcome && (
													<>
														<span>✓</span>
														<span className="text-blue-400 font-bold">
															+1 punct
														</span>
													</>
												)}
												{!isCorrectScore && !isCorrectOutcome && (
													<>
														<span>❌</span>
														<span className="text-gray-400 font-medium">
															0 puncte
														</span>
													</>
												)}
											</div>
										</div>
									</div>
								) : (
									<div className="p-1 rounded-lg bg-yellow-900/20 border border-yellow-700/50">
										<div className="text-sm text-yellow-400 text-center">
											⚠️ Nu ai făcut o predicție pentru acest meci
										</div>
									</div>
								)}
							</div>
						);
					})}
				</div>
			)}
		</div>
	);
}
