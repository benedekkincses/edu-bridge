import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const USER_ID = "1e0e76ac-0c37-404f-a86c-cdfda9bfc844"; // Your test user

async function main() {
  console.log("Creating test channel and assigning user...");

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

  // Create a test channel (group)
  const now = new Date();
  const groupId = `test-group-${Date.now()}`;

  const testGroup = await prisma.groups.create({
    data: {
      id: groupId,
      classId: testClass.id,
      name: "General Discussion",
      description: "Test channel for general class discussions",
      ownerId: USER_ID,
      createdAt: now,
      updatedAt: now,
    },
  });

  console.log(`✅ Created test channel: ${testGroup.name} (${testGroup.id})`);

  // Assign user to the group
  const membershipId = `group-membership-${Date.now()}`;
  await prisma.group_memberships.create({
    data: {
      id: membershipId,
      groupId: testGroup.id,
      userId: USER_ID,
      joinedAt: now,
    },
  });

  console.log(`✅ Assigned user to channel: ${testGroup.name}`);
  console.log(`\nUser should now see this channel in their class and be able to send messages.`);
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
