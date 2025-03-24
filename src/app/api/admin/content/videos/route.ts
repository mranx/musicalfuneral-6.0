import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/database';

import { v4 as uuidv4 } from 'uuid'; // Import UUID generator
export async function GET() {
  try {
    const videos = await db.demovideo.findMany({
      orderBy: { order: 'asc' },
    });
    return NextResponse.json(videos);
  } catch (error) {
    console.error('Error fetching demo videos:', error);
    return NextResponse.json(
      { error: 'Failed to fetch demo videos' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, duration, src, thumbnail, order, isActive } = body;

    const video = await db.demovideo.create({
      data: {
        id: uuidv4(), // Explicitly provide ID
        title,
        duration,
        src,
        thumbnail,
        order: order || 0,
        isActive: isActive !== undefined ? isActive : true,
        updatedAt: new Date(), // Explicitly provide updatedAt
      },
    });

    return NextResponse.json(video);
  } catch (error) {
    console.error('Error creating demo video:', error);
    return NextResponse.json(
      { error: 'Failed to create demo video' },
      { status: 500 }
    );
  }
}