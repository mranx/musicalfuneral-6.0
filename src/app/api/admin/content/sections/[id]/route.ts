import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/database';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const section = await db.contentsection.findUnique({
      where: { id: params.id },
    });

    if (!section) {
      return NextResponse.json(
        { error: 'Content section not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(section);
  } catch (error) {
    console.error('Error fetching content section:', error);
    return NextResponse.json(
      { error: 'Failed to fetch content section' },
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
    const { title, description, imageUrl, videoUrl, buttonText, buttonLink, order, isActive } = body;

    const section = await db.contentsection.update({
      where: { id: params.id },
      data: {
        title,
        description,
        imageUrl,
        videoUrl,
        buttonText,
        buttonLink,
        order,
        isActive,
      },
    });

    return NextResponse.json(section);
  } catch (error) {
    console.error('Error updating content section:', error);
    return NextResponse.json(
      { error: 'Failed to update content section' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await db.contentsection.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting content section:', error);
    return NextResponse.json(
      { error: 'Failed to delete content section' },
      { status: 500 }
    );
  }
}