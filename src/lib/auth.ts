// src/lib/auth.ts
import crypto from 'crypto';
import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import prisma from './prisma';
import bcrypt from 'bcryptjs';

interface TokenPayload {
  email: string;
  userId: string;
  purpose: string;
  timestamp: number;
  expiry: number;
}

/**
 * Generate a temporary auto-login token
 * 
 * @param email User's email address
 * @param userId User's ID
 * @param expiresIn Time until token expires in minutes (default: 60 minutes = 1 hour)
 * @returns The generated token
 */
export function generateAutoLoginToken(
  email: string, 
  userId: string, 
  expiresInMinutes: number = 60
): string {
  const secret = process.env.NEXTAUTH_SECRET || '';
  
  if (!secret) {
    throw new Error('NEXTAUTH_SECRET is not defined in environment variables');
  }
  
  // Create token payload
  const payload: TokenPayload = {
    email,
    userId,
    purpose: 'auto-login',
    timestamp: Date.now(),
    expiry: Date.now() + (expiresInMinutes * 60 * 1000)
  };
  
  // Convert payload to string
  const payloadStr = JSON.stringify(payload);
  
  // Create HMAC signature
  const hmac = crypto.createHmac('sha256', secret);
  const signature = hmac.update(payloadStr).digest('base64');
  
  // Combine payload and signature
  const token = Buffer.from(payloadStr).toString('base64') + '.' + signature;
  
  return token;
}

/**
 * Verify an auto-login token
 * 
 * @param token The token to verify
 * @returns The decoded token payload or null if invalid
 */
export function verifyAutoLoginToken(token: string): TokenPayload | null {
  const secret = process.env.NEXTAUTH_SECRET || '';
  
  if (!secret) {
    throw new Error('NEXTAUTH_SECRET is not defined in environment variables');
  }
  
  try {
    // Split token into payload and signature
    const [payloadBase64, receivedSignature] = token.split('.');
    
    if (!payloadBase64 || !receivedSignature) {
      return null;
    }
    
    // Decode payload
    const payloadStr = Buffer.from(payloadBase64, 'base64').toString();
    const payload = JSON.parse(payloadStr) as TokenPayload;
    
    // Verify signature
    const hmac = crypto.createHmac('sha256', secret);
    const expectedSignature = hmac.update(payloadStr).digest('base64');
    
    if (receivedSignature !== expectedSignature) {
      return null;
    }
    
    // Check if token is expired
    if (payload.expiry < Date.now()) {
      return null;
    }
    
    return payload;
  } catch (error) {
    return null;
  }
}

// NextAuth.js options
export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email }
        });

        if (!user) {
          return null;
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!isPasswordValid) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name
        };
      }
    })
  ],
  session: {
    strategy: 'jwt'
  },
  pages: {
    signIn: '/login'
  },
  callbacks: {
    async session({ session, token }) {
      if (token && token.sub) {
        session.user.id = token.sub;
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    }
  }
};