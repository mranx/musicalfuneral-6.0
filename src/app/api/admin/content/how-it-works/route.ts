import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/database';
import { v4 as uuidv4 } from 'uuid'; // Import UUID generator


export async function GET() {
  try {
    const items = await db.howitworksitem.findMany({
      orderBy: { order: 'asc' },
    });
    return NextResponse.json(items);
  } catch (error) {
    console.error('Error fetching how it works items:', error);
    return NextResponse.json(
      { error: 'Failed to fetch how it works items' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { step, title, description, order, isActive } = body;

    const item = await db.howitworksitem.create({
      data: {
        id: uuidv4(), // Generate a unique ID
        step,
        title,
        description,
        order: order || 0,
        isActive: isActive !== undefined ? isActive : true,
        updatedAt: new Date(), // Explicitly set the updated date
      },
    });

    return NextResponse.json(item);
  } catch (error) {
    console.error('Error creating how it works item:', error);
    return NextResponse.json(
      { error: 'Failed to create how it works item' },
      { status: 500 }
    );
  }
}