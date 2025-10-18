import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const classService = {
  /**
   * Get all classes that a user has access to
   */
  async getUserClasses(userId: string) {
    const classMemberships = await prisma.class_memberships.findMany({
      where: {
        userId,
      },
      include: {
        classes: {
          include: {
            schools: true,
            _count: {
              select: {
                class_memberships: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    return classMemberships.map((membership) => ({
      id: membership.classes.id,
      name: membership.classes.name,
      type: membership.classes.type,
      description: membership.classes.description,
      schoolId: membership.classes.schoolId,
      schoolName: membership.classes.schools.name,
      studentCount: membership.classes._count.class_memberships,
      userRole: membership.role,
      permissions: {
        canPostNews: membership.canPostNews,
        canCreateGroups: membership.canCreateGroups,
        canDeleteMessages: membership.canDeleteMessages,
      },
    }));
  },

  /**
   * Get groups (channels) for a specific class
   */
  async getClassGroups(classId: string, userId: string) {
    // First verify user has access to this class
    const classMembership = await prisma.class_memberships.findFirst({
      where: {
        classId,
        userId,
      },
    });

    if (!classMembership) {
      throw new Error("User does not have access to this class");
    }

    // Get all groups for this class that the user is a member of
    const groups = await prisma.groups.findMany({
      where: {
        classId,
        group_memberships: {
          some: {
            userId,
          },
        },
      },
      include: {
        group_memberships: {
          select: {
            userId: true,
          },
        },
        _count: {
          select: {
            group_memberships: true,
          },
        },
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    return groups.map((group) => ({
      id: group.id,
      name: group.name,
      description: group.description,
      ownerId: group.ownerId,
      memberCount: group._count.group_memberships,
      createdAt: group.createdAt,
    }));
  },

  /**
   * Create a new group (channel) in a class
   */
  async createGroup(
    classId: string,
    userId: string,
    name: string,
    description?: string
  ) {
    // Check if user has permission to create groups
    const classMembership = await prisma.class_memberships.findFirst({
      where: {
        classId,
        userId,
      },
    });

    if (!classMembership) {
      throw new Error("User does not have access to this class");
    }

    if (!classMembership.canCreateGroups) {
      throw new Error("User does not have permission to create groups");
    }

    // Create the group
    const now = new Date();
    const group = await prisma.groups.create({
      data: {
        id: generateId(),
        classId,
        name,
        description,
        ownerId: userId,
        createdAt: now,
        updatedAt: now,
        group_memberships: {
          create: {
            id: generateId(),
            userId, // Creator is automatically a member
            joinedAt: now,
          },
        },
      },
      include: {
        _count: {
          select: {
            group_memberships: true,
          },
        },
      },
    });

    return {
      id: group.id,
      name: group.name,
      description: group.description,
      ownerId: group.ownerId,
      memberCount: group._count.group_memberships,
      createdAt: group.createdAt,
    };
  },

  /**
   * Get all members of a class (optionally excluding members of a specific group)
   */
  async getClassMembers(classId: string, userId: string, excludeGroupId?: string) {
    // First verify user has access to this class
    const classMembership = await prisma.class_memberships.findFirst({
      where: {
        classId,
        userId,
      },
    });

    if (!classMembership) {
      throw new Error("User does not have access to this class");
    }

    // Get all members of this class
    const members = await prisma.class_memberships.findMany({
      where: {
        classId,
      },
      select: {
        userId: true,
        role: true,
        createdAt: true,
      },
    });

    // If excludeGroupId is provided, filter out users who are already in that group
    let userIdsToExclude: string[] = [];
    if (excludeGroupId) {
      const groupMembers = await prisma.group_memberships.findMany({
        where: {
          groupId: excludeGroupId,
        },
        select: {
          userId: true,
        },
      });
      userIdsToExclude = groupMembers.map((gm) => gm.userId);
    }

    // Filter out excluded users
    const filteredMembers = members.filter((m) => !userIdsToExclude.includes(m.userId));

    // Get user details from the users table
    const userIds = filteredMembers.map((m) => m.userId);
    const users = await prisma.users.findMany({
      where: {
        id: {
          in: userIds,
        },
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
      },
    });

    // Combine membership info with user details
    return filteredMembers.map((member) => {
      const user = users.find((u) => u.id === member.userId);
      return {
        id: member.userId,
        firstName: user?.firstName || null,
        lastName: user?.lastName || null,
        email: user?.email || null,
        role: member.role,
        joinedAt: member.createdAt,
      };
    });
  },

  /**
   * Add a user to a group (channel)
   */
  async addUserToGroup(groupId: string, targetUserId: string, requestUserId: string) {
    // Get the group to find its class
    const group = await prisma.groups.findUnique({
      where: { id: groupId },
      select: { classId: true, ownerId: true },
    });

    if (!group) {
      throw new Error("Group not found");
    }

    // Verify requesting user has access to this class
    const requestUserMembership = await prisma.class_memberships.findFirst({
      where: {
        classId: group.classId,
        userId: requestUserId,
      },
    });

    if (!requestUserMembership) {
      throw new Error("You do not have access to this class");
    }

    // Verify target user has access to this class
    const targetUserMembership = await prisma.class_memberships.findFirst({
      where: {
        classId: group.classId,
        userId: targetUserId,
      },
    });

    if (!targetUserMembership) {
      throw new Error("Target user is not a member of this class");
    }

    // Check if target user is already a member of the group
    const existingMembership = await prisma.group_memberships.findFirst({
      where: {
        groupId,
        userId: targetUserId,
      },
    });

    if (existingMembership) {
      throw new Error("User is already a member of this group");
    }

    // Add the user to the group
    const now = new Date();
    await prisma.group_memberships.create({
      data: {
        id: generateId(),
        groupId,
        userId: targetUserId,
        joinedAt: now,
      },
    });

    return {
      success: true,
      message: "User added to group successfully",
    };
  },
};

// Helper function to generate IDs
function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
}
