// lib/content.ts
import { db } from '@/lib/database';

// Define types to match Prisma's actual return types
interface ContentSectionModel {
  id: string;
  sectionName: string;
  title: string;
  description: string | null;
  imageUrl: string | null;
  videoUrl: string | null;
  buttonText: string | null;
  buttonLink: string | null;
  order: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface PricingPlanModel {
  id: string;
  title: string;
  price: number | string;
  features: string;
  order: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// This function fetches all content for the homepage from the database
export async function getHomePageContent() {
  try {
    // Fetch all content sections
    const sections = await db.contentsection.findMany({
      where: { isActive: true },
      orderBy: { order: 'asc' },
    });

    // Fetch FAQs
    const faqs = await db.faqitem.findMany({
      where: { isActive: true },
      orderBy: { order: 'asc' },
    });

    // Fetch services
    const services = await db.serviceitem.findMany({
      where: { isActive: true },
      orderBy: { order: 'asc' },
    });

    // Fetch pricing plans
    const pricingPlans = await db.pricingplan.findMany({
      where: { isActive: true },
      orderBy: { order: 'asc' },
    });

    // Fetch how it works steps
    const howItWorks = await db.howitworksitem.findMany({
      where: { isActive: true },
      orderBy: { order: 'asc' },
    });

    // Fetch demo videos
    const demoVideos = await db.demovideo.findMany({
      where: { isActive: true },
      orderBy: { order: 'asc' },
    });

    // Process content sections into a more usable format with proper typing
    const contentBySection = sections.reduce<Record<string, any>>((acc, section) => {
      // Parse button text and links
      let buttonText = section.buttonText ? section.buttonText.split(',') : [];
      let buttonLink = section.buttonLink ? section.buttonLink.split(',') : [];
      
      acc[section.sectionName] = {
        ...section,
        buttonText1: buttonText[0] || '',
        buttonLink1: buttonLink[0] || '',
        buttonText2: buttonText[1] || '',
        buttonLink2: buttonLink[1] || '',
      };
      
      return acc;
    }, {});

    // Format pricing plans to match the expected structure
    const formattedPricingPlans = pricingPlans.map((plan) => ({
      ...plan,
      features: plan.features.split('|'),
    }));

    return {
      sections: contentBySection,
      hero: contentBySection['hero'] || null,
      about: contentBySection['about'] || null,
      faqs,
      services,
      pricingPlans: formattedPricingPlans,
      howItWorks,
      demoVideos
    };
  } catch (error) {
    console.error('Error fetching homepage content:', error);
    // Return empty defaults
    return {
      sections: {},
      hero: null,
      about: null,
      faqs: [],
      services: [],
      pricingPlans: [],
      howItWorks: [],
      demoVideos: []
    };
  }
}

// Helper function for the initial database seeding with content
export async function seedInitialContent() {
  // Check if we already have content
  const existingContent = await db.contentsection.findFirst();
  if (existingContent) return;

  // Create default content sections
  await db.contentsection.createMany({
    data: [
      {
        id: 'hero-section',
        sectionName: 'hero',
        title: 'Get AI Generated tailored funeral music videos',
        description: 'Create personalized and meaningful funeral music videos that honor and celebrate the lives of your loved ones.',
        videoUrl: '/assets/videos/test.mp4',
        buttonText: 'Our Services,Contact Us',
        buttonLink: '/services,/contact',
        order: 1,
        isActive: true,
        updatedAt: new Date(),
      },
      {
        id: 'about-section',
        sectionName: 'about',
        title: 'Who Are We',
        description: 'We are a dedicated team of professionals committed to providing personalized and meaningful funeral music services. Our expertise spans across various religious denominations, ensuring that each service is conducted with the utmost respect and authenticity.\n\nWith years of experience in funeral services and music production, we understand the importance of creating the right atmosphere for remembrance and reflection. Our AI-powered technology allows us to deliver high-quality, customized musical arrangements that honor your loved ones.',
        imageUrl: '/assets/images/priest-praying-church 1.png',
        order: 3,
        isActive: true,
        updatedAt: new Date(),
      },
    ]
  });

  // Create default FAQs
  await db.faqitem.createMany({
    data: [
      {
        id: 'faq-1',
        question: "What services does your agency provide?",
        answer: "We provide AI-generated funeral music and video services, creating personalized tributes for memorial services across different religious denominations.",
        order: 1,
        isActive: true,
        updatedAt: new Date(),
      },
      {
        id: 'faq-2',
        question: "What's your pricing plans?",
        answer: "We offer three main plans: MP3 Original Recording Audio, FMO MP3 Audio, and FMO MP4 Video, each starting at $40.00 with different features and customization options.",
        order: 2,
        isActive: true,
        updatedAt: new Date(),
      },
      {
        id: 'faq-3',
        question: "How to book your service offshore?",
        answer: "You can book our services by selecting your preferred plan, filling out the required details, and following our simple three-step process. We provide support throughout the booking process.",
        order: 3,
        isActive: true,
        updatedAt: new Date(),
      }
    ]
  });
}