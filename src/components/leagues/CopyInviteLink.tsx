"use client";

import { useState } from "react";

export function CopyInviteLink({
	inviteCode,
	size = "md",
}: {
	inviteCode: string;
	size?: "sm" | "md";
}) {
	const [copied, setCopied] = useState(false);

	const handleCopy = async () => {
		const url = `${window.location.origin}/leagues/join/${inviteCode}`;
		try {
			await navigator.clipboard.writeText(url);
			setCopied(true);
			setTimeout(() => setCopied(false), 2000);
		} catch (error) {
			console.error("Failed to copy:", error);
		}
	};

	const sizeClasses = size === "sm" ? "px-3 py-1 text-sm" : "px-4 py-2";

	return (
		<button
			onClick={handleCopy}
			className={`bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition flex items-center gap-2 ${sizeClasses}`}
		>
			{copied ? (
				<>
					<span>✓</span>
					<span>Copied!</span>
				</>
			) : (
				<>
					<span>🔗</span>
					<span>Copy Link</span>
				</>
			)}
		</button>
	);
}
