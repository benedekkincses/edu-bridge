import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const userId = "66b4c249-5a57-4dd7-be65-b28fdd09ee25";

async function addNewsPermission() {
  try {
    // Find all schools the user has access to
    const schoolAdmins = await prisma.school_admins.findMany({
      where: { userId },
      include: { schools: true },
    });

    if (schoolAdmins.length === 0) {
      console.log(`User ${userId} is not an admin of any school.`);
      console.log("Looking for schools via class memberships...");

      // Try to find schools via class memberships
      const classMemberships = await prisma.class_memberships.findMany({
        where: { userId },
        include: {
          classes: {
            include: {
              schools: true,
            },
          },
        },
      });

      if (classMemberships.length === 0) {
        console.log(`User ${userId} has no school associations. Cannot add permission.`);
        return;
      }

      // Get unique schools from class memberships
      const schoolsFromClasses = classMemberships.map((cm) => cm.classes.schools);
      const uniqueSchools = Array.from(
        new Map(schoolsFromClasses.map((s) => [s.id, s])).values()
      );

      console.log(`Found ${uniqueSchools.length} school(s) via class memberships:`);
      uniqueSchools.forEach((school) => {
        console.log(`  - ${school.name} (ID: ${school.id})`);
      });

      // Add post_news permission for each school
      for (const school of uniqueSchools) {
        // Check if permission already exists
        const existingPermission = await prisma.school_permissions.findFirst({
          where: {
            userId,
            schoolId: school.id,
            permission: "post_news",
          },
        });

        if (existingPermission) {
          console.log(`  ✓ Permission already exists for ${school.name}`);
          continue;
        }

        // Create the permission
        await prisma.school_permissions.create({
          data: {
            id: `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`,
            userId,
            schoolId: school.id,
            permission: "post_news",
            createdAt: new Date(),
          },
        });

        console.log(`  ✓ Added post_news permission for ${school.name}`);
      }
    } else {
      console.log(`User ${userId} is an admin of ${schoolAdmins.length} school(s):`);
      schoolAdmins.forEach((sa) => {
        console.log(`  - ${sa.schools.name} (ID: ${sa.schools.id})`);
      });

      // Add post_news permission for each school
      for (const schoolAdmin of schoolAdmins) {
        // Check if permission already exists
        const existingPermission = await prisma.school_permissions.findFirst({
          where: {
            userId,
            schoolId: schoolAdmin.schoolId,
            permission: "post_news",
          },
        });

        if (existingPermission) {
          console.log(`  ✓ Permission already exists for ${schoolAdmin.schools.name}`);
          continue;
        }

        // Create the permission
        await prisma.school_permissions.create({
          data: {
            id: `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`,
            userId,
            schoolId: schoolAdmin.schoolId,
            permission: "post_news",
            createdAt: new Date(),
          },
        });

        console.log(`  ✓ Added post_news permission for ${schoolAdmin.schools.name}`);
      }
    }

    console.log("\n✅ Permission setup complete!");
  } catch (error) {
    console.error("Error adding permission:", error);
  } finally {
    await prisma.$disconnect();
  }
}

addNewsPermission();
