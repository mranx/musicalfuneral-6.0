// scripts/migrateUserToOrder.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function migrateUserDataToOrders() {
  console.log('Starting data migration from users to orders...');
  
  try {
    // Get all users
    const users = await prisma.user.findMany();
    console.log(`Found ${users.length} users to migrate`);
    
    // For each user, create an order with their service data
    for (const user of users) {
      // Check if an order already exists for this user
      const existingOrder = await prisma.order.findFirst({
        where: {
          userId: user.id
        }
      });
      
      if (!existingOrder) {
        const order = await prisma.order.create({
          data: {
            userId: user.id,
            relation: user.relation,
            servicePlan: user.servicePlan,
            servicePrice: user.servicePrice,
            directorName: user.directorName,
            directorCompany: user.directorCompany,
            directorEmail: user.directorEmail,
            deceasedName: user.deceasedName,
            dateOfBirth: user.dateOfBirth,
            dateOfPassing: user.dateOfPassing,
            specialRequests: user.specialRequests,
            status: 'pending', // Default status
          },
        });
        
        console.log(`Created order for user ${user.id} (${user.email})`);
      } else {
        console.log(`Order already exists for user ${user.id} (${user.email}), skipping`);
      }
    }
    
    console.log('Migration completed successfully!');
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

migrateUserDataToOrders();