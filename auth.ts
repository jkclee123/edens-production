import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";
import { normalizeEmail } from "@/lib/normalizeEmail";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID!,
      clientSecret: process.env.AUTH_GOOGLE_SECRET!,
    }),
  ],
  pages: {
    signIn: "/login",
    error: "/login",
  },
  callbacks: {
    async signIn({ user, account }) {
      // Only allow Google sign-in
      if (account?.provider !== "google") {
        return false;
      }

      const email = user.email;
      if (!email) {
        return "/unauthorized?error=no_email";
      }

      try {
        // Check if email is in allowlist
        const isAllowed = await convex.query(api.crewEmails.isAllowed, {
          email: normalizeEmail(email),
        });

        if (!isAllowed) {
          return "/unauthorized?error=not_allowed";
        }

        // Upsert user profile (only after allowlist check succeeds)
        await convex.mutation(api.users.upsert, {
          email,
          name: user.name || email.split("@")[0],
          imageUrl: user.image || undefined,
        });

        return true;
      } catch (error) {
        console.error("Sign-in error:", error);
        return "/unauthorized?error=server_error";
      }
    },
    async jwt({ token, user }) {
      if (user?.email) {
        token.email = user.email;
        token.normalizedEmail = normalizeEmail(user.email);
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.email) {
        session.user.email = token.email as string;
      }
      return session;
    },
  },
  session: {
    strategy: "jwt",
  },
});


