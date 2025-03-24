// src/app/api/forms/user-latest/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    let userId = session?.user?.id;
    
    if (!userId) {
      // If not authenticated, check if there's a userId param in the query string
      const { searchParams } = new URL(req.url);
      userId = searchParams.get('userId') || undefined;

      
      if (!userId) {
        return NextResponse.json(
          { success: false, message: 'User ID is required' },
          { status: 400 }
        );
      }
    }
    
    // Get the user's latest order
    const result = await prisma.user_form_progress.findFirst({
      where: {
        userId: userId,
        isCompleted: false
      },
      orderBy: { createdAt: 'desc' }
    });
    
    if (!result) {
      return NextResponse.json({
        success: false,
        message: 'No in-progress orders found'
      });
    }
    
    return NextResponse.json({
      success: true,
      orderId: result.orderId
    });
  } catch (error) {
    console.error('Error fetching user\'s latest order:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch user\'s latest order' },
      { status: 500 }
    );
  }
}