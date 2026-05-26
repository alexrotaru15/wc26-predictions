"use client";

import { useRouter, useSearchParams } from "next/navigation";

export function AdminTabs({
	pastCount,
	upcomingCount,
}: {
	pastCount: number;
	upcomingCount: number;
}) {
	const router = useRouter();
	const searchParams = useSearchParams();
	const tab = searchParams.get("tab") ?? "past";

	return (
		<div className="border-b border-gray-700">
			<nav className="flex -mb-px">
				<button
					onClick={() => router.push("/admin")}
					className={`px-6 py-4 font-medium border-b-2 transition ${
						tab !== "upcoming"
							? "border-blue-600 text-blue-600"
							: "border-transparent text-gray-500 hover:text-gray-300"
					}`}
				>
					Past Matches ({pastCount})
				</button>
				<button
					onClick={() => router.push("/admin?tab=upcoming")}
					className={`px-6 py-4 font-medium border-b-2 transition ${
						tab === "upcoming"
							? "border-blue-600 text-blue-600"
							: "border-transparent text-gray-500 hover:text-gray-300"
					}`}
				>
					Upcoming Matches ({upcomingCount})
				</button>
			</nav>
		</div>
	);
}
