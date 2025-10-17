import { PrismaClient } from '@prisma/client';

export const prisma = new PrismaClient();

// Test connection
export async function testConnection() {
  try {
    await prisma.$connect();
    console.log('Database connection successful!');
    return true;
  } catch (error) {
    console.error('Database connection failed:', error);
    return false;
  } finally {
    await prisma.$disconnect();
  }
}
