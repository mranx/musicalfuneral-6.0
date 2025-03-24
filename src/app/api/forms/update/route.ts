import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/database';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { cookies } from 'next/headers';

export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;
    
    if (!userId) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const body = await req.json();
    const { formName, formData } = body;
    
    // Get orderId from cookie or from request body
    let orderId = body.orderId;
    if (!orderId) {
      orderId = cookies().get('currentOrderId')?.value;
      
      if (!orderId) {
        return NextResponse.json(
          { success: false, message: 'No active order found. Please start the order process again.' },
          { status: 400 }
        );
      }
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
    
    // Check if the form progress record exists
    const existingRecord = await prisma.user_form_progress.findUnique({
      where: { orderId }
    });
    
    // Get the existing form data or create an empty object
    const existingFormData = existingRecord?.formData as any || {};
    
    // List of all preference types
    const preferenceTypes = [
      'catholicPreference', 
      'baptistPreference', 
      'secularOrCivilPreference',
      'anglicanPreference',
      'unitingPreference'
    ];
    
    // Check if the current form is a preference type
    const isPreferenceForm = preferenceTypes.includes(formName);
    
    // Create a copy of existing data to update
    let updatedFormData = { ...existingFormData };
    
    // If this is a preference type form, remove other preference types
    if (isPreferenceForm) {
      console.log(`Setting ${formName} and removing other preferences`);
      preferenceTypes.forEach(type => {
        if (type !== formName && updatedFormData[type]) {
          console.log(`Removing ${type} from form data`);
          delete updatedFormData[type];
        }
      });
    }
    
    // Now add or update the current form data
    updatedFormData = {
      ...updatedFormData,
      [formName]: formData
    };
    
  
    
    // Update with Prisma using upsert instead of update to handle cases where the record doesn't exist
    await prisma.user_form_progress.upsert({
      where: { orderId },
      update: {
        formData: updatedFormData,
        updatedAt: new Date()
      },
      create: {
        orderId,
        userId: userId, // Add userId here to fix the TypeScript error
        formData: updatedFormData,
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