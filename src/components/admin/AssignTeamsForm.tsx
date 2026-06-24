"use client";

import { useState } from "react";
import { assignTeamsToMatch } from "@/app/actions/admin";

type Team = {
	id: string;
	name: string;
	code: string;
	flagUrl: string | null;
};

type Props = {
	matchId: string;
	matchNumber: number;
	stage: string;
	homeTeamLabel: string | null;
	awayTeamLabel: string | null;
	currentHomeTeamId: string | null;
	currentAwayTeamId: string | null;
	teams: Team[];
};

const STAGE_LABELS: Record<string, string> = {
	ROUND_32: "Round of 32",
	ROUND_16: "Round of 16",
	QUARTER: "Quarter-final",
	SEMI: "Semi-final",
	THIRD_PLACE: "3rd Place",
	FINAL: "Final",
};

export function AssignTeamsForm({
	matchId,
	matchNumber,
	stage,
	homeTeamLabel,
	awayTeamLabel,
	currentHomeTeamId,
	currentAwayTeamId,
	teams,
}: Props) {
	const [homeTeamId, setHomeTeamId] = useState(currentHomeTeamId || "");
	const [awayTeamId, setAwayTeamId] = useState(currentAwayTeamId || "");
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [message, setMessage] = useState("");

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (homeTeamId && awayTeamId && homeTeamId === awayTeamId) {
			setMessage("❌ Home and away teams must be different");
			return;
		}

		setIsSubmitting(true);
		setMessage("");

		try {
			const result = await assignTeamsToMatch({
				matchId,
				homeTeamId: homeTeamId || null,
				awayTeamId: awayTeamId || null,
			});

			if (result.success) {
				setMessage("✅ Teams assigned successfully!");
				setTimeout(() => {
					window.location.href = "/admin?tab=upcoming";
				}, 1500);
			} else {
				setMessage(`❌ ${result.error}`);
			}
		} catch {
			setMessage("❌ Failed to assign teams");
		} finally {
			setIsSubmitting(false);
		}
	};

	const sortedTeams = [...teams].sort((a, b) => a.name.localeCompare(b.name));

	return (
		<form
			onSubmit={handleSubmit}
			className="space-y-6"
		>
			<div className="bg-gray-900 rounded-lg p-4 mb-2">
				<p className="text-sm text-gray-400">
					Stage:{" "}
					<span className="text-gray-200 font-medium">
						{STAGE_LABELS[stage] || stage}
					</span>
				</p>
				<p className="text-sm text-gray-400 mt-1">
					Slot:{" "}
					<span className="text-blue-400 font-mono">
						{homeTeamLabel || "?"} vs {awayTeamLabel || "?"}
					</span>
				</p>
			</div>

			{/* Home Team */}
			<div>
				<label className="block text-sm font-medium text-gray-300 mb-1">
					Home Team{" "}
					<span className="text-gray-500 font-normal">
						(slot: {homeTeamLabel || "?"})
					</span>
				</label>
				<select
					value={homeTeamId}
					onChange={(e) => setHomeTeamId(e.target.value)}
					className="w-full px-3 py-2 bg-gray-900 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-100"
					disabled={isSubmitting}
				>
					<option value="">— Not assigned yet —</option>
					{sortedTeams.map((team) => (
						<option
							key={team.id}
							value={team.id}
						>
							{team.name} ({team.code})
						</option>
					))}
				</select>
			</div>

			{/* Away Team */}
			<div>
				<label className="block text-sm font-medium text-gray-300 mb-1">
					Away Team{" "}
					<span className="text-gray-500 font-normal">
						(slot: {awayTeamLabel || "?"})
					</span>
				</label>
				<select
					value={awayTeamId}
					onChange={(e) => setAwayTeamId(e.target.value)}
					className="w-full px-3 py-2 bg-gray-900 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-100"
					disabled={isSubmitting}
				>
					<option value="">— Not assigned yet —</option>
					{sortedTeams.map((team) => (
						<option
							key={team.id}
							value={team.id}
						>
							{team.name} ({team.code})
						</option>
					))}
				</select>
			</div>

			{message && (
				<div
					className={`p-4 rounded-lg ${
						message.startsWith("✅")
							? "bg-green-900/30 border border-green-700"
							: "bg-red-900/30 border border-red-700"
					}`}
				>
					<p className="text-sm font-medium text-center">{message}</p>
				</div>
			)}

			<div className="flex gap-4">
				<button
					type="submit"
					disabled={isSubmitting}
					className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white px-6 py-3 rounded-lg font-medium transition"
				>
					{isSubmitting ? "Saving..." : "Save Teams"}
				</button>
				<a
					href="/admin?tab=upcoming"
					className="px-6 py-3 border border-gray-600 rounded-lg font-medium text-gray-300 hover:bg-gray-900 transition text-center"
				>
					Cancel
				</a>
			</div>
		</form>
	);
}
