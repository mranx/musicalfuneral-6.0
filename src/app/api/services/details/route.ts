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

    const serviceDetails = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        relation: true,
        directorName: true,
        directorCompany: true,
        directorEmail: true,
        deceasedName: true,
        dateOfBirth: true,
        dateOfPassing: true,
        specialRequests: true,
        servicePlan: true,
        servicePrice: true,
        createdAt: true,
      },
    });

    if (!serviceDetails) {
      return NextResponse.json(
        { error: 'Service details not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(serviceDetails);
  } catch (error) {
    console.error('Error fetching service details:', error);
    return NextResponse.json(
      { error: 'An error occurred while fetching service details' },
      { status: 500 }
    );
  }
}