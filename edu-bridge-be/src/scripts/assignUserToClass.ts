import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const USER_ID = "1e0e76ac-0c37-404f-a86c-cdfda9bfc844"; // Your test user

async function main() {
  console.log(`Assigning user ${USER_ID} to test class...`);

  // Find the test class
  const testClass = await prisma.classes.findFirst({
    where: {
      name: {
        startsWith: "Test Class",
      },
    },
  });

  if (!testClass) {
    console.error("Test class not found. Please create it first.");
    return;
  }

  console.log(`Found test class: ${testClass.name} (${testClass.id})`);

  // Check if user is already assigned
  const existing = await prisma.class_memberships.findFirst({
    where: {
      classId: testClass.id,
      userId: USER_ID,
    },
  });

  if (existing) {
    console.log("✅ User is already assigned to this class.");
    return;
  }

  // Assign user to class with teacher role
  const now = new Date();
  const membership = await prisma.class_memberships.create({
    data: {
      id: `class-membership-${Date.now()}`,
      classId: testClass.id,
      userId: USER_ID,
      role: "teacher", // Can also be "parent"
      canPostNews: true,
      canCreateGroups: true,
      canDeleteMessages: true,
      createdAt: now,
    },
  });

  console.log(`✅ Assigned user to class: ${testClass.name}`);
  console.log(`Permissions: canPostNews=${membership.canPostNews}, canCreateGroups=${membership.canCreateGroups}`);
  console.log(`\nUser should now see this class in their Classes page.`);
  console.log(`Since there are no channels yet, only the news feed should be shown.`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
