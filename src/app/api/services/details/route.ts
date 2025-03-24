import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import prisma from '@/lib/database';
import { authOptions } from '../../auth/[...nextauth]/options';
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    // Fix 1: Type assertion for authOptions
    const session = await getServerSession(authOptions as any);

    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Fix 2: Type assertion for session.user
    const email = (session as any).user?.email;

    if (!email) {
      return NextResponse.json(
        { error: 'User email not found in session' },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        createdAt: true,
        order: {
          select: {
            id: true,
            relation: true,
            directorName: true,
            directorCompany: true,
            directorEmail: true,
            deceasedName: true,
            dateOfBirth: true,
            dateOfPassing: true,
            serviceDate: true,
            specialRequests: true,
            servicePlan: true,
            servicePrice: true,
            status: true
          }
        }
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Get the most recent order or an empty object if no orders exist
    const latestOrder = user.order.length > 0 ? user.order[0] : {};

    // Combine user and order data for the response
    const serviceDetails = {
      ...user,
      ...latestOrder,
      order: undefined // Remove the nested structure
    };

    return NextResponse.json(serviceDetails);
  } catch (error) {
    console.error('Error fetching service details:', error);
    return NextResponse.json(
      { error: 'An error occurred while fetching service details' },
      { status: 500 }
    );
  }
}