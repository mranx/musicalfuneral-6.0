const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  try {
        // Hash the password
    const hashedPassword = await bcrypt.hash('123', 10);

    // Add admin user
    await prisma.admin.create({
      data: {
        email: 'mranx24@gmail.com',
        password: hashedPassword,
        name: 'Anss Wakeel' // Set a default name
      }
    });
    // Add initial services
    await prisma.serviceItem.createMany({
      data: [
        {
          title: "Catholic Service",
          description: "Personalized Catholic funeral music with traditional hymns and prayers.",
          iconType: "church",
          order: 1,
          isActive: true
        },
        {
          title: "Anglican Service",
          description: "Anglican funeral music combining traditional elements with personalized selections.",
          iconType: "cross",
          order: 2,
          isActive: true
        },
        {
          title: "Baptist Service",
          description: "Meaningful Baptist funeral music with gospel hymns and spirituals.",
          iconType: "bible",
          order: 3,
          isActive: true
        },
        {
          title: "Non-Denominational",
          description: "Customized funeral music without specific religious affiliation.",
          iconType: "heart",
          order: 4,
          isActive: true
        }
      ]
    });

    // Add initial pricing plans
    await prisma.pricingPlan.createMany({
      data: [
        {
          title: "MP3 Original Recording Audio",
          price: 40.00,
          features: "High-quality MP3 audio|Original funeral music|Unlimited streaming|Digital download",
          order: 1,
          isActive: true
        },
        {
          title: "FMO MP3 Audio",
          price: 55.00,
          features: "Customized audio selection|Professional mixing|Digital download|Unlimited streaming|30-day support",
          order: 2,
          isActive: true
        },
        {
          title: "FMO MP4 Video",
          price: 70.00,
          features: "High-definition video|Photo slideshow integration|Custom audio|Digital download|Unlimited streaming|60-day support",
          order: 3,
          isActive: true
        }
      ]
    });

    console.log("Seeding completed!");
  } catch (error) {
    console.error("Error seeding database:", error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the function
main();
