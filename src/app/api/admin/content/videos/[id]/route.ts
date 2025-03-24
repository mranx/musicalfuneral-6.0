import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/database';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const video = await db.demovideo.findUnique({
      where: { id: params.id },
    });

    if (!video) {
      return NextResponse.json(
        { error: 'Demo video not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(video);
  } catch (error) {
    console.error('Error fetching demo video:', error);
    return NextResponse.json(
      { error: 'Failed to fetch demo video' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { title, duration, src, thumbnail, order, isActive } = body;

    const video = await db.demovideo.update({
      where: { id: params.id },
      data: {
        title,
        duration,
        src,
        thumbnail,
        order,
        isActive,
      },
    });

    return NextResponse.json(video);
  } catch (error) {
    console.error('Error updating demo video:', error);
    return NextResponse.json(
      { error: 'Failed to update demo video' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await db.demovideo.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting demo video:', error);
    return NextResponse.json(
      { error: 'Failed to delete demo video' },
      { status: 500 }
    );
  }
}