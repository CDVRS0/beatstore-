import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import "@/lib/auth-url";

/**
 * Single NextAuth config serving two audiences via a `role` claim:
 *  - "admin"    → dashboard access (src/app/admin/**)
 *  - "customer" → account area, order history, wishlist
 *
 * Kept as one provider set (rather than two separate NextAuth instances)
 * to keep deployment simple. Admin routes are gated in middleware/layout
 * by checking session.user.role === "admin".
 */
export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt" },
  pages: {
    signIn: "/account/login",
  },
  providers: [
    CredentialsProvider({
      id: "admin",
      name: "Admin",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        const admin = await prisma.admin.findUnique({ where: { email: credentials.email } });
        if (!admin) return null;
        const valid = await bcrypt.compare(credentials.password, admin.passwordHash);
        if (!valid) return null;
        return { id: admin.id, email: admin.email, name: admin.name, role: "admin" };
      },
    }),
    CredentialsProvider({
      id: "customer",
      name: "Customer",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        const customer = await prisma.customer.findUnique({ where: { email: credentials.email } });
        if (!customer || !customer.passwordHash) return null;
        const valid = await bcrypt.compare(credentials.password, customer.passwordHash);
        if (!valid) return null;
        return { id: customer.id, email: customer.email, name: customer.name ?? "", role: "customer" };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role;
        token.id = (user as any).id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).role = token.role;
        (session.user as any).id = token.id;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};
