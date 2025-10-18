import { PrismaClient } from "@prisma/client";
import { v4 as uuidv4 } from "uuid";

const prisma = new PrismaClient();

async function main() {
  const teacherIds = [
    "92f7e6d1-af82-4efe-96d8-c3d8fbcbcc53",
    "1e0e76ac-0c37-404f-a86c-cdfda9bfc844",
  ];

  // Create a test school
  const school = await prisma.schools.create({
    data: {
      id: uuidv4(),
      name: "Test School",
      address: "123 Education Street, Learning City",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });

  console.log("Created school:", school);

  // Add teachers to school with read permission
  for (const teacherId of teacherIds) {
    const permission = await prisma.school_permissions.create({
      data: {
        id: uuidv4(),
        userId: teacherId,
        schoolId: school.id,
        permission: "read",
        createdAt: new Date(),
      },
    });

    console.log(`Added user ${teacherId} to school with read-only permissions:`, permission);
  }

  console.log("\n✅ Successfully created school and added teachers!");
  console.log(`School ID: ${school.id}`);
  console.log(`School Name: ${school.name}`);
  console.log(`Teachers added: ${teacherIds.length}`);
  console.log(`Permissions: read`);
}

main()
  .catch((e) => {
    console.error("Error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
