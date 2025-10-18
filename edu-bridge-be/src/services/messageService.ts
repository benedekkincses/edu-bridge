import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const messageService = {
  /**
   * Get all users in a specific school (for finding people to chat with)
   */
  async getSchoolUsers(schoolId: string, currentUserId: string) {
    // Get all users who have access to this school
    // This includes teachers, parents, and admins
    const schoolAdmins = await prisma.school_admins.findMany({
      where: { schoolId },
      select: { userId: true },
    });

    const classMemberships = await prisma.class_memberships.findMany({
      where: {
        classes: { schoolId },
      },
      select: { userId: true },
    });

    const childAssignments = await prisma.child_class_assignments.findMany({
      where: {
        children: { schoolId },
      },
      select: { parentId: true },
    });

    // Combine all unique user IDs
    const userIds = new Set<string>();
    schoolAdmins.forEach((admin) => userIds.add(admin.userId));
    classMemberships.forEach((member) => userIds.add(member.userId));
    childAssignments.forEach((assignment) => userIds.add(assignment.parentId));

    // Remove current user
    userIds.delete(currentUserId);

    // Fetch user details
    const users = await prisma.users.findMany({
      where: {
        id: {
          in: Array.from(userIds),
        },
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
      },
    });

    return users;
  },

  /**
   * Get all threads for a user
   */
  async getUserThreads(userId: string) {
    const threadParticipations = await prisma.thread_participants.findMany({
      where: { userId },
      include: {
        threads: {
          include: {
            thread_participants: {
              where: {
                userId: {
                  not: userId,
                },
              },
            },
            messages: {
              orderBy: {
                createdAt: "desc",
              },
              take: 1,
              include: {
                message_read_status: {
                  where: {
                    userId,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: {
        threads: {
          updatedAt: "desc",
        },
      },
    });

    // Get all unique user IDs from other participants
    const otherUserIds = threadParticipations
      .map((p) => p.threads.thread_participants)
      .flat()
      .map((tp) => tp.userId)
      .filter((id, index, self) => self.indexOf(id) === index); // unique

    // Fetch user data for all other participants
    const users = await prisma.users.findMany({
      where: {
        id: {
          in: otherUserIds,
        },
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
      },
    });

    // Create a map for quick lookup
    const userMap = new Map(users.map((u) => [u.id, u]));

    // Format the response
    return threadParticipations.map((participation) => {
      const thread = participation.threads;
      const otherParticipant = thread.thread_participants[0];
      const lastMessage = thread.messages[0];

      const participantUser = otherParticipant ? userMap.get(otherParticipant.userId) : null;

      return {
        threadId: thread.id,
        type: thread.type,
        participant: participantUser
          ? {
              id: participantUser.id,
              firstName: participantUser.firstName || "",
              lastName: participantUser.lastName || "",
              email: participantUser.email || "",
            }
          : null,
        lastMessage: lastMessage
          ? {
              id: lastMessage.id,
              content: lastMessage.content,
              createdAt: lastMessage.createdAt,
              isRead: lastMessage.message_read_status.length > 0,
            }
          : null,
        updatedAt: thread.updatedAt,
      };
    });
  },

  /**
   * Create or get existing direct thread between two users
   */
  async createOrGetDirectThread(userId1: string, userId2: string) {
    // Check if a thread already exists between these two users
    const existingThread = await prisma.threads.findFirst({
      where: {
        type: "direct",
        AND: [
          {
            thread_participants: {
              some: {
                userId: userId1,
              },
            },
          },
          {
            thread_participants: {
              some: {
                userId: userId2,
              },
            },
          },
        ],
      },
      include: {
        thread_participants: true,
      },
    });

    if (existingThread) {
      return existingThread;
    }

    // Create a new thread
    const newThread = await prisma.threads.create({
      data: {
        id: generateId(),
        type: "direct",
        thread_participants: {
          create: [
            { id: generateId(), userId: userId1 },
            { id: generateId(), userId: userId2 },
          ],
        },
      },
      include: {
        thread_participants: true,
      },
    });

    return newThread;
  },

  /**
   * Get messages for a specific thread
   */
  async getThreadMessages(threadId: string, userId: string, limit = 50, offset = 0) {
    // Verify user has access to this thread
    const participation = await prisma.thread_participants.findFirst({
      where: {
        threadId,
        userId,
      },
    });

    if (!participation) {
      throw new Error("User does not have access to this thread");
    }

    const messages = await prisma.messages.findMany({
      where: {
        threadId,
        deletedAt: null,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: limit,
      skip: offset,
      include: {
        message_read_status: {
          where: {
            userId,
          },
        },
      },
    });

    return messages.reverse(); // Return in ascending order (oldest first)
  },

  /**
   * Send a message in a thread
   */
  async sendMessage(threadId: string, senderId: string, content: string) {
    // Verify user has access to this thread
    const participation = await prisma.thread_participants.findFirst({
      where: {
        threadId,
        userId: senderId,
      },
    });

    if (!participation) {
      throw new Error("User does not have access to this thread");
    }

    const message = await prisma.messages.create({
      data: {
        id: generateId(),
        threadId,
        senderId,
        content,
      },
    });

    // Update thread's updatedAt
    await prisma.threads.update({
      where: { id: threadId },
      data: { updatedAt: new Date() },
    });

    return message;
  },

  /**
   * Mark a message as read
   */
  async markMessageAsRead(messageId: string, userId: string) {
    const readStatus = await prisma.message_read_status.upsert({
      where: {
        messageId_userId: {
          messageId,
          userId,
        },
      },
      create: {
        id: generateId(),
        messageId,
        userId,
      },
      update: {
        readAt: new Date(),
      },
    });

    return readStatus;
  },
};

// Helper function to generate IDs (you might want to use a proper ID generation library)
function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
}
