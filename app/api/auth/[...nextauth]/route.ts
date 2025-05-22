import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

// Define admin users for the application
// In production, these would be stored in a database
const users = [
  {
    id: "1",
    name: "Admin User",
    email: "admin@example.com",
    password: "adminpassword", // In production, use hashed passwords
    role: "admin",
  },
  {
    id: "2",
    name: "Read Only User",
    email: "readonly@example.com",
    password: "readonlypassword",
    role: "readonly",
  },
];

// Configuration for NextAuth
const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        // Check if the credentials are valid
        if (!credentials?.email || !credentials.password) {
          return null;
        }

        // Find the user in our mock database
        const user = users.find(
          (user) => user.email === credentials.email && 
                    user.password === credentials.password
        );

        if (!user) {
          return null;
        }

        // Return the user object without the password
        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    // Include user role in session
    async session({ session, token }) {
      if (session.user && token.role) {
        session.user.role = token.role;
      }
      return session;
    },
    // Include user role in JWT token
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
      }
      return token;
    },
  },
  pages: {
    signIn: "/auth/signin",
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET || "YOUR_SECRET_HERE", // Use environment variable in production
});

export { handler as GET, handler as POST }; 