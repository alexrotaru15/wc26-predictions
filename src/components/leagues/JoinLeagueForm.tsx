"use client";

import { useState } from "react";
import { joinLeague } from "@/app/actions/leagues";

export function JoinLeagueForm({ userId }: { userId: string }) {
	const [inviteCode, setInviteCode] = useState("");
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [message, setMessage] = useState("");

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!inviteCode.trim()) {
			setMessage("❌ Please enter an invite code");
			return;
		}

		setIsSubmitting(true);
		setMessage("");

		try {
			const result = await joinLeague({
				inviteCode: inviteCode.trim().toUpperCase(),
				userId,
			});

			if (result.success) {
				setMessage(`✅ Joined league: ${result.leagueName}`);
				setInviteCode("");
				setTimeout(() => {
					window.location.href = "/leagues";
				}, 1500);
			} else {
				setMessage(`❌ ${result.error}`);
			}
		} catch (error) {
			setMessage("❌ Failed to join league");
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<form
			onSubmit={handleSubmit}
			className="space-y-4"
		>
			<div>
				<label className="block text-sm font-medium text-gray-300 mb-1">
					Invite Code
				</label>
				<input
					type="text"
					value={inviteCode}
					onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
					placeholder="e.g., ABC123"
					className="w-full px-3 py-2 border border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 font-mono uppercase"
					disabled={isSubmitting}
					maxLength={6}
					required
				/>
				<p className="text-xs text-gray-500 mt-1">Enter the 6-character code</p>
			</div>

			{message && (
				<div
					className={`p-3 rounded-lg ${
						message.startsWith("✅")
							? "bg-green-900/50 border border-green-500/50 text-green-100"
							: "bg-red-900/50 border border-red-500/50 text-red-100"
					}`}
				>
					<p className="text-sm font-medium text-center">{message}</p>
				</div>
			)}

			<button
				type="submit"
				disabled={isSubmitting || !inviteCode.trim()}
				className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-300 text-white px-4 py-2 rounded-lg font-medium transition"
			>
				{isSubmitting ? "Joining..." : "Join League"}
			</button>
		</form>
	);
}
