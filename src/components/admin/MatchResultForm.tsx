"use client";

import { useState } from "react";
import { submitMatchResult } from "@/app/actions/admin";

type Match = {
	id: string;
	homeScore: number | null;
	awayScore: number | null;
	isFinished: boolean;
	predictions: Array<{
		id: string;
		homeScore: number;
		awayScore: number;
		points: number | null;
		user: {
			name: string | null;
			email: string | null;
		};
	}>;
};

export function MatchResultForm({ match }: { match: Match }) {
	const [homeScore, setHomeScore] = useState(
		match.homeScore?.toString() || "",
	);
	const [awayScore, setAwayScore] = useState(
		match.awayScore?.toString() || "",
	);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [message, setMessage] = useState("");

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!homeScore || !awayScore) {
			setMessage("❌ Please enter both scores");
			return;
		}

		setIsSubmitting(true);
		setMessage("");

		try {
			const result = await submitMatchResult({
				matchId: match.id,
				homeScore: parseInt(homeScore),
				awayScore: parseInt(awayScore),
			});

			if (result.success) {
				setMessage(
					`✅ Result saved! ${result.predictionsScored} predictions scored.`,
				);
				setTimeout(() => {
					window.location.href = "/admin";
				}, 2000);
			} else {
				setMessage(`❌ ${result.error}`);
			}
		} catch (error) {
			setMessage("❌ Failed to save result");
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<form onSubmit={handleSubmit}>
			<div className="mb-6">
				<label className="block text-sm font-medium text-gray-700 mb-4">
					Final Score
				</label>
				<div className="flex items-center justify-center gap-6">
					<div>
						<label className="block text-xs text-gray-500 mb-2 text-center">
							Home Score
						</label>
						<input
							type="number"
							min="0"
							max="20"
							value={homeScore}
							onChange={(e) => setHomeScore(e.target.value)}
							className="w-24 h-16 text-center text-3xl font-bold border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
							placeholder="0"
							disabled={isSubmitting}
							required
						/>
					</div>

					<span className="text-4xl font-bold text-gray-400 mt-6">-</span>

					<div>
						<label className="block text-xs text-gray-500 mb-2 text-center">
							Away Score
						</label>
						<input
							type="number"
							min="0"
							max="20"
							value={awayScore}
							onChange={(e) => setAwayScore(e.target.value)}
							className="w-24 h-16 text-center text-3xl font-bold border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
							placeholder="0"
							disabled={isSubmitting}
							required
						/>
					</div>
				</div>
			</div>

			{/* Scoring Rules */}
			<div className="bg-gray-50 rounded-lg p-4 mb-6">
				<h3 className="font-semibold text-gray-900 mb-2">Scoring Rules:</h3>
				<ul className="text-sm text-gray-600 space-y-1">
					<li>• <strong>3 points</strong> - Exact score prediction</li>
					<li>• <strong>1 point</strong> - Correct outcome (win/draw/loss)</li>
					<li>• <strong>0 points</strong> - Incorrect prediction</li>
				</ul>
			</div>

			{message && (
				<div className="mb-6 p-4 rounded-lg bg-blue-50 border border-blue-200">
					<p className="text-sm font-medium text-center">{message}</p>
				</div>
			)}

			<div className="flex gap-4">
				<button
					type="submit"
					disabled={isSubmitting || !homeScore || !awayScore}
					className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white px-6 py-3 rounded-lg font-medium transition"
				>
					{isSubmitting
						? "Saving..."
						: match.isFinished
							? "Update Result"
							: "Submit Result"}
				</button>

				<a
					href="/admin"
					className="px-6 py-3 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition"
				>
					Cancel
				</a>
			</div>

			{/* Predictions Preview */}
			{match.predictions.length > 0 && (
				<div className="mt-8 border-t pt-6">
					<h3 className="font-semibold text-gray-900 mb-4">
						Predictions ({match.predictions.length})
					</h3>
					<div className="max-h-64 overflow-y-auto">
						<table className="w-full text-sm">
							<thead className="bg-gray-50 sticky top-0">
								<tr>
									<th className="px-4 py-2 text-left">User</th>
									<th className="px-4 py-2 text-center">Prediction</th>
									<th className="px-4 py-2 text-center">Current Points</th>
								</tr>
							</thead>
							<tbody className="divide-y divide-gray-200">
								{match.predictions.map((prediction) => (
									<tr key={prediction.id}>
										<td className="px-4 py-2">
											{prediction.user.name || prediction.user.email}
										</td>
										<td className="px-4 py-2 text-center font-medium">
											{prediction.homeScore} - {prediction.awayScore}
										</td>
										<td className="px-4 py-2 text-center">
											{prediction.points !== null ? prediction.points : "-"}
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				</div>
			)}
		</form>
	);
}
