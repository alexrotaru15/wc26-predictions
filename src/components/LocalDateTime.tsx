"use client";

export function LocalDateTime({ date }: { date: Date | string }) {
	const dateObj = typeof date === "string" ? new Date(date) : date;

	return (
		<span>
			{dateObj.toLocaleDateString("ro-RO", {
				day: "numeric",
				month: "short",
				hour: "2-digit",
				minute: "2-digit",
			})}
		</span>
	);
}
