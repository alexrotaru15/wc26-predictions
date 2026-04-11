import NextAuth from "next-auth";
import TwitchProvider from "next-auth/providers/twitch";
import { prisma } from "./prisma";

export const { handlers, auth, signIn, signOut } = NextAuth({
	providers: [
		TwitchProvider({
			clientId: process.env.TWITCH_CLIENT_ID!,
			clientSecret: process.env.TWITCH_CLIENT_SECRET!,
		}),
	],
	callbacks: {
		async signIn({ user, account, profile }) {
			if (!account) return false;

			try {
				// Check if user exists
				let dbUser = await prisma.user.findUnique({
					where: { email: user.email! },
				});

				if (!dbUser) {
					// Create new user
					dbUser = await prisma.user.create({
						data: {
							email: user.email!,
							name: user.name,
							image: user.image,
						},
					});
				}

				// Check if account is linked
				const existingAccount = await prisma.account.findUnique({
					where: {
						provider_providerAccountId: {
							provider: account.provider,
							providerAccountId: account.providerAccountId,
						},
					},
				});

				if (!existingAccount) {
					// Link account to user
					await prisma.account.create({
						data: {
							userId: dbUser.id,
							type: account.type,
							provider: account.provider,
							providerAccountId: account.providerAccountId,
							refresh_token: account.refresh_token,
							access_token: account.access_token,
							expires_at: account.expires_at,
							token_type: account.token_type,
							scope: account.scope,
							id_token: account.id_token,
							session_state: account.session_state,
						},
					});
				}

				return true;
			} catch (error) {
				console.error("Error in signIn callback:", error);
				return false;
			}
		},
		async session({ session, token }) {
			if (session.user && token.sub) {
				const dbUser = await prisma.user.findUnique({
					where: { email: session.user.email! },
				});
				if (dbUser) {
					session.user.id = dbUser.id;
				}
			}
			return session;
		},
		async jwt({ token, user, account }) {
			if (user) {
				token.id = user.id;
			}
			return token;
		},
	},
	pages: {
		signIn: "/login",
	},
	session: {
		strategy: "jwt",
	},
});
