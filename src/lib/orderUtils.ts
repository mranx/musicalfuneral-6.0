// Create a function to generate the MFF order ID
// src/lib/orderUtils.ts
export async function generateOrderId(prisma: any): Promise<string> {
    // Get the latest order to find the highest order number
    const latestOrder = await prisma.order.findFirst({
      where: {
        id: {
          startsWith: 'MFF'
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
  
    let nextNumber = 1;
    
    if (latestOrder) {
      // Extract the numeric part from the latest order ID
      const latestIdNumber = parseInt(latestOrder.id.substring(3), 10);
      nextNumber = isNaN(latestIdNumber) ? 1 : latestIdNumber + 1;
    }
    
    // Format the number with leading zeros to be 4 digits
    const formattedNumber = nextNumber.toString().padStart(4, '0');
    
    return `MFF${formattedNumber}`;
  }