"use client";

import { useState } from "react";

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
				className="w-full bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition flex items-center justify-between"
			>
				<div className="flex items-center gap-3">
					<span className="text-xl">
						{isExpanded ? "▼" : "▶"}
					</span>
					<div className="text-left">
						<h2 className="text-xl font-bold text-gray-900">
							Past Results
						</h2>
						<p className="text-sm text-gray-600">
							{matches.length} finished {matches.length === 1 ? "match" : "matches"}
						</p>
					</div>
				</div>
				<div className="text-sm text-gray-500">
					{isExpanded ? "Click to collapse" : "Click to expand"}
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
								className="bg-white border border-gray-200 rounded-lg p-6"
							>
								{/* Match Header */}
								<div className="flex justify-between items-center mb-4">
									<div className="flex items-center gap-2">
										{isGroupStage && match.group && (
											<span className="text-sm font-medium text-gray-500">
												Group {match.group}
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
								<div className="flex items-center justify-between mb-4">
									{/* Home Team */}
									<div className="flex items-center gap-3 flex-1">
										<span className="text-3xl">{match.homeTeam.flagUrl}</span>
										<div>
											<div className="font-semibold text-gray-900">
												{match.homeTeam.name}
											</div>
											<div className="text-sm text-gray-500">
												{match.homeTeam.code}
											</div>
										</div>
									</div>

									{/* Final Score */}
									<div className="text-center px-8">
										<div className="text-3xl font-bold text-gray-900">
											{match.homeScore} - {match.awayScore}
										</div>
										<div className="text-xs text-gray-500 mt-1">FT</div>
									</div>

									{/* Away Team */}
									<div className="flex items-center gap-3 flex-1 justify-end">
										<div className="text-right">
											<div className="font-semibold text-gray-900">
												{match.awayTeam.name}
											</div>
											<div className="text-sm text-gray-500">
												{match.awayTeam.code}
											</div>
										</div>
										<span className="text-3xl">{match.awayTeam.flagUrl}</span>
									</div>
								</div>

								{/* User Prediction */}
								{userPredicted ? (
									<div
										className={`p-4 rounded-lg ${
											isCorrectScore
												? "bg-green-50 border border-green-200"
												: isCorrectOutcome
													? "bg-blue-50 border border-blue-200"
													: "bg-gray-50 border border-gray-200"
										}`}
									>
										<div className="flex items-center justify-between">
											<div className="flex items-center gap-4">
												<div className="text-sm text-gray-600">
													Your prediction:
												</div>
												<div className="text-lg font-bold">
													{match.userPrediction!.homeScore} -{" "}
													{match.userPrediction!.awayScore}
												</div>
											</div>
											<div className="flex items-center gap-2">
												{isCorrectScore && (
													<>
														<span className="text-2xl">🎯</span>
														<span className="text-green-700 font-bold">
															+3 points (Exact!)
														</span>
													</>
												)}
												{isCorrectOutcome && (
													<>
														<span className="text-2xl">✓</span>
														<span className="text-blue-700 font-bold">
															+1 point (Correct outcome)
														</span>
													</>
												)}
												{!isCorrectScore && !isCorrectOutcome && (
													<>
														<span className="text-2xl">❌</span>
														<span className="text-gray-600 font-medium">
															0 points
														</span>
													</>
												)}
											</div>
										</div>
									</div>
								) : (
									<div className="p-4 rounded-lg bg-yellow-50 border border-yellow-200">
										<div className="text-sm text-yellow-800 text-center">
											⚠️ You didn't make a prediction for this match
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
