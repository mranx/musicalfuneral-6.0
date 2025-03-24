// src/app/api/forms/create/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/database';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { cookies } from 'next/headers';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id || 'anonymous';
    
    const body = await req.json();
    const { formName, formData } = body;
    
    // Get orderId from cookie
    const orderId = cookies().get('currentOrderId')?.value;
    
    if (!orderId) {
      return NextResponse.json(
        { success: false, message: 'No active order found. Please start the order process again.' },
        { status: 400 }
      );
    }
    
    // If user is logged in, verify they own this order
    if (session?.user?.id) {
      const order = await prisma.order.findUnique({
        where: { id: orderId },
        select: { userId: true }
      });
      
      if (!order || order.userId !== session.user.id) {
        return NextResponse.json(
          { success: false, message: 'Order not found or access denied' },
          { status: 403 }
        );
      }
    }
    
    // Check if a form progress record already exists
    const existingProgress = await prisma.user_form_progress.findUnique({
      where: { orderId }
    });
    
    // If it exists, update it
    if (existingProgress) {
      const existingFormData = existingProgress.formData as any;
      
      await prisma.user_form_progress.update({
        where: { orderId },
        data: {
          formData: {
            ...existingFormData,
            [formName]: formData
          }
        }
      });
    } else {
      // Create a new form progress record
      await prisma.user_form_progress.create({
        data: {
          orderId,
          userId,
          formData: {
            [formName]: formData
          },
          currentStep: 1
        }
      });
    }
    
    return NextResponse.json({ 
      success: true, 
      orderId,
      message: 'Form data saved successfully'
    });
  } catch (error) {
    console.error('Error saving form data:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to save form data' },
      { status: 500 }
    );
  }
}