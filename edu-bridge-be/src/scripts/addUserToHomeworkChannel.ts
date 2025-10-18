import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const USER_ID = "92f7e6d1-af82-4efe-96d8-c3d8fbcbcc53";

async function main() {
  console.log(`Adding user ${USER_ID} to Homework Help channel...\n`);

  // Find the test class created today
  const testClass = await prisma.classes.findFirst({
    where: {
      name: "Test Class 2025-10-18",
    },
    include: {
      groups: {
        where: {
          name: "Homework Help",
        },
        include: {
          threads: true,
        },
      },
    },
  });

  if (!testClass) {
    console.error("Test class not found!");
    return;
  }

  console.log(`Found class: ${testClass.name} (${testClass.id})`);

  if (testClass.groups.length === 0) {
    console.error("Homework Help channel not found in this class!");
    return;
  }

  const homeworkChannel = testClass.groups[0];
  console.log(`Found channel: ${homeworkChannel.name} (${homeworkChannel.id})\n`);

  // Check if user is already a member of the class
  const existingClassMembership = await prisma.class_memberships.findFirst({
    where: {
      classId: testClass.id,
      userId: USER_ID,
    },
  });

  if (!existingClassMembership) {
    // Add user to class with parent role
    const now = new Date();
    await prisma.class_memberships.create({
      data: {
        id: `class-membership-${Date.now()}`,
        classId: testClass.id,
        userId: USER_ID,
        role: "parent",
        canPostNews: false,
        canCreateGroups: false,
        canDeleteMessages: false,
        createdAt: now,
      },
    });
    console.log(`✅ Added user to class: ${testClass.name} (as parent)`);
  } else {
    console.log(`✅ User already member of class: ${testClass.name}`);
  }

  // Check if user is already a member of the channel
  const existingGroupMembership = await prisma.group_memberships.findFirst({
    where: {
      groupId: homeworkChannel.id,
      userId: USER_ID,
    },
  });

  if (!existingGroupMembership) {
    // Add user to the Homework Help channel
    const now = new Date();
    await prisma.group_memberships.create({
      data: {
        id: `group-membership-${Date.now()}`,
        groupId: homeworkChannel.id,
        userId: USER_ID,
        joinedAt: now,
      },
    });
    console.log(`✅ Added user to channel: ${homeworkChannel.name}`);
  } else {
    console.log(`✅ User already member of channel: ${homeworkChannel.name}`);
  }

  // Add user to thread participants if there's a thread
  if (homeworkChannel.threads) {
    const existingThreadParticipant = await prisma.thread_participants.findFirst({
      where: {
        threadId: homeworkChannel.threads.id,
        userId: USER_ID,
      },
    });

    if (!existingThreadParticipant) {
      await prisma.thread_participants.create({
        data: {
          id: `thread-participant-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
          threadId: homeworkChannel.threads.id,
          userId: USER_ID,
        },
      });
      console.log(`✅ Added user to thread participants`);
    } else {
      console.log(`✅ User already thread participant`);
    }
  }

  console.log("\n========================================");
  console.log("Summary:");
  console.log(`✅ User ${USER_ID} added to class: ${testClass.name}`);
  console.log(`✅ User added ONLY to channel: ${homeworkChannel.name}`);
  console.log(`✅ User NOT added to: General Discussion`);
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
