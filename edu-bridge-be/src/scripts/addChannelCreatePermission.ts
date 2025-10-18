import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function addChannelCreatePermission() {
  const userId = "66b4c249-5a57-4dd7-be65-b28fdd09ee25";
  const className = "5A general";

  try {
    // Find the class by name
    const classes = await prisma.classes.findMany({
      where: {
        name: {
          contains: className,
        },
      },
      include: {
        schools: true,
      },
    });

    console.log(`Found ${classes.length} classes matching "${className}"`);

    if (classes.length === 0) {
      console.log(`No class found with name containing "${className}"`);
      return;
    }

    // Show all matching classes
    classes.forEach((cls, index) => {
      console.log(`\n[${index + 1}] Class: ${cls.name}`);
      console.log(`    School: ${cls.schools.name}`);
      console.log(`    Class ID: ${cls.id}`);
    });

    // Use the first matching class (Test School 5A general)
    const classToUpdate = classes[0];
    console.log(`\nUsing class: ${classToUpdate.name} in ${classToUpdate.schools.name}`);

    // Check if user has a class membership
    const membership = await prisma.class_memberships.findFirst({
      where: {
        classId: classToUpdate.id,
        userId,
      },
    });

    if (!membership) {
      console.log(
        `\nUser ${userId} is not a member of class ${classToUpdate.name}`
      );
      console.log("Creating class membership...");

      // Create a new class membership with canCreateGroups permission
      const newMembership = await prisma.class_memberships.create({
        data: {
          id: `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`,
          classId: classToUpdate.id,
          userId,
          role: "teacher", // Assuming teacher role for channel creation
          canCreateGroups: true,
          canPostNews: false,
          canDeleteMessages: false,
        },
      });

      console.log("Created class membership with canCreateGroups permission:");
      console.log(newMembership);
    } else {
      console.log(`\nUser ${userId} is already a member of class ${classToUpdate.name}`);
      console.log(`Current permissions:`);
      console.log(`  - canCreateGroups: ${membership.canCreateGroups}`);
      console.log(`  - canPostNews: ${membership.canPostNews}`);
      console.log(`  - canDeleteMessages: ${membership.canDeleteMessages}`);

      if (membership.canCreateGroups) {
        console.log("\nUser already has canCreateGroups permission!");
        return;
      }

      // Update the membership to add canCreateGroups permission
      const updatedMembership = await prisma.class_memberships.update({
        where: {
          id: membership.id,
        },
        data: {
          canCreateGroups: true,
        },
      });

      console.log("\nUpdated class membership with canCreateGroups permission:");
      console.log(`  - canCreateGroups: ${updatedMembership.canCreateGroups}`);
    }

    console.log("\n✅ Permission added successfully!");
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

addChannelCreatePermission();
