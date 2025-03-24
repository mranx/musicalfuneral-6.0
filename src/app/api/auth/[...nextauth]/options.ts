import CredentialsProvider from 'next-auth/providers/credentials';
import { comparePassword } from '@/lib/password';
import prisma from '@/lib/database';
import { JWT } from 'next-auth/jwt';
import { Session } from 'next-auth';
import { NextAuthOptions } from 'next-auth';
import { verifyAutoLoginToken } from '@/lib/auth';
import { User } from 'next-auth';

// Define proper types for the callback parameters
interface JWTCallbackParams {
  token: JWT;
  user: any;
}

// Extend the User type from next-auth
interface CustomUser extends User {
  id: string;
}

// Custom session type that works with NextAuth's Session type
interface CustomSession extends Omit<Session, 'user'> {
  user?: CustomUser;
}

interface SessionCallbackParams {
  session: CustomSession;
  token: JWT & { id?: string };
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
        loginToken: { label: 'Login Token', type: 'text' } // Add this for auto-login
      },
      async authorize(credentials) {
        // First check if we're doing an auto-login with token
        if (credentials?.loginToken) {
          try {
            // Verify the token
            const tokenData = verifyAutoLoginToken(credentials.loginToken);
            
            if (tokenData && tokenData.email === credentials.email) {
              // Token is valid, fetch the user
              const user = await prisma.user.findUnique({
                where: { email: credentials.email },
              });
              
              if (user) {
                return {
                  id: user.id,
                  email: user.email,
                  name: user.name
                };
              }
            }
          } catch (error) {
            console.error('Auto-login token verification failed:', error);
            // Proceed to regular login if token login fails
          }
        }
        
        // Regular email/password login
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Please enter email and password');
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user) {
          throw new Error('No user found with this email');
        }

        const isPasswordValid = await comparePassword(credentials.password, user.password);

        if (!isPasswordValid) {
          throw new Error('Incorrect password');
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name
        };
      },
    }),
  ],
  session: { 
    strategy: 'jwt' as const,
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    async jwt({ token, user }: JWTCallbackParams) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }: SessionCallbackParams) {
      if (session.user) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
  events: {
    signOut: async () => {
      // You can add any cleanup or logging here
      console.log("User signed out successfully");
    }
  },
  pages: {
    signIn: '/login',
    signOut: '/',  // Add explicit sign-out page redirect
    error: '/login',
  },
  secret: process.env.NEXTAUTH_SECRET,
  // debug: process.env.NODE_ENV === 'development', 
}