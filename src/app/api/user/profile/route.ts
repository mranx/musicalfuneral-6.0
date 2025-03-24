// src/app/api/user/profile/route.ts
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
    console.log('Fetching user profile...');
    
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
      // Fetch the user data using Prisma client
      console.log('Fetching user with Prisma client...');
      const user = await prisma.user.findUnique({
        where: {
          id: userId,
        },
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          createdAt: true,
          updatedAt: true,
        },
      });
      
      if (!user) {
        console.log('User not found');
        return NextResponse.json(
          { error: 'User not found' },
          { status: 404 }
        );
      }
      
      console.log('User found:', user.name);
      return NextResponse.json(user, { status: 200 });
    } catch (prismaError) {
      console.error('Error fetching user with Prisma client:', prismaError);
      
      // Try with raw query as fallback
      try {
        console.log('Falling back to raw query...');
        const users = await prisma.$queryRaw`
          SELECT id, name, email, phone, createdAt, updatedAt 
          FROM user WHERE id = ${userId}
        `;
        
        if (Array.isArray(users) && users.length > 0) {
          console.log('User found via raw query');
          return NextResponse.json(users[0], { status: 200 });
        } else {
          console.log('User not found via raw query');
          return NextResponse.json(
            { error: 'User not found' },
            { status: 404 }
          );
        }
      } catch (rawError) {
        console.error('Raw query also failed:', rawError);
        return NextResponse.json(
          { error: 'Failed to fetch user profile', details: String(rawError) },
          { status: 500 }
        );
      }
    }
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user profile', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

// Update user profile
export async function PUT(request: NextRequest) {
  try {
    console.log('Updating user profile...');
    
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
    const body = await request.json();
    console.log('Update request body:', body);
    
    // Validate required fields
    if (!body.name || !body.phone) {
      console.log('Missing required fields in update request');
      return NextResponse.json(
        { error: 'Name and phone are required' },
        { status: 400 }
      );
    }
    
    try {
      // Update the user with Prisma client
      console.log('Updating user with Prisma client...');
      const updatedUser = await prisma.user.update({
        where: {
          id: userId,
        },
        data: {
          name: body.name,
          phone: body.phone,
        },
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          createdAt: true,
          updatedAt: true,
        },
      });
      
      console.log('User updated successfully');
      return NextResponse.json({
        message: 'Profile updated successfully',
        user: updatedUser
      }, { status: 200 });
    } catch (prismaError) {
      console.error('Error updating user with Prisma client:', prismaError);
      
      // Try with raw query as fallback
      try {
        console.log('Falling back to raw query for update...');
        await prisma.$executeRaw`
          UPDATE user 
          SET name = ${body.name}, phone = ${body.phone}, updatedAt = NOW()
          WHERE id = ${userId}
        `;
        
        // Fetch the updated user data
        const updatedUsers = await prisma.$queryRaw`
          SELECT id, name, email, phone, createdAt, updatedAt 
          FROM user WHERE id = ${userId}
        `;
        
        if (Array.isArray(updatedUsers) && updatedUsers.length > 0) {
          console.log('User updated via raw query');
          return NextResponse.json({
            message: 'Profile updated successfully',
            user: updatedUsers[0]
          }, { status: 200 });
        } else {
          throw new Error('Failed to fetch updated user data');
        }
      } catch (rawError) {
        console.error('Raw query update also failed:', rawError);
        return NextResponse.json(
          { error: 'Failed to update user profile', details: String(rawError) },
          { status: 500 }
        );
      }
    }
  } catch (error) {
    console.error('Overall error updating user profile:', error);
    return NextResponse.json(
      { error: 'Failed to update user profile', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}