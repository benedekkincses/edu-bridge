import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function removeChannelCreatePermission() {
  const userId = "ef3d23d6-384a-4242-b7e1-3cd0f26bb9bd";
  const className = "5A general";

  try {
    // Find the class by name
    const classRecord = await prisma.classes.findFirst({
      where: {
        name: {
          contains: className,
        },
      },
      include: {
        schools: true,
      },
    });

    if (!classRecord) {
      console.log(`No class found with name containing "${className}"`);
      return;
    }

    console.log(`Found class: ${classRecord.name} in ${classRecord.schools.name}`);

    // Check if user has a class membership
    const membership = await prisma.class_memberships.findFirst({
      where: {
        classId: classRecord.id,
        userId,
      },
    });

    if (!membership) {
      console.log(`\nUser ${userId} is not a member of class ${classRecord.name}`);
      return;
    }

    console.log(`\nUser ${userId} is a member of class ${classRecord.name}`);
    console.log(`Current permissions:`);
    console.log(`  - canCreateGroups: ${membership.canCreateGroups}`);
    console.log(`  - canPostNews: ${membership.canPostNews}`);
    console.log(`  - canDeleteMessages: ${membership.canDeleteMessages}`);

    if (!membership.canCreateGroups) {
      console.log("\nUser already doesn't have canCreateGroups permission!");
      return;
    }

    // Update the membership to remove canCreateGroups permission
    const updatedMembership = await prisma.class_memberships.update({
      where: {
        id: membership.id,
      },
      data: {
        canCreateGroups: false,
      },
    });

    console.log("\n✅ Updated class membership - removed canCreateGroups permission:");
    console.log(`  - canCreateGroups: ${updatedMembership.canCreateGroups}`);
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

removeChannelCreatePermission();
