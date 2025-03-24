import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/database';
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json(
        { error: 'Token is required' },
        { status: 400 }
      );
    }

    // Find the token in the database
    const resetToken = await prisma.passwordReset.findUnique({
      where: { token },
    });

    if (!resetToken) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 400 }
      );
    }

    // Check if token is expired
    if (resetToken.expires < new Date()) {
      // Delete expired token
      await prisma.passwordReset.delete({
        where: { token },
      });
      
      return NextResponse.json(
        { error: 'Token has expired' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      valid: true,
      email: resetToken.email,
    });
  } catch (error) {
    console.error('Token validation error:', error);
    return NextResponse.json(
      { error: 'An error occurred during token validation' },
      { status: 500 }
    );
  }
}