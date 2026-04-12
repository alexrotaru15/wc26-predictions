import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
	variable: "--font-geist-sans",
	subsets: ["latin"],
});

const geistMono = Geist_Mono({
	variable: "--font-geist-mono",
	subsets: ["latin"],
});

export const metadata = {
	title: "World Cup 2026 Predictions",
	description:
		"Predict match results and compete with friends in private leagues for the FIFA World Cup 2026",
};

export default function RootLayout({ children }) {
	return (
		<html
			lang="en"
			className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
		>
			<body className="min-h-full flex flex-col relative">
				{children}
				<div className="fixed bottom-4 left-4 text-xs font-bold tracking-widest opacity-30 hover:opacity-90 transition-all duration-300 select-none">
					<span className="bg-gradient-to-r from-red-600 via-red-500 to-red-400 bg-clip-text text-transparent drop-shadow-sm">
						YNWA
					</span>
				</div>
			</body>
		</html>
	);
}
