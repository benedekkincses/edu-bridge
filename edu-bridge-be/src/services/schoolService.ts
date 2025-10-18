import { schoolRepository } from "../repositories/schoolRepository.js";

export const schoolService = {
  /**
   * Get all schools that a user has access to
   * Combines results from multiple sources:
   * - Class memberships (teacher/parent)
   * - School permissions
   * - School admin roles
   * - Parent-child assignments
   *
   * @param userId - Keycloak user ID
   * @returns Array of unique schools with metadata
   */
  async getUserSchools(userId: string) {
    try {
      // Fetch schools from all possible sources in parallel
      const [
        schoolsFromMemberships,
        schoolsFromPermissions,
        schoolsFromAdmin,
        schoolsFromParent,
      ] = await Promise.all([
        schoolRepository.getSchoolsByUserId(userId),
        schoolRepository.getSchoolsByPermissions(userId),
        schoolRepository.getSchoolsByAdminRole(userId),
        schoolRepository.getSchoolsByParentRole(userId),
      ]);

      // Combine all schools and deduplicate by ID
      const schoolsMap = new Map();

      const addSchools = (schools: any[]) => {
        schools.forEach((school) => {
          if (!schoolsMap.has(school.id)) {
            schoolsMap.set(school.id, {
              id: school.id,
              name: school.name,
              address: school.address,
              logo: school.logo,
              createdAt: school.createdAt,
              updatedAt: school.updatedAt,
            });
          }
        });
      };

      addSchools(schoolsFromMemberships);
      addSchools(schoolsFromPermissions);
      addSchools(schoolsFromAdmin);
      addSchools(schoolsFromParent);

      const uniqueSchools = Array.from(schoolsMap.values());

      // Sort schools by name
      uniqueSchools.sort((a, b) => a.name.localeCompare(b.name));

      return uniqueSchools;
    } catch (error) {
      console.error("Error fetching user schools:", error);
      throw new Error("Failed to fetch user schools");
    }
  },
};
