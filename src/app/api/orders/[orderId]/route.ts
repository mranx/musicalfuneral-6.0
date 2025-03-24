import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import prisma from '@/lib/prisma';
import { authOptions } from '@/lib/auth';

// GET a single order by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { orderId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    
    const orderId = params.orderId;
    
    // Fetch the order
    const order = await prisma.order.findUnique({
      where: {
        id: orderId,
      },
    });
    
    if (!order) {
      return NextResponse.json({ message: 'Order not found' }, { status: 404 });
    }
    
    // Check if the user is the owner of the order
    if (order.userId !== session.user.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 403 });
    }
    
    return NextResponse.json(order);
  } catch (error) {
    console.error('Error fetching order:', error);
    return NextResponse.json({ message: 'Server error' }, { status: 500 });
  }
}

// PUT/UPDATE an order by ID
export async function PUT(
  request: NextRequest,
  { params }: { params: { orderId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    
    const orderId = params.orderId;
    const data = await request.json();
    
    console.log('Received update data:', data); // Debug log
    
    // Fetch the order to verify ownership
    const existingOrder = await prisma.order.findUnique({
      where: {
        id: orderId,
      },
    });
    
    if (!existingOrder) {
      return NextResponse.json({ message: 'Order not found' }, { status: 404 });
    }
    
    // Check if the user is the owner of the order
    if (existingOrder.userId !== session.user.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 403 });
    }
    
    // Update the order
    const updatedOrder = await prisma.order.update({
      where: {
        id: orderId,
      },
      data: {
        relation: data.relation,
        directorName: data.directorName,
        directorCompany: data.directorCompany,
        directorEmail: data.directorEmail,
        deceasedName: data.deceasedName,
        dateOfBirth: new Date(data.dateOfBirth),
        dateOfPassing: new Date(data.dateOfPassing),
        serviceDate: data.serviceDate ? new Date(data.serviceDate) : null, // Add service date handling
        specialRequests: data.specialRequests,
        servicePlan: data.servicePlan,
        servicePrice: parseFloat(data.servicePrice),
      },
    });
    
    console.log('Updated order:', updatedOrder); // Debug log
    return NextResponse.json({ success: true, order: updatedOrder });
  } catch (error) {
    console.error('Error updating order:', error);
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}

// DELETE an order by ID and its associated form progress
export async function DELETE(
  request: NextRequest,
  { params }: { params: { orderId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    
    const orderId = params.orderId;
    
    // Fetch the order to verify ownership
    const existingOrder = await prisma.order.findUnique({
      where: {
        id: orderId,
      },
    });
    
    if (!existingOrder) {
      return NextResponse.json({ message: 'Order not found' }, { status: 404 });
    }
    
    // Check if the user is the owner of the order
    if (existingOrder.userId !== session.user.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 403 });
    }
    
    // Use a transaction to delete both the form progress and the order
    await prisma.$transaction(async (tx) => {
      // First try to delete any associated form progress record
      try {
        await tx.user_form_progress.delete({
          where: {
            orderId: orderId
          }
        });
        console.log(`Form progress for order ${orderId} deleted successfully`);
      } catch (err) {
        // If form progress doesn't exist, just log and continue
        console.log(`No form progress found for order ${orderId} or error deleting: ${err}`);
      }
      
      // Then delete the order
      await tx.order.delete({
        where: {
          id: orderId
        }
      });
      console.log(`Order ${orderId} deleted successfully`);
    });
    
    return NextResponse.json({ 
      success: true,
      message: 'Order and associated form progress deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting order:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Server error deleting order and form progress' 
    }, { status: 500 });
  }
}