import { PrismaClient } from '@prisma/client';

// Use PrismaClient instance to prevent multiple instances in development
const globalForPrisma = global as unknown as { 
  prisma: PrismaClient | undefined 
};

export const db = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db;

// Add a default export for backward compatibility
export default db;