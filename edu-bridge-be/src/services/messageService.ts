import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const messageService = {
  /**
   * Get all users in a specific school (for finding people to chat with)
   */
  async getSchoolUsers(schoolId: string, currentUserId: string) {
    console.log(`Getting users for school ${schoolId}, excluding user ${currentUserId}`);

    // Get all users who have access to this school
    // This includes teachers, parents, and admins
    const schoolAdmins = await prisma.school_admins.findMany({
      where: { schoolId },
      select: { userId: true },
    });
    console.log(`Found ${schoolAdmins.length} school admins`);

    const classMemberships = await prisma.class_memberships.findMany({
      where: {
        classes: { schoolId },
      },
      select: { userId: true },
    });
    console.log(`Found ${classMemberships.length} class memberships`);

    const childAssignments = await prisma.child_class_assignments.findMany({
      where: {
        children: { schoolId },
      },
      select: { parentId: true },
    });
    console.log(`Found ${childAssignments.length} child assignments`);

    const schoolPermissions = await prisma.school_permissions.findMany({
      where: { schoolId },
      select: { userId: true },
    });
    console.log(`Found ${schoolPermissions.length} school permissions`);

    // Combine all unique user IDs
    const userIds = new Set<string>();
    schoolAdmins.forEach((admin) => userIds.add(admin.userId));
    classMemberships.forEach((member) => userIds.add(member.userId));
    childAssignments.forEach((assignment) => userIds.add(assignment.parentId));
    schoolPermissions.forEach((perm) => userIds.add(perm.userId));

    console.log(`Total unique user IDs before filtering: ${userIds.size}`, Array.from(userIds));

    // Remove current user
    userIds.delete(currentUserId);

    console.log(`Total unique user IDs after filtering out current user: ${userIds.size}`, Array.from(userIds));

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

    console.log(`Fetched ${users.length} users from database`, users);

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
    const now = new Date();
    const newThread = await prisma.threads.create({
      data: {
        id: generateId(),
        type: "direct",
        createdAt: now,
        updatedAt: now,
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
        parentMessageId: null, // Only get top-level messages
      },
      orderBy: {
        createdAt: "desc",
      },
      take: limit,
      skip: offset,
      include: {
        message_read_status: true,
        replies: {
          where: {
            deletedAt: null,
          },
          orderBy: {
            createdAt: "asc",
          },
          include: {
            message_read_status: true,
          },
        },
        _count: {
          select: {
            replies: {
              where: {
                deletedAt: null,
              },
            },
          },
        },
      },
    });

    return messages.reverse(); // Return in ascending order (oldest first)
  },

  /**
   * Send a message in a thread
   */
  async sendMessage(
    threadId: string,
    senderId: string,
    content: string,
    parentMessageId?: string
  ) {
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

    // If replying to a message, verify the parent message exists
    if (parentMessageId) {
      const parentMessage = await prisma.messages.findFirst({
        where: {
          id: parentMessageId,
          threadId, // Ensure parent is in same thread
          deletedAt: null,
        },
      });

      if (!parentMessage) {
        throw new Error("Parent message not found");
      }
    }

    const now = new Date();
    const message = await prisma.messages.create({
      data: {
        id: generateId(),
        threadId,
        senderId,
        content,
        parentMessageId,
        status: "SENT",
        createdAt: now,
        updatedAt: now,
      },
      include: {
        message_read_status: true,
        replies: true,
        _count: {
          select: {
            replies: true,
          },
        },
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
   * Mark a message as read and update status to SEEN
   */
  async markMessageAsRead(messageId: string, userId: string) {
    // Create read status
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

    // Check if all participants have read the message, then update to SEEN
    const message = await prisma.messages.findUnique({
      where: { id: messageId },
      include: {
        threads: {
          include: {
            thread_participants: true,
          },
        },
        message_read_status: true,
      },
    });

    if (message) {
      const participantCount = message.threads.thread_participants.length;
      const readCount = message.message_read_status.length;

      // If all participants (except sender) have read, mark as SEEN
      if (readCount >= participantCount - 1 && message.status === "SENT") {
        await prisma.messages.update({
          where: { id: messageId },
          data: { status: "SEEN" },
        });
      }
    }

    return readStatus;
  },

  /**
   * Create or get a group thread (chat history)
   */
  async createOrGetGroupThread(groupId: string) {
    const existingThread = await prisma.threads.findUnique({
      where: { groupId },
      include: {
        thread_participants: true,
        groups: {
          include: {
            group_memberships: true,
          },
        },
      },
    });

    if (existingThread) {
      return existingThread;
    }

    // Get all group members
    const group = await prisma.groups.findUnique({
      where: { id: groupId },
      include: {
        group_memberships: true,
      },
    });

    if (!group) {
      throw new Error("Group not found");
    }

    // Create thread with all group members as participants
    const now = new Date();
    const newThread = await prisma.threads.create({
      data: {
        id: generateId(),
        type: "group",
        groupId,
        createdAt: now,
        updatedAt: now,
        thread_participants: {
          create: group.group_memberships.map((member) => ({
            id: generateId(),
            userId: member.userId,
          })),
        },
      },
      include: {
        thread_participants: true,
        groups: true,
      },
    });

    return newThread;
  },

  /**
   * Create or get a class channel thread
   */
  async createOrGetClassThread(classId: string) {
    const existingThread = await prisma.threads.findUnique({
      where: { classId },
      include: {
        thread_participants: true,
        classes: {
          include: {
            class_memberships: true,
          },
        },
      },
    });

    if (existingThread) {
      return existingThread;
    }

    // Get all class members
    const classData = await prisma.classes.findUnique({
      where: { id: classId },
      include: {
        class_memberships: true,
      },
    });

    if (!classData) {
      throw new Error("Class not found");
    }

    // Create thread with all class members as participants
    const now = new Date();
    const newThread = await prisma.threads.create({
      data: {
        id: generateId(),
        type: "class_channel",
        classId,
        createdAt: now,
        updatedAt: now,
        thread_participants: {
          create: classData.class_memberships.map((member) => ({
            id: generateId(),
            userId: member.userId,
          })),
        },
      },
      include: {
        thread_participants: true,
        classes: true,
      },
    });

    return newThread;
  },

  /**
   * Long polling - Get new messages since a timestamp
   */
  async pollNewMessages(threadId: string, userId: string, since: Date, timeout = 30000) {
    // Verify user has access
    const participation = await prisma.thread_participants.findFirst({
      where: { threadId, userId },
    });

    if (!participation) {
      throw new Error("User does not have access to this thread");
    }

    const startTime = Date.now();

    // Poll for new messages with timeout
    while (Date.now() - startTime < timeout) {
      const newMessages = await prisma.messages.findMany({
        where: {
          threadId,
          deletedAt: null,
          createdAt: {
            gt: since,
          },
        },
        orderBy: {
          createdAt: "asc",
        },
        include: {
          message_read_status: true,
          replies: {
            where: {
              deletedAt: null,
            },
            orderBy: {
              createdAt: "asc",
            },
            include: {
              message_read_status: true,
            },
          },
          _count: {
            select: {
              replies: {
                where: {
                  deletedAt: null,
                },
              },
            },
          },
        },
      });

      if (newMessages.length > 0) {
        return newMessages;
      }

      // Wait 1 second before checking again
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    // Return empty array if timeout
    return [];
  },
};

// Helper function to generate IDs (you might want to use a proper ID generation library)
function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
}
