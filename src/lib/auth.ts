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
			if (!account) {
				console.error("signIn: No account provided");
				return false;
			}

			try {
				console.log("signIn: Checking for existing account", {
					provider: account.provider,
					providerAccountId: account.providerAccountId,
				});

				// Check if account already exists (find by Twitch ID)
				const existingAccount = await prisma.account.findUnique({
					where: {
						provider_providerAccountId: {
							provider: account.provider,
							providerAccountId: account.providerAccountId,
						},
					},
					include: {
						user: true,
					},
				});

				if (existingAccount) {
					console.log("signIn: Existing account found, allowing login");
					return true;
				}

				console.log("signIn: Creating new user and account");

				// Account doesn't exist, create new user and link account
				const dbUser = await prisma.user.create({
					data: {
						email: user.email || null,
						name: user.name,
						image: user.image,
						accounts: {
							create: {
								type: account.type,
								provider: account.provider,
								providerAccountId: account.providerAccountId,
								refresh_token: account.refresh_token,
								access_token: account.access_token,
								expires_at: account.expires_at,
								token_type: account.token_type,
								scope: account.scope,
								id_token: account.id_token,
								session_state: account.session_state
									? String(account.session_state)
									: null,
							},
						},
					},
				});

				console.log("signIn: New user created successfully");
				return true;
			} catch (error) {
				console.error("Error in signIn callback:", error);
				console.error("Error details:", JSON.stringify(error, null, 2));
				return false;
			}
		},
		async jwt({ token, account, profile }) {
			if (account) {
				// When user first signs in, find their user ID via the account
				const dbAccount = await prisma.account.findUnique({
					where: {
						provider_providerAccountId: {
							provider: account.provider,
							providerAccountId: account.providerAccountId,
						},
					},
					select: {
						userId: true,
					},
				});

				if (dbAccount) {
					token.userId = dbAccount.userId;
				}
			}
			return token;
		},
		async session({ session, token }) {
			if (token.userId) {
				session.user.id = token.userId as string;
			}
			return session;
		},
	},
	pages: {
		signIn: "/login",
	},
	session: {
		strategy: "jwt",
	},
});
