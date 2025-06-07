import { PrismaClient } from "@prisma/client";
import { hash } from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  console.log("Start seeding...");

  // Create Customer Support User if it doesn't exist
  const supportUserEmail = "support@mashughuli.com";
  let supportUser = await prisma.user.findUnique({
    where: { email: supportUserEmail },
  });

  if (!supportUser) {
    const hashedPassword = await hash("SupportPassword123!", 10); // Use a strong, random password in production
    supportUser = await prisma.user.create({
      data: {
        email: supportUserEmail,
        fullName: "Mashughuli Support",
        primaryRole: "admin",
        status: "active",
        password: hashedPassword,
        bio: "Official support account for Mashughuli platform.",
      },
    });
    console.log("Created customer support user.");
  } else {
    console.log("Customer support user already exists.");
  }

  console.log("Seeding finished.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
