import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Fixing thread participants for all group threads...\n");

  // Find all groups with threads
  const groups = await prisma.groups.findMany({
    include: {
      threads: true,
      group_memberships: true,
    },
  });

  console.log(`Found ${groups.length} groups\n`);

  for (const group of groups) {
    if (!group.threads) {
      console.log(`⚠️  Group "${group.name}" has no thread, skipping...`);
      continue;
    }

    console.log(`Processing group: ${group.name} (${group.id})`);
    console.log(`  Thread ID: ${group.threads.id}`);
    console.log(`  Group members: ${group.group_memberships.length}`);

    // Get existing thread participants
    const existingParticipants = await prisma.thread_participants.findMany({
      where: {
        threadId: group.threads.id,
      },
    });

    console.log(`  Existing thread participants: ${existingParticipants.length}`);

    // Get member IDs who are not yet participants
    const existingParticipantUserIds = new Set(
      existingParticipants.map((p) => p.userId)
    );
    const missingMembers = group.group_memberships.filter(
      (m) => !existingParticipantUserIds.has(m.userId)
    );

    if (missingMembers.length === 0) {
      console.log(`  ✅ All members are already thread participants\n`);
      continue;
    }

    console.log(`  Adding ${missingMembers.length} missing participants...`);

    // Add missing participants
    for (const member of missingMembers) {
      await prisma.thread_participants.create({
        data: {
          id: `thread-participant-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
          threadId: group.threads.id,
          userId: member.userId,
        },
      });
      console.log(`    ✅ Added user ${member.userId} to thread participants`);
      await new Promise(resolve => setTimeout(resolve, 10)); // Small delay for unique IDs
    }

    console.log(`  ✅ Fixed thread participants for "${group.name}"\n`);
  }

  console.log("========================================");
  console.log("✅ All thread participants have been fixed!");
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
