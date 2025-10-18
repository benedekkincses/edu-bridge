import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.$executeRaw`DELETE FROM "_prisma_migrations" WHERE "migration_name" = '20251017_remove_users_add_permissions'`;
  console.log("Deleted broken migration record");
}

main()
  .catch((e) => {
    console.error("Error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
