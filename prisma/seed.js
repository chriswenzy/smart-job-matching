import { hashPassword } from "../src/lib/auth/auth.js";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Start seeding...");

  // Create admin user
  const adminPassword = await hashPassword("admin123");
  const admin = await prisma.user.upsert({
    where: { email: "admin@smartjobmatch.com" },
    update: {},
    create: {
      email: "admin@smartjobmatch.com",
      passwordHash: adminPassword,
      userType: "ADMIN",
      fullName: "System Administrator",
      // emailVerified: true,
    },
  });

  console.log("Created admin user:", admin.email);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
