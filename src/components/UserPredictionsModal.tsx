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
			if (p.match.homeScore !== null && p.match.awayScore !== null) return true;
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
					className={`fixed inset-0 bg-black flex items-center justify-center z-50 p-2 sm:p-4 transition-opacity duration-200 ${
						isAnimating ? "bg-opacity-50" : "bg-opacity-0"
					}`}
					onClick={handleClose}
				>
					<div
						className={`bg-gray-800 rounded-lg max-w-4xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-hidden flex flex-col transition-all duration-200 ${
							isAnimating ? "scale-100 opacity-100" : "scale-95 opacity-0"
						}`}
						onClick={(e) => e.stopPropagation()}
					>
						<div className="p-3 sm:p-6 border-b border-gray-700">
							<div className="flex justify-between items-center gap-2">
								<h2 className="text-lg sm:text-2xl font-bold text-gray-100 truncate">
									Predicțiile lui {userName}
								</h2>
								<button
									onClick={handleClose}
									className="text-gray-400 hover:text-gray-300 text-2xl flex-shrink-0 cursor-pointer"
								>
									×
								</button>
							</div>
						</div>

						<div className="overflow-y-auto p-3 sm:p-6">
							<div className="space-y-3 sm:space-y-4">
								{finishedPredictions.map((prediction) => {
									const isLive = prediction.points === null;
									const isExactScore = prediction.points === 3;
									const isCorrectOutcome = prediction.points === 1;

									return (
										<div
											key={prediction.id}
											className={`p-3 sm:p-4 rounded-lg border-2 ${
												isLive
													? "bg-gray-700/20 border-gray-500"
													: isExactScore
														? "bg-green-900/20 border-green-500"
														: isCorrectOutcome
															? "bg-yellow-900/20 border-yellow-500"
															: "bg-red-900/20 border-red-500"
											}`}
										>
											{/* Mobile: Row layout */}
											<div className="flex sm:hidden items-center justify-between gap-3">
												<div className="flex-1 space-y-2">
													<div className="flex items-center justify-between gap-2">
														<div className="flex items-center gap-2 flex-1 min-w-0">
															<img
																src={getFlagUrl(prediction.match.homeTeam.code)}
																alt={prediction.match.homeTeam.name}
																className="w-5 h-3 object-cover rounded flex-shrink-0"
															/>
															<span className="text-sm text-gray-100 font-medium truncate">
																{prediction.match.homeTeam.name}
															</span>
														</div>
														<div className="flex items-center gap-2 flex-shrink-0">
															<span className="text-base font-bold text-gray-100">
																{prediction.match.homeScore ?? "-"}
															</span>
															<span className="text-xs text-gray-400">
																{prediction.homeScore}
															</span>
														</div>
													</div>

													<div className="flex items-center justify-between gap-2">
														<div className="flex items-center gap-2 flex-1 min-w-0">
															<img
																src={getFlagUrl(prediction.match.awayTeam.code)}
																alt={prediction.match.awayTeam.name}
																className="w-5 h-3 object-cover rounded flex-shrink-0"
															/>
															<span className="text-sm text-gray-100 font-medium truncate">
																{prediction.match.awayTeam.name}
															</span>
														</div>
														<div className="flex items-center gap-2 flex-shrink-0">
															<span className="text-base font-bold text-gray-100">
																{prediction.match.awayScore ?? "-"}
															</span>
															<span className="text-xs text-gray-400">
																{prediction.awayScore}
															</span>
														</div>
													</div>
												</div>

												<div className="text-center flex-shrink-0">
													<div
														className={`text-xl font-bold ${
															isLive
																? "text-gray-400"
																: isExactScore
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

											{/* Desktop: Side-by-side layout */}
											<div className="hidden sm:flex items-center justify-between gap-4">
												<div className="flex items-center gap-4 flex-1">
													<div className="flex items-center gap-2 flex-1 justify-end">
														<span className="text-base text-gray-100 font-medium">
															{prediction.match.homeTeam.name}
														</span>
														<img
															src={getFlagUrl(prediction.match.homeTeam.code)}
															alt={prediction.match.homeTeam.name}
															className="w-6 h-4 object-cover rounded"
														/>
													</div>

													<div className="text-center">
														<div className="text-xl font-bold text-gray-100 mb-1">
															{prediction.match.homeScore ?? "-"} -{" "}
															{prediction.match.awayScore ?? "-"}
														</div>
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
														<span className="text-base text-gray-100 font-medium">
															{prediction.match.awayTeam.name}
														</span>
													</div>
												</div>

												<div className="text-center">
													<div
														className={`text-2xl font-bold ${
															isLive
																? "text-gray-400"
																: isExactScore
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

						<div className="p-3 sm:p-6 border-t border-gray-700">
							<button
								onClick={handleClose}
								className="w-full bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg font-medium transition cursor-pointer"
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
