import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/database';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const item = await db.howitworksitem.findUnique({
      where: { id: params.id },
    });

    if (!item) {
      return NextResponse.json(
        { error: 'How it works item not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(item);
  } catch (error) {
    console.error('Error fetching how it works item:', error);
    return NextResponse.json(
      { error: 'Failed to fetch how it works item' },
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
    const { step, title, description, order, isActive } = body;

    const item = await db.howitworksitem.update({
      where: { id: params.id },
      data: {
        step,
        title,
        description,
        order,
        isActive,
      },
    });

    return NextResponse.json(item);
  } catch (error) {
    console.error('Error updating how it works item:', error);
    return NextResponse.json(
      { error: 'Failed to update how it works item' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await db.howitworksitem.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting how it works item:', error);
    return NextResponse.json(
      { error: 'Failed to delete how it works item' },
      { status: 500 }
    );
  }
}