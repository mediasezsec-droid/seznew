import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/db";
import { compare } from "bcryptjs";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        // Debug Log
        console.log(
          "LOGIN_DEBUG: Attempting login for:",
          credentials?.username,
        );

        if (!credentials?.username || !credentials?.password) {
          console.log("LOGIN_DEBUG: Missing credentials");
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { username: credentials.username },
        });

        if (!user) {
          console.log("LOGIN_DEBUG: User not found in DB");
          return null;
        }

        let isValidPassword = false;

        // Check if password is hashed (bcrypt hashes start with $2)
        const isHashed = user.password.startsWith("$2");
        console.log(`LOGIN_DEBUG: Stored password is hashed? ${isHashed}`);

        if (isHashed) {
          isValidPassword = await compare(credentials.password, user.password);
          console.log(
            "LOGIN_DEBUG: Bcrypt comparison result:",
            isValidPassword,
          );
        } else {
          // Legacy plain text comparison (for migration period)
          isValidPassword = user.password === credentials.password;
          console.log(
            "LOGIN_DEBUG: Plaintext comparison result:",
            isValidPassword,
          );
        }

        if (!isValidPassword) {
          console.log("LOGIN_DEBUG: Password invalid");
          return null;
        }

        console.log("LOGIN_DEBUG: Login successful for:", user.username);

        return {
          id: user.id,
          username: user.username,
          name: user.name,
          email: user.email,
          role: user.role,
          mobile: user.mobile,
          profileStatus: user.profileStatus,
        };
      },
    }),
  ],
  callbacks: {
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id;
        (session.user as any).username = token.username;
        (session.user as any).role = token.role;
        (session.user as any).mobile = token.mobile;
        (session.user as any).profileStatus = token.profileStatus;
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.username = (user as any).username;
        token.role = (user as any).role;
        token.mobile = (user as any).mobile;
        token.profileStatus = (user as any).profileStatus;
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
  secret: process.env.NEXTAUTH_SECRET,
};
