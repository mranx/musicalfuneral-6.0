import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/database';

import { v4 as uuidv4 } from 'uuid'; // Import UUID generator

export async function GET() {
  try {
    const services = await db.serviceitem.findMany({
      orderBy: { order: 'asc' },
    });
    return NextResponse.json(services);
  } catch (error) {
    console.error('Error fetching services:', error);
    return NextResponse.json(
      { error: 'Failed to fetch services' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, description, iconType, order, isActive } = body;

    const service = await db.serviceitem.create({
      data: {
        id: uuidv4(), // Explicitly provide ID
        title,
        description,
        iconType,
        order: order || 0,
        isActive: isActive !== undefined ? isActive : true,
        updatedAt: new Date(), // Explicitly provide updatedAt
      },
    });

    return NextResponse.json(service);
  } catch (error) {
    console.error('Error creating service:', error);
    return NextResponse.json(
      { error: 'Failed to create service' },
      { status: 500 }
    );
  }
}