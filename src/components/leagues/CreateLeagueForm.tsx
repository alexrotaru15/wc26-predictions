"use client";

import { useState } from "react";
import { createLeague } from "@/app/actions/leagues";

export function CreateLeagueForm({ userId }: { userId: string }) {
	const [name, setName] = useState("");
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [message, setMessage] = useState("");

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!name.trim()) {
			setMessage("❌ Te rugăm să introduci un nume pentru ligă");
			return;
		}

		setIsSubmitting(true);
		setMessage("");

		try {
			const result = await createLeague({
				name: name.trim(),
				creatorId: userId,
			});

			if (result.success) {
				setMessage(`✅ Ligă creată! Cod invitație: ${result.inviteCode}`);
				setName("");
				setTimeout(() => {
					window.location.href = "/leagues";
				}, 2000);
			} else {
				setMessage(`❌ ${result.error}`);
			}
		} catch (error) {
			setMessage("❌ Nu s-a putut crea liga");
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
					Nume Ligă *
				</label>
				<input
					type="text"
					value={name}
					onChange={(e) => setName(e.target.value)}
					placeholder="ex., Liga Prietenilor"
					className="w-full px-3 py-2 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
					disabled={isSubmitting}
					maxLength={50}
					required
				/>
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
				disabled={isSubmitting || !name.trim()}
				className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white px-4 py-2 rounded-lg font-medium transition"
			>
				{isSubmitting ? "Se creează..." : "Creează Ligă"}
			</button>
		</form>
	);
}
