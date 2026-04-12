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
				<div className="fixed bottom-4 left-4 text-gray-600 text-xs font-mono opacity-50 hover:opacity-100 transition-opacity">
					YNWA
				</div>
			</body>
		</html>
	);
}
