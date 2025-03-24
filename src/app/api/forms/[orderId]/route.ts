// src/app/api/forms/[orderId]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/database';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { cookies } from 'next/headers';

export async function GET(
  req: NextRequest,
  { params }: { params: { orderId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;
    
    // Handle special 'current' parameter
    let orderId = params.orderId;
    if (orderId === 'current') {
      orderId = cookies().get('currentOrderId')?.value ?? "";
      
      if (!orderId) {
        return NextResponse.json(
          { success: false, message: 'No active order found in cookies' },
          { status: 404 }
        );
      }
    }
    
    const { searchParams } = new URL(req.url);
    const formName = searchParams.get('formName');
    
    // If user is logged in, verify they own this order
    if (userId) {
      const order = await prisma.order.findUnique({
        where: { id: orderId },
        select: { userId: true }
      });
      
      if (!order || order.userId !== userId) {
        return NextResponse.json(
          { success: false, message: 'Order not found or access denied' },
          { status: 403 }
        );
      }
    }
    
    // Get the form data using Prisma
    const result = await prisma.user_form_progress.findUnique({
      where: { orderId }
    });
    
    if (!result) {
      // If no form data found, return empty object but still success true
      return NextResponse.json({
        success: true,
        orderId,
        formData: {}
      });
    }
    
    const allFormData = result.formData as any;
    
    // If a specific form name is provided, return only that form's data
    if (formName && allFormData && allFormData[formName]) {
      return NextResponse.json({
        success: true,
        orderId,
        formData: { [formName]: allFormData[formName] }
      });
    }
    
    // Otherwise return all form data
    return NextResponse.json({
      success: true,
      orderId,
      formData: allFormData || {}
    });
  } catch (error) {
    console.error('Error fetching form data:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch form data' },
      { status: 500 }
    );
  }
}

// Add PUT method to the same route file
export async function PUT(
  req: NextRequest,
  { params }: { params: { orderId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;
    
    if (!userId) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Get orderId from params
    let orderId = params.orderId;
    
    const body = await req.json();
    const { formName, formData } = body;
    
    if (!formName || !formData) {
      return NextResponse.json(
        { success: false, message: 'Missing form name or form data' },
        { status: 400 }
      );
    }
    
    // Verify they own this order
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      select: { userId: true }
    });
    
    if (!order || order.userId !== userId) {
      return NextResponse.json(
        { success: false, message: 'Order not found or access denied' },
        { status: 403 }
      );
    }
    
    // Get existing form data or create empty object if none exists
    const existingRecord = await prisma.user_form_progress.findUnique({
      where: { orderId }
    });
    
    const existingFormData = existingRecord?.formData as any || {};
    
    // Create a copy of existing data to update
    let updatedFormData = { ...existingFormData };
    
    // Update the specified form's data
    updatedFormData[formName] = formData;
    
    // Use upsert to create or update the record
    await prisma.user_form_progress.upsert({
      where: { orderId },
      update: {
        formData: updatedFormData,
        updatedAt: new Date()
      },
      create: {
        orderId,
        userId: userId, // Add userId here to fix the TypeScript error
        formData: { [formName]: formData },
        createdAt: new Date(),
        updatedAt: new Date()
      }
    });
    
    return NextResponse.json({ 
      success: true, 
      orderId,
      message: 'Form data updated successfully'
    });
  } catch (error) {
    console.error('Error updating form data:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to update form data' },
      { status: 500 }
    );
  }
}