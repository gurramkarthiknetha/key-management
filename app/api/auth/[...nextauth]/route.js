import NextAuth from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import { getUserRole as getStoredUserRole, setUserRole } from '../../../../lib/userRoles'

// Define role-based access control
const ROLE_MAPPINGS = {
  // Admin emails
  'admin@vnrvjiet.in': 'admin',
  'principal@vnrvjiet.in': 'admin',
  
  // HOD emails (you can add specific HOD emails here)
  'hod.cse@vnrvjiet.in': 'hod',
  'hod.ece@vnrvjiet.in': 'hod',
  'hod.eee@vnrvjiet.in': 'hod',
  'hod.mech@vnrvjiet.in': 'hod',
  'hod.civil@vnrvjiet.in': 'hod',
  
  // Security staff emails
  'security@vnrvjiet.in': 'security',
  'security.head@vnrvjiet.in': 'security_head',
}

// Function to determine user role based on email
function getUserRole(email, req = null) {
  console.log(`🔍 getUserRole called for ${email}`);

  // First, check if user has a selected role stored
  const storedRole = getStoredUserRole(email);
  if (storedRole) {
    console.log(`✅ Using stored role for ${email}: ${storedRole}`);
    return storedRole;
  }

  console.log(`⚠️ No stored role found for ${email}, checking fallbacks...`);

  // Check for pending role from cookie (during registration)
  // This is a fallback for when the role hasn't been stored yet
  if (req && req.cookies) {
    const pendingRole = req.cookies.get('pendingUserRole')?.value;
    if (pendingRole) {
      console.log(`🎯 Using pending role for ${email}: ${pendingRole}`);
      // Store the role for future use
      setUserRole(email, pendingRole, 'registration');
      return pendingRole;
    }
  }

  // Check direct role mappings (for admin/special accounts)
  if (ROLE_MAPPINGS[email]) {
    console.log(`📋 Using mapped role for ${email}: ${ROLE_MAPPINGS[email]}`);
    return ROLE_MAPPINGS[email]
  }

  // Check email patterns for different roles (legacy fallback)
  if (email.includes('hod.') && email.endsWith('@vnrvjiet.in')) {
    console.log(`🏢 Using HOD role for ${email}`);
    return 'hod'
  }

  if (email.includes('security') && email.endsWith('@vnrvjiet.in')) {
    console.log(`🔒 Using security role for ${email}`);
    return 'security'
  }

  // Default role for vnrvjiet.in domain
  if (email.endsWith('@vnrvjiet.in')) {
    console.log(`👨‍🏫 Using default faculty role for ${email}`);
    return 'faculty'
  }

  // For other domains, deny access
  console.log(`❌ Access denied for ${email} - invalid domain`);
  return null // This will prevent sign-in
}

// Function to get department from email
function getDepartmentFromEmail(email) {
  const emailParts = email.split('@')[0]
  
  if (emailParts.includes('cse')) return 'Computer Science and Engineering'
  if (emailParts.includes('ece')) return 'Electronics and Communication Engineering'
  if (emailParts.includes('eee')) return 'Electrical and Electronics Engineering'
  if (emailParts.includes('mech')) return 'Mechanical Engineering'
  if (emailParts.includes('civil')) return 'Civil Engineering'
  if (emailParts.includes('it')) return 'Information Technology'
  
  // Default department
  return 'General'
}

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    })
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      // Check if user is allowed to sign in based on email domain
      const role = getUserRole(user.email)

      if (!role) {
        console.log(`Sign-in denied for email: ${user.email}`)
        return false // Deny sign-in
      }

      // Only handle Google OAuth for user creation
      if (account?.provider === 'google') {
        try {
          const { connectDB } = await import('../../../../lib/mongodb');
          const User = (await import('../../../../models/User')).default;

          await connectDB();

          let dbUser = await User.findOne({ email: user.email });

          if (!dbUser) {
            // Create new user in database
            console.log(`👤 Creating new user in database: ${user.email}`);

            dbUser = new User({
              email: user.email,
              name: user.name || user.email.split('@')[0],
              employeeId: user.email.split('@')[0], // Use email prefix as employee ID
              role: role || 'faculty', // Use the role from getUserRole or default to faculty
              department: getDepartmentFromEmail(user.email),
              googleId: profile?.sub || account?.providerAccountId,
              image: user.image,
              isActive: true,
              lastLogin: new Date()
            });

            await dbUser.save();
            console.log(`✅ User created successfully: ${user.email}`);
          } else {
            // Update last login and image if needed
            dbUser.lastLogin = new Date();
            if (user.image && !dbUser.image) {
              dbUser.image = user.image;
            }
            await dbUser.save();
            console.log(`🔄 Updated existing user: ${user.email}`);
          }
        } catch (error) {
          console.error('Error in signIn callback:', error);
          // Continue with sign-in even if DB operation fails
        }
      }

      return true // Allow sign-in
    },

    async jwt({ token, user, trigger }) {
      const email = user?.email || token.email;

      if (user) {
        // Initial sign-in: Add basic info to token
        token.email = user.email;
        token.department = getDepartmentFromEmail(user.email);
        token.employeeId = user.email.split('@')[0]; // Use email prefix as employee ID
      }

      // Always check for the most current role (both initial and refresh)
      if (email) {
        const currentRole = getUserRole(email);
        console.log(`🔍 JWT: Checking role for ${email}, found: ${currentRole}, current token role: ${token.role}`);

        if (currentRole) {
          const roleChanged = token.role !== currentRole;
          token.role = currentRole;

          if (user) {
            console.log(`🔑 JWT created for ${email} with role: ${token.role}`);
          } else if (roleChanged || trigger === 'update') {
            console.log(`🔄 JWT role updated for ${email}: ${token.role} (trigger: ${trigger || 'refresh'})`);
          }
        } else {
          console.log(`❌ JWT: No role found for ${email} in getUserRole function`);
        }
      }

      // Get user ID from database
      if (email && !token.dbUserId) {
        try {
          const { connectDB } = await import('../../../../lib/mongodb');
          const User = (await import('../../../../models/User')).default;

          await connectDB();
          const dbUser = await User.findOne({ email });
          if (dbUser) {
            token.dbUserId = dbUser._id.toString();
            console.log(`🆔 Set database user ID in token: ${token.dbUserId}`);
          } else {
            console.error(`❌ No user found in database for email: ${email}`);
          }
        } catch (error) {
          console.error('Error getting user ID:', error);
        }
      }

      return token;
    },
    
    async session({ session, token }) {
      // Add role, department, and ID to session
      if (token) {
        session.user.id = token.dbUserId; // This is the MongoDB user ID
        session.user.role = token.role
        session.user.department = token.department
        session.user.employeeId = token.employeeId

        // Debug logging for session creation
        console.log(`📋 Session created for ${session.user.email}:`, {
          id: session.user.id,
          role: session.user.role,
          department: session.user.department,
          hasDbUserId: !!token.dbUserId
        });
      }
      return session
    }
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  session: {
    strategy: 'jwt',
  },
  secret: process.env.NEXTAUTH_SECRET,
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }
