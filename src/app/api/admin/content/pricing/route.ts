import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/database';
import { v4 as uuidv4 } from 'uuid'; // Import UUID generator

export async function GET() {
  try {
    const pricingPlans = await db.pricingplan.findMany({
      orderBy: { order: 'asc' },
    });
    return NextResponse.json(pricingPlans);
  } catch (error) {
    console.error('Error fetching pricing plans:', error);
    return NextResponse.json(
      { error: 'Failed to fetch pricing plans' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, price, features, order, isActive } = body;

    const pricingPlan = await db.pricingplan.create({
      data: {
        id: uuidv4(), // Generate a unique ID
        title,
        price, // Ensure this is a valid Decimal
        features,
        order: order || 0,
        isActive: isActive !== undefined ? isActive : true,
        updatedAt: new Date(), // Explicitly set the updated date
      },
    });

    return NextResponse.json(pricingPlan);
  } catch (error) {
    console.error('Error creating pricing plan:', error);
    return NextResponse.json(
      { error: 'Failed to create pricing plan' },
      { status: 500 }
    );
  }
}