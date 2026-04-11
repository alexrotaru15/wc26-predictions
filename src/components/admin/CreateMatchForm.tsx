"use client";

import { useState } from "react";
import { createMatch } from "@/app/actions/admin";

type Team = {
	id: string;
	name: string;
	code: string;
	flagUrl: string;
};

export function CreateMatchForm({ teams }: { teams: Team[] }) {
	const [stage, setStage] = useState<
		"GROUP" | "ROUND_16" | "QUARTER" | "SEMI" | "FINAL"
	>("GROUP");
	const [homeTeamId, setHomeTeamId] = useState("");
	const [awayTeamId, setAwayTeamId] = useState("");
	const [date, setDate] = useState("");
	const [time, setTime] = useState("");
	const [group, setGroup] = useState("");
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [message, setMessage] = useState("");

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!homeTeamId || !awayTeamId || !date || !time) {
			setMessage("❌ Please fill in all required fields");
			return;
		}

		if (homeTeamId === awayTeamId) {
			setMessage("❌ Home and away teams must be different");
			return;
		}

		if (stage === "GROUP" && !group) {
			setMessage("❌ Please select a group for group stage matches");
			return;
		}

		setIsSubmitting(true);
		setMessage("");

		try {
			// Combine date and time into a single datetime
			const scheduledAt = new Date(`${date}T${time}`);

			const result = await createMatch({
				stage,
				homeTeamId,
				awayTeamId,
				scheduledAt,
				group: stage === "GROUP" ? group : undefined,
			});

			if (result.success) {
				setMessage("✅ Match created successfully!");
				// Reset form
				setHomeTeamId("");
				setAwayTeamId("");
				setDate("");
				setTime("");
				setGroup("");
				setTimeout(() => {
					window.location.href = "/admin";
				}, 1500);
			} else {
				setMessage(`❌ ${result.error}`);
			}
		} catch (error) {
			setMessage("❌ Failed to create match");
			console.error(error);
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<form onSubmit={handleSubmit} className="space-y-6">
			{/* Stage Selection */}
			<div>
				<label className="block text-sm font-medium text-gray-700 mb-2">
					Match Stage *
				</label>
				<select
					value={stage}
					onChange={(e) =>
						setStage(
							e.target.value as
								| "GROUP"
								| "ROUND_16"
								| "QUARTER"
								| "SEMI"
								| "FINAL",
						)
					}
					className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
					disabled={isSubmitting}
				>
					<option value="GROUP">Group Stage</option>
					<option value="ROUND_16">Round of 16</option>
					<option value="QUARTER">Quarter Final</option>
					<option value="SEMI">Semi Final</option>
					<option value="FINAL">Final</option>
				</select>
			</div>

			{/* Group Selection (only for GROUP stage) */}
			{stage === "GROUP" && (
				<div>
					<label className="block text-sm font-medium text-gray-700 mb-2">
						Group *
					</label>
					<select
						value={group}
						onChange={(e) => setGroup(e.target.value)}
						className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
						disabled={isSubmitting}
						required
					>
						<option value="">Select a group</option>
						{Array.from("ABCDEFGHIJKLMNOP").map((letter) => (
							<option key={letter} value={letter}>
								Group {letter}
							</option>
						))}
					</select>
				</div>
			)}

			{/* Home Team */}
			<div>
				<label className="block text-sm font-medium text-gray-700 mb-2">
					Home Team *
				</label>
				<select
					value={homeTeamId}
					onChange={(e) => setHomeTeamId(e.target.value)}
					className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
					disabled={isSubmitting}
					required
				>
					<option value="">Select home team</option>
					{teams.map((team) => (
						<option key={team.id} value={team.id}>
							{team.flagUrl} {team.name} ({team.code})
						</option>
					))}
				</select>
			</div>

			{/* Away Team */}
			<div>
				<label className="block text-sm font-medium text-gray-700 mb-2">
					Away Team *
				</label>
				<select
					value={awayTeamId}
					onChange={(e) => setAwayTeamId(e.target.value)}
					className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
					disabled={isSubmitting}
					required
				>
					<option value="">Select away team</option>
					{teams.map((team) => (
						<option key={team.id} value={team.id}>
							{team.flagUrl} {team.name} ({team.code})
						</option>
					))}
				</select>
			</div>

			{/* Date */}
			<div>
				<label className="block text-sm font-medium text-gray-700 mb-2">
					Match Date *
				</label>
				<input
					type="date"
					value={date}
					onChange={(e) => setDate(e.target.value)}
					className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
					disabled={isSubmitting}
					required
				/>
			</div>

			{/* Time */}
			<div>
				<label className="block text-sm font-medium text-gray-700 mb-2">
					Match Time (EEST - Romanian Time) *
				</label>
				<input
					type="time"
					value={time}
					onChange={(e) => setTime(e.target.value)}
					className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
					disabled={isSubmitting}
					required
				/>
				<p className="text-xs text-gray-500 mt-1">
					Enter time in Romanian timezone (EEST, UTC+3)
				</p>
			</div>

			{/* Message */}
			{message && (
				<div
					className={`p-4 rounded-lg ${
						message.startsWith("✅")
							? "bg-green-50 border border-green-200"
							: "bg-red-50 border border-red-200"
					}`}
				>
					<p className="text-sm font-medium text-center">{message}</p>
				</div>
			)}

			{/* Submit Button */}
			<div className="flex gap-4">
				<button
					type="submit"
					disabled={isSubmitting}
					className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white px-6 py-3 rounded-lg font-medium transition"
				>
					{isSubmitting ? "Creating..." : "Create Match"}
				</button>
				<a
					href="/admin"
					className="px-6 py-3 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition text-center"
				>
					Cancel
				</a>
			</div>
		</form>
	);
}
