// src/app/api/user/orders/[orderId]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import prisma from '@/lib/database';

// Define a custom session type that includes id
interface CustomSession {
  user?: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
    id?: string;
  };
}

// Get a specific order by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { orderId: string } }
) {
  try {
    const { orderId } = params;
    console.log('Fetching order with ID:', orderId);
    
    if (!orderId) {
      return NextResponse.json(
        { error: 'Order ID is required' },
        { status: 400 }
      );
    }
    
    // Get the authenticated user session
    const session = await getServerSession(authOptions) as CustomSession;
    
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }
    
    const userId = session.user.id;
    console.log('User ID from session:', userId);
    
    // Use the Prisma client directly with the correct model name (order, not Order)
    try {
      console.log('Attempting to fetch order via Prisma client...');
      const order = await prisma.order.findUnique({
        where: {
          id: orderId,
        },
      });
      
      // Verify order belongs to the user
      if (!order || order.userId !== userId) {
        console.log('Order not found or does not belong to user');
        return NextResponse.json(
          { error: 'Order not found or does not belong to current user' },
          { status: 404 }
        );
      }
      
      console.log('Successfully retrieved order');
      return NextResponse.json(order, { status: 200 });
    } catch (prismaError) {
      console.error('Error using Prisma client:', prismaError);
      
      // Try with raw query as fallback with correct case (order, not Order)
      try {
        console.log('Falling back to raw query with lowercase table name...');
        const result = await prisma.$queryRaw`
          SELECT * FROM \`order\` 
          WHERE id = ${orderId} AND userId = ${userId}
        `;
        
        if (Array.isArray(result) && result.length > 0) {
          console.log('Successfully retrieved order via raw query');
          return NextResponse.json(result[0], { status: 200 });
        } else {
          console.log('Order not found via raw query');
          return NextResponse.json(
            { error: 'Order not found' },
            { status: 404 }
          );
        }
      } catch (rawError) {
        console.error('Raw query also failed:', rawError);
        return NextResponse.json(
          { error: 'Failed to fetch order', details: String(rawError) },
          { status: 500 }
        );
      }
    }
  } catch (error) {
    console.error('Error fetching order:', error);
    return NextResponse.json(
      { error: 'Failed to fetch order', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

// Update an order
export async function PUT(
  request: NextRequest,
  { params }: { params: { orderId: string } }
) {
  try {
    const { orderId } = params;
    console.log('Updating order with ID:', orderId);
    
    if (!orderId) {
      return NextResponse.json(
        { error: 'Order ID is required' },
        { status: 400 }
      );
    }
    
    // Get the authenticated user session
    const session = await getServerSession(authOptions) as CustomSession;
    
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }
    
    const userId = session.user.id;
    const body = await request.json();
    console.log('Request body:', body);
    
    // Use Prisma client to check order exists and belongs to user
    let existingOrder;
    try {
      console.log('Checking if order exists...');
      existingOrder = await prisma.order.findFirst({
        where: {
          id: orderId,
          userId: userId
        }
      });
      
      if (!existingOrder) {
        console.log('Order not found or does not belong to user');
        return NextResponse.json(
          { error: 'Order not found or does not belong to current user' },
          { status: 404 }
        );
      }
    } catch (checkError) {
      console.error('Error checking for order:', checkError);
      return NextResponse.json(
        { error: 'Error verifying order ownership', details: String(checkError) },
        { status: 500 }
      );
    }
    
    // Update the order using Prisma client
    try {
      console.log('Updating order...');
      const updatedOrder = await prisma.order.update({
        where: {
          id: orderId
        },
        data: {
          relation: body.relation || undefined,
          directorName: body.directorName || undefined,
          directorCompany: body.directorCompany || undefined,
          directorEmail: body.directorEmail || undefined,
          deceasedName: body.deceasedName || undefined,
          dateOfBirth: body.dateOfBirth ? new Date(body.dateOfBirth) : undefined,
          dateOfPassing: body.dateOfPassing ? new Date(body.dateOfPassing) : undefined,
          serviceDate: body.serviceDate ? new Date(body.serviceDate) : undefined,
          specialRequests: body.specialRequests || undefined,
          updatedAt: new Date()
        }
      });
      
      console.log('Order updated successfully');
      return NextResponse.json({
        message: 'Order updated successfully',
        order: updatedOrder
      }, { status: 200 });
    } catch (updateError) {
      console.error('Error updating order:', updateError);
      
      // Try with raw query as fallback
      try {
        console.log('Falling back to raw query update...');
        await prisma.$executeRaw`
          UPDATE \`order\` SET
            relation = ${body.relation || existingOrder.relation},
            directorName = ${body.directorName || existingOrder.directorName},
            directorCompany = ${body.directorCompany || existingOrder.directorCompany},
            directorEmail = ${body.directorEmail || existingOrder.directorEmail},
            deceasedName = ${body.deceasedName || existingOrder.deceasedName},
            dateOfBirth = ${body.dateOfBirth ? new Date(body.dateOfBirth) : existingOrder.dateOfBirth},
            dateOfPassing = ${body.dateOfPassing ? new Date(body.dateOfPassing) : existingOrder.dateOfPassing},
            serviceDate = ${body.serviceDate ? new Date(body.serviceDate) : existingOrder.serviceDate},
            specialRequests = ${body.specialRequests || existingOrder.specialRequests},
            updatedAt = NOW()
          WHERE id = ${orderId} AND userId = ${userId}
        `;
        
        // Fetch the updated order
        const result = await prisma.$queryRaw`
          SELECT * FROM \`order\` 
          WHERE id = ${orderId} AND userId = ${userId}
        `;
        
        if (Array.isArray(result) && result.length > 0) {
          console.log('Order updated successfully via raw query');
          return NextResponse.json({
            message: 'Order updated successfully',
            order: result[0]
          }, { status: 200 });
        } else {
          throw new Error('Could not retrieve updated order');
        }
      } catch (rawError) {
        console.error('Raw query update also failed:', rawError);
        return NextResponse.json(
          { error: 'Failed to update order', details: String(rawError) },
          { status: 500 }
        );
      }
    }
  } catch (error) {
    console.error('Overall error updating order:', error);
    return NextResponse.json(
      { error: 'Failed to update order', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

// Delete an order
export async function DELETE(
  request: NextRequest,
  { params }: { params: { orderId: string } }
) {
  try {
    const { orderId } = params;
    console.log('Deleting order with ID:', orderId);
    
    if (!orderId) {
      return NextResponse.json(
        { error: 'Order ID is required' },
        { status: 400 }
      );
    }
    
    // Get the authenticated user session
    const session = await getServerSession(authOptions) as CustomSession;
    
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }
    
    const userId = session.user.id;
    
    // Verify order exists and belongs to the user
    const existingOrder = await prisma.order.findFirst({
      where: {
        id: orderId,
        userId: userId
      }
    });
    
    if (!existingOrder) {
      return NextResponse.json(
        { error: 'Order not found or does not belong to current user' },
        { status: 404 }
      );
    }
    
    // Delete the order
    await prisma.order.delete({
      where: {
        id: orderId
      }
    });
    
    return NextResponse.json({
      message: 'Order deleted successfully'
    }, { status: 200 });
  } catch (error) {
    console.error('Error deleting order:', error);
    return NextResponse.json(
      { error: 'Failed to delete order', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}