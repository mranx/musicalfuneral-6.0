import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/database';
import { v4 as uuidv4 } from 'uuid'; // Import UUID generator (you may need to install this package)

/**
 * GET /api/faqs
 * Retrieves all FAQ items sorted by order
 */
export async function GET() {
  try {
    const faqs = await db.faqitem.findMany({
      where: { isActive: true },
      orderBy: { order: 'asc' },
    });
    return NextResponse.json(faqs);
  } catch (error) {
    console.error('Error fetching FAQs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch FAQs', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

/**
 * POST /api/faqs
 * Creates a new FAQ item
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { question, answer, order, isActive } = body;

    // Validate required fields
    if (!question || !answer) {
      return NextResponse.json(
        { error: 'Question and answer are required fields' },
        { status: 400 }
      );
    }

    // Create the FAQ with a UUID
    const faq = await db.faqitem.create({
      data: {
        id: uuidv4(), // Generate a unique ID
        question,
        answer,
        order: order || 0,
        isActive: isActive !== undefined ? isActive : true,
        updatedAt: new Date(), // Set the updated date
      },
    });

    return NextResponse.json(faq, { status: 201 });
  } catch (error) {
    console.error('Error creating FAQ:', error);
    return NextResponse.json(
      { error: 'Failed to create FAQ', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}