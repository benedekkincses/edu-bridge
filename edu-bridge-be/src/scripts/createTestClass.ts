import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Creating test class...");

  // Get a school
  const school = await prisma.schools.findFirst();
  if (!school) {
    console.error("No school found. Please create a school first.");
    return;
  }

  console.log(`Using school: ${school.name} (${school.id})`);

  // Create test class
  const now = new Date();
  const classId = `test-class-${Date.now()}`;

  const testClass = await prisma.classes.create({
    data: {
      id: classId,
      schoolId: school.id,
      name: "Test Class 5A",
      type: "Class",
      description: "Test class for testing access control",
      createdAt: now,
      updatedAt: now,
    },
  });

  console.log(`✅ Created test class: ${testClass.name} (${testClass.id})`);
  console.log(`\nNote: User is NOT assigned to this class yet.`);
  console.log(`The user should see "no available classes" when they open the Classes page.`);
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
