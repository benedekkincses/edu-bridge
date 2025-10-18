import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const schoolRepository = {
  /**
   * Get all schools that a user has access to via class_memberships
   * @param userId - Keycloak user ID
   * @returns Array of schools
   */
  async getSchoolsByUserId(userId: string) {
    // Get all classes the user is a member of
    const classMemberships = await prisma.class_memberships.findMany({
      where: {
        userId: userId,
      },
      include: {
        classes: {
          include: {
            schools: true,
          },
        },
      },
    });

    // Extract unique schools from class memberships
    const schoolsMap = new Map();
    classMemberships.forEach((membership) => {
      const school = membership.classes.schools;
      if (!schoolsMap.has(school.id)) {
        schoolsMap.set(school.id, school);
      }
    });

    return Array.from(schoolsMap.values());
  },

  /**
   * Get all schools that a user has permissions for via school_permissions
   * @param userId - Keycloak user ID
   * @returns Array of schools
   */
  async getSchoolsByPermissions(userId: string) {
    const schoolPermissions = await prisma.school_permissions.findMany({
      where: {
        userId: userId,
      },
      include: {
        schools: true,
      },
    });

    // Extract unique schools
    const schoolsMap = new Map();
    schoolPermissions.forEach((permission) => {
      const school = permission.schools;
      if (!schoolsMap.has(school.id)) {
        schoolsMap.set(school.id, school);
      }
    });

    return Array.from(schoolsMap.values());
  },

  /**
   * Get all schools that a user has access to via school_admins
   * @param userId - Keycloak user ID
   * @returns Array of schools
   */
  async getSchoolsByAdminRole(userId: string) {
    const schoolAdmins = await prisma.school_admins.findMany({
      where: {
        userId: userId,
      },
      include: {
        schools: true,
      },
    });

    return schoolAdmins.map((admin) => admin.schools);
  },

  /**
   * Get all schools that a user has access to via child assignments
   * @param userId - Keycloak user ID (parentId)
   * @returns Array of schools
   */
  async getSchoolsByParentRole(userId: string) {
    const childAssignments = await prisma.child_class_assignments.findMany({
      where: {
        parentId: userId,
      },
      include: {
        children: {
          include: {
            schools: true,
          },
        },
      },
    });

    // Extract unique schools
    const schoolsMap = new Map();
    childAssignments.forEach((assignment) => {
      const school = assignment.children.schools;
      if (!schoolsMap.has(school.id)) {
        schoolsMap.set(school.id, school);
      }
    });

    return Array.from(schoolsMap.values());
  },
};
