import { prisma } from '../db.js';
import type { users } from '../generated/prisma/index.js';

export class UserRepository {
  /**
   * Find all users in the database
   * @returns Promise<users[]> - Array of all users
   */
  async findAll(): Promise<users[]> {
    return await prisma.users.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  /**
   * Find a user by ID
   * @param id - User ID
   * @returns Promise<users | null> - User object or null if not found
   */
  async findById(id: string): Promise<users | null> {
    return await prisma.users.findUnique({
      where: { id },
    });
  }

  /**
   * Find a user by email
   * @param email - User email
   * @returns Promise<users | null> - User object or null if not found
   */
  async findByEmail(email: string): Promise<users | null> {
    return await prisma.users.findUnique({
      where: { email },
    });
  }

  /**
   * Count total number of users
   * @returns Promise<number> - Total count of users
   */
  async count(): Promise<number> {
    return await prisma.users.count();
  }

  /**
   * Upsert a user (create if doesn't exist, update if exists)
   * @param userData - User data from Keycloak
   * @returns Promise<users> - Created or updated user
   */
  async upsert(userData: {
    id: string;
    username?: string | null;
    firstName?: string | null;
    lastName?: string | null;
    email?: string | null;
    phone?: string | null;
  }): Promise<users> {
    return await prisma.users.upsert({
      where: { id: userData.id },
      update: {
        username: userData.username,
        firstName: userData.firstName,
        lastName: userData.lastName,
        email: userData.email,
        phone: userData.phone,
        updatedAt: new Date(),
      },
      create: {
        id: userData.id,
        username: userData.username,
        firstName: userData.firstName,
        lastName: userData.lastName,
        email: userData.email,
        phone: userData.phone,
      },
    });
  }
}

export const userRepository = new UserRepository();