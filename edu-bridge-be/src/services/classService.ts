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
};

// Helper function to generate IDs
function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
}
