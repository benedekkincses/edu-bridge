import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const USER_ID = "1e0e76ac-0c37-404f-a86c-cdfda9bfc844";

async function main() {
  console.log("Creating new test class with 2 channels...\n");

  // Get a school
  const school = await prisma.schools.findFirst();
  if (!school) {
    console.error("No school found. Please create a school first.");
    return;
  }

  console.log(`Using school: ${school.name} (${school.id})\n`);

  // Create test class
  const now = new Date();
  const classId = `test-class-${Date.now()}`;

  const testClass = await prisma.classes.create({
    data: {
      id: classId,
      schoolId: school.id,
      name: `Test Class ${new Date().toISOString().slice(0, 10)}`,
      type: "Class",
      description: "Test class with 2 channels for testing",
      createdAt: now,
      updatedAt: now,
    },
  });

  console.log(`✅ Created test class: ${testClass.name} (${testClass.id})\n`);

  // Assign user to class with teacher role
  const membership = await prisma.class_memberships.create({
    data: {
      id: `class-membership-${Date.now()}`,
      classId: testClass.id,
      userId: USER_ID,
      role: "teacher",
      canPostNews: true,
      canCreateGroups: true,
      canDeleteMessages: true,
      createdAt: now,
    },
  });

  console.log(`✅ Assigned user ${USER_ID} to class as teacher`);
  console.log(`   Permissions: canPostNews=${membership.canPostNews}, canCreateGroups=${membership.canCreateGroups}\n`);

  // Create 2 channels (groups)
  const channelNames = ["General Discussion", "Homework Help"];

  for (const channelName of channelNames) {
    await new Promise(resolve => setTimeout(resolve, 10)); // Small delay to ensure unique IDs

    const groupId = `group-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

    const channel = await prisma.groups.create({
      data: {
        id: groupId,
        classId: testClass.id,
        name: channelName,
        description: `Test channel: ${channelName}`,
        ownerId: USER_ID,
        createdAt: now,
        updatedAt: now,
      },
    });

    console.log(`✅ Created channel: ${channel.name} (${channel.id})`);

    // Assign user to the channel first
    const groupMembershipId = `group-membership-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    await new Promise(resolve => setTimeout(resolve, 10));

    await prisma.group_memberships.create({
      data: {
        id: groupMembershipId,
        groupId: channel.id,
        userId: USER_ID,
        joinedAt: now,
      },
    });

    console.log(`   Assigned user to channel`);

    // Create thread for the channel with thread_participants
    const threadId = `thread-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    await new Promise(resolve => setTimeout(resolve, 10));

    const thread = await prisma.threads.create({
      data: {
        id: threadId,
        type: "group",
        groupId: channel.id,
        createdAt: now,
        updatedAt: now,
        thread_participants: {
          create: [
            {
              id: `thread-participant-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
              userId: USER_ID,
            },
          ],
        },
      },
    });

    console.log(`   Created thread with user as participant: ${thread.id}\n`);
  }

  console.log("========================================");
  console.log("Summary:");
  console.log(`✅ Class: ${testClass.name} (${testClass.id})`);
  console.log(`✅ User ${USER_ID} added as teacher`);
  console.log(`✅ 2 channels created: ${channelNames.join(", ")}`);
  console.log(`✅ User added to both channels`);
  console.log("========================================");
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
