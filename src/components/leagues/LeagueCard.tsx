"use client";

import Link from "next/link";
import { CopyInviteLink } from "./CopyInviteLink";

type LeagueCardProps = {
	league: {
		id: string;
		name: string;
		inviteCode: string;
		_count: {
			members: number;
		};
		createdBy: {
			name: string | null;
			email: string | null;
		};
	};
};

export function LeagueCard({ league }: LeagueCardProps) {
	return (
		<Link
			href={`/leagues/${league.id}`}
			className="block bg-gray-800 rounded-lg shadow hover:shadow-md transition p-6"
		>
			<div className="flex justify-between items-start mb-3">
				<div>
					<h3 className="text-lg font-bold text-gray-100">{league.name}</h3>
				</div>
				<span className="bg-blue-100 text-blue-800 text-xs font-medium px-3 py-1 rounded-full">
					{league._count.members} membri
				</span>
			</div>

			<div className="flex items-center justify-between text-sm">
				{/* <div className="text-gray-500">
					Creat de {league.createdBy.name || league.createdBy.email}
				</div> */}
				<div className="flex items-center gap-3">
					<span className="font-mono bg-gray-800 px-2 py-1 rounded text-xs">
						{league.inviteCode}
					</span>
					<div onClick={(e) => e.preventDefault()}>
						<CopyInviteLink
							inviteCode={league.inviteCode}
							size="sm"
						/>
					</div>
				</div>
			</div>
		</Link>
	);
}
