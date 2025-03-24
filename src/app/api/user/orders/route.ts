// src/app/api/user/orders/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import prisma from '@/lib/database';

// Define a custom session type that includes id
interface CustomSession {
  user?: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
    id?: string;
  };
}

export async function GET(request: NextRequest) {
  try {
    console.log('Fetching user orders...');
    
    // Get the authenticated user session
    const session = await getServerSession(authOptions) as CustomSession;
    
    if (!session || !session.user || !session.user.id) {
      console.log('User not authenticated');
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }
    
    const userId = session.user.id;
    console.log('User ID from session:', userId);
    
    try {
      // Use the Prisma client with correct model name (order, lowercase)
      console.log('Attempting to fetch orders using Prisma client...');
      const orders = await prisma.order.findMany({
        where: {
          userId: userId
        },
        orderBy: {
          createdAt: 'desc'
        }
      });
      
      console.log(`Found ${orders.length} orders`);
      return NextResponse.json(orders, { status: 200 });
    } catch (prismaError) {
      console.error('Error fetching orders with Prisma client:', prismaError);
      
      // Try with raw query as fallback
      try {
        console.log('Falling back to raw query with lowercase table name...');
        const orders = await prisma.$queryRaw`
          SELECT * FROM \`order\` WHERE userId = ${userId} ORDER BY createdAt DESC
        `;
        
        if (!Array.isArray(orders)) {
          console.log('Query did not return an array');
          return NextResponse.json([], { status: 200 });
        }
        
        console.log(`Found ${orders.length} orders via raw query`);
        return NextResponse.json(orders, { status: 200 });
      } catch (rawError) {
        console.error('Raw query also failed:', rawError);
        
        // Return empty array as fallback
        console.log('Returning empty array as fallback');
        return NextResponse.json([], { status: 200 });
      }
    }
  } catch (error) {
    console.error('Error fetching user orders:', error);
    return NextResponse.json(
      { error: 'Failed to fetch orders', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}