import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/database';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const pricingPlan = await db.pricingplan.findUnique({
      where: { id: params.id },
    });

    if (!pricingPlan) {
      return NextResponse.json(
        { error: 'Pricing plan not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(pricingPlan);
  } catch (error) {
    console.error('Error fetching pricing plan:', error);
    return NextResponse.json(
      { error: 'Failed to fetch pricing plan' },
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
    const { title, price, features, order, isActive } = body;

    const pricingPlan = await db.pricingplan.update({
      where: { id: params.id },
      data: {
        title,
        price,
        features,
        order,
        isActive,
      },
    });

    return NextResponse.json(pricingPlan);
  } catch (error) {
    console.error('Error updating pricing plan:', error);
    return NextResponse.json(
      { error: 'Failed to update pricing plan' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await db.pricingplan.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting pricing plan:', error);
    return NextResponse.json(
      { error: 'Failed to delete pricing plan' },
      { status: 500 }
    );
  }
}