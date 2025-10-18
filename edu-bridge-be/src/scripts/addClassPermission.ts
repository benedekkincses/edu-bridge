import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function addClassPermission() {
  const userId = "1e0e76ac-0c37-404f-a86c-cdfda9bfc844";
  const className = "5A general";

  try {
    // First, check if schools exist
    const schools = await prisma.schools.findMany();
    console.log(`Found ${schools.length} schools`);

    if (schools.length === 0) {
      console.log("No schools found in database. Creating a school first...");
      const school = await prisma.schools.create({
        data: {
          id: `${Date.now()}-school`,
          name: "Default School",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      });
      console.log("Created school:", school);
      schools.push(school);
    }

    const schoolId = schools[0].id;
    console.log(`Using school: ${schools[0].name} (${schoolId})`);

    // First, list all classes
    const allClasses = await prisma.classes.findMany({
      select: {
        id: true,
        name: true,
        type: true,
      },
    });

    console.log(`\nTotal classes in database: ${allClasses.length}`);
    if (allClasses.length > 0) {
      console.log("All classes:", JSON.stringify(allClasses, null, 2));
    }

    // Find the class
    let classRecord = await prisma.classes.findFirst({
      where: {
        name: {
          contains: className,
        },
      },
    });

    if (!classRecord) {
      console.log(`\nClass "${className}" not found. Creating it...`);

      classRecord = await prisma.classes.create({
        data: {
          id: `${Date.now()}-class`,
          schoolId,
          name: className,
          type: "Class",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      });

      console.log("Created class:", classRecord);
    } else {
      console.log(`\nFound existing class:`, classRecord);
    }

    // Check if permission already exists
    const existingPermission = await prisma.class_permissions.findFirst({
      where: {
        userId,
        classId: classRecord.id,
        permission: "write",
      },
    });

    if (existingPermission) {
      console.log("Permission already exists:", existingPermission);
      return;
    }

    // Add write permission
    const permission = await prisma.class_permissions.create({
      data: {
        id: `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`,
        userId,
        classId: classRecord.id,
        permission: "write",
      },
    });

    console.log("Permission added successfully:", permission);
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

addClassPermission();
