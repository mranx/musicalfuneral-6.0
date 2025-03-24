import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/database';

import { v4 as uuidv4 } from 'uuid'; // Import UUID generator

export async function GET() {
  try {
    const sections = await db.contentsection.findMany({
      orderBy: { order: 'asc' },
    });
    return NextResponse.json(sections);
  } catch (error) {
    console.error('Error fetching content sections:', error);
    return NextResponse.json(
      { error: 'Failed to fetch content sections' },
      { status: 500 }
    );
  }
}
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      sectionName, 
      title, 
      description, 
      imageUrl, 
      videoUrl, 
      buttonText, 
      buttonLink, 
      order,
      isActive // Add this to your destructuring
    } = body;

    // Validate required fields
    if (!sectionName || !title) {
      return NextResponse.json(
        { error: 'Section name and title are required fields' },
        { status: 400 }
      );
    }

    const section = await db.contentsection.create({
      data: {
        id: uuidv4(), // Explicitly provide ID
        sectionName,
        title,
        description,
        imageUrl,
        videoUrl,
        buttonText,
        buttonLink,
        order: order || 0,
        isActive: isActive !== undefined ? isActive : true,
        updatedAt: new Date(), // Explicitly provide updatedAt
      },
    });

    return NextResponse.json(section, { status: 201 });
  } catch (error) {
    console.error('Error creating content section:', error);
    return NextResponse.json(
      { error: 'Failed to create content section' },
      { status: 500 }
    );
  }
}