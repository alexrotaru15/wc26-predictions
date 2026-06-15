"use client";

import { useState } from "react";
import { Eye } from "lucide-react";
import { getFlagUrl } from "@/lib/flags";

type Prediction = {
	id: string;
	homeScore: number;
	awayScore: number;
	points: number | null;
	match: {
		homeTeam: { name: string; code: string };
		awayTeam: { name: string; code: string };
		homeScore: number | null;
		awayScore: number | null;
		date: string;
	};
};

type Props = {
	userId: string;
	userName: string;
	predictions: Prediction[];
};

export function UserPredictionsModal({ userId, userName, predictions }: Props) {
	const [isOpen, setIsOpen] = useState(false);
	const [isAnimating, setIsAnimating] = useState(false);

	const finishedPredictions = predictions
		.filter((p) => {
			// Include if match has finished (has scores)
			if (p.match.homeScore !== null && p.match.awayScore !== null) return true;
			// Include if match has started (is live)
			const matchDate = new Date(p.match.date);
			const now = new Date();
			return matchDate <= now;
		})
		.sort(
			(a, b) =>
				new Date(b.match.date).getTime() - new Date(a.match.date).getTime(),
		);

	const handleOpen = () => {
		setIsOpen(true);
		setTimeout(() => setIsAnimating(true), 10);
	};

	const handleClose = () => {
		setIsAnimating(false);
		setTimeout(() => setIsOpen(false), 200);
	};

	if (finishedPredictions.length === 0) {
		return null;
	}

	return (
		<>
			<button
				onClick={handleOpen}
				className="text-blue-400 hover:text-blue-300 transition p-1 rounded hover:bg-gray-700 cursor-pointer"
				title="Vezi predicții"
			>
				<Eye size={20} />
			</button>

			{isOpen && (
				<div
					className={`fixed inset-0 bg-black flex items-center justify-center z-50 p-4 transition-opacity duration-200 ${
						isAnimating ? "bg-opacity-50" : "bg-opacity-0"
					}`}
					onClick={handleClose}
				>
					<div
						className={`bg-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col transition-all duration-200 ${
							isAnimating ? "scale-100 opacity-100" : "scale-95 opacity-0"
						}`}
						onClick={(e) => e.stopPropagation()}
					>
						{/* Header */}
						<div className="p-6 border-b border-gray-700">
							<div className="flex justify-between items-center">
								<h2 className="text-2xl font-bold text-gray-100">
									Predicțiile lui {userName}
								</h2>
								<button
									onClick={handleClose}
									className="text-gray-400 hover:text-gray-300 text-2xl"
								>
									×
								</button>
							</div>
						</div>

						{/* Predictions List */}
						<div className="overflow-y-auto p-6">
							<div className="space-y-4">
								{finishedPredictions.map((prediction) => {
									const isExactScore = prediction.points === 3;
									const isLive = prediction.points === null;
									const isCorrectOutcome = prediction.points === 1;
									const isWrong = prediction.points === 0;

									return (
										<div
											key={prediction.id}
											className={`p-4 rounded-lg border-2 ${
												isLive
													? "bg-gray-700/20 border-gray-500"
													: isExactScore
														? "bg-green-900/20 border-green-500"
														: isCorrectOutcome
															? "bg-yellow-900/20 border-yellow-500"
															: "bg-red-900/20 border-red-500"
											}`}
										>
											<div className="flex items-center justify-between gap-4">
												{/* Match Info */}
												<div className="flex items-center gap-4 flex-1">
													<div className="flex items-center gap-2 flex-1 justify-end">
														<span className="text-gray-100 font-medium">
															{prediction.match.homeTeam.name}
														</span>
														<img
															src={getFlagUrl(prediction.match.homeTeam.code)}
															alt={prediction.match.homeTeam.name}
															className="w-6 h-4 object-cover rounded"
														/>
													</div>

													<div className="text-center">
														{/* Actual Score */}
														<div className="text-xl font-bold text-gray-100 mb-1">
															{prediction.match.homeScore} -{" "}
															{prediction.match.awayScore}
														</div>
														{/* Predicted Score */}
														<div className="text-sm text-gray-400">
															Predicție: {prediction.homeScore} -{" "}
															{prediction.awayScore}
														</div>
													</div>

													<div className="flex items-center gap-2 flex-1">
														<img
															src={getFlagUrl(prediction.match.awayTeam.code)}
															alt={prediction.match.awayTeam.name}
															className="w-6 h-4 object-cover rounded"
														/>
														<span className="text-gray-100 font-medium">
															{prediction.match.awayTeam.name}
														</span>
													</div>
												</div>

												{/* Points Badge */}
												<div className="text-center">
													<div
														className={`text-2xl font-bold ${
															isExactScore
																? "text-green-400"
																: isCorrectOutcome
																	? "text-yellow-400"
																	: "text-red-400"
														}`}
													>
														{isLive ? "-" : prediction.points}
													</div>
												</div>
											</div>
										</div>
									);
								})}
							</div>
						</div>

						{/* Footer */}
						<div className="p-6 border-t border-gray-700">
							<button
								onClick={handleClose}
								className="w-full bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg font-medium transition"
							>
								Închide
							</button>
						</div>
					</div>
				</div>
			)}
		</>
	);
}
