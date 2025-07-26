import { NextAuthOptions, getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import { comparePassword, getRoleBasedRedirect } from "@/utils/auth";
import { UserRole } from "@/types";

export const authConfig: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    }),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          await connectDB();

          const user = await User.findOne({
            email: credentials.email.toLowerCase(),
            isActive: true
          });

          if (!user || !user.password) {
            return null;
          }

          const isPasswordValid = await comparePassword(credentials.password, user.password);
          if (!isPasswordValid) {
            return null;
          }

          return {
            id: user._id.toString(),
            name: user.name,
            email: user.email,
            role: user.role,
            department: user.department,
            image: user.profileImage
          };
        } catch (error) {
          console.error("Auth error:", error);
          return null;
        }
      }
    })
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === "google") {
        try {
          await connectDB();

          // Check if user already exists
          let existingUser = await User.findOne({
            $or: [
              { email: user.email?.toLowerCase() },
              { googleId: account.providerAccountId }
            ]
          });

          if (!existingUser) {
            // Create new user with default role (Faculty)
            // In a real application, you might want to have an admin assign roles
            existingUser = new User({
              name: user.name || profile?.name || 'Unknown',
              email: user.email?.toLowerCase(),
              googleId: account.providerAccountId,
              role: UserRole.FACULTY, // Default role
              department: 'General', // Default department - should be updated by admin
              isActive: true,
              profileImage: user.image || profile?.picture
            });

            await existingUser.save();
          } else if (!existingUser.googleId) {
            // Link Google account to existing user
            existingUser.googleId = account.providerAccountId;
            if (user.image) existingUser.profileImage = user.image;
            await existingUser.save();
          }

          // Update user object with database info
          user.id = existingUser._id.toString();
          user.role = existingUser.role;
          user.department = existingUser.department;

          return true;
        } catch (error) {
          console.error("Google sign-in error:", error);
          return false;
        }
      }
      return true;
    },
    async redirect({ url, baseUrl, token }) {
      // Get user role from token for role-based redirect
      if (token?.role) {
        const roleRedirect = getRoleBasedRedirect(token.role as UserRole);
        return `${baseUrl}${roleRedirect}`;
      }

      // Allows relative callback URLs
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      // Allows callback URLs on the same origin
      else if (new URL(url).origin === baseUrl) return url;
      return `${baseUrl}/faculty`;
    },
    async jwt({ token, user, account }) {
      // Handle JWT token
      if (account) {
        token.accessToken = account.access_token;
      }

      // Add user info to token
      if (user) {
        token.role = (user as any).role;
        token.department = (user as any).department;
        token.userId = user.id;
      }

      return token;
    },
    async session({ session, token }) {
      // Send properties to the client
      if (token) {
        session.user.id = token.userId as string;
        (session.user as any).role = token.role;
        (session.user as any).department = token.department;
      }
      return session;
    },
  },
  pages: {
    signIn: "/",
  },
  session: {
    strategy: "jwt",
  },
};

export async function loginIsRequiredServer() {
  const session = await getServerSession(authConfig);
  if (!session) return redirect("/");
}
