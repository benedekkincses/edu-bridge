import { userRepository } from '../repositories/userRepository.js';
import type { users } from '../generated/prisma/index.js';

export class UserService {
  /**
   * Get all users from the database
   * @returns Promise<users[]> - Array of all users
   */
  async getAllUsers(): Promise<users[]> {
    return await userRepository.findAll();
  }

  /**
   * Get a user by ID
   * @param id - User ID
   * @returns Promise<users | null> - User object or null if not found
   */
  async getUserById(id: string): Promise<users | null> {
    return await userRepository.findById(id);
  }

  /**
   * Get a user by email
   * @param email - User email
   * @returns Promise<users | null> - User object or null if not found
   */
  async getUserByEmail(email: string): Promise<users | null> {
    return await userRepository.findByEmail(email);
  }

  /**
   * Get total count of users
   * @returns Promise<number> - Total count of users
   */
  async getUserCount(): Promise<number> {
    return await userRepository.count();
  }
}

export const userService = new UserService();