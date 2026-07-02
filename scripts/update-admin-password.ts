import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const email = "you@cdvrswrld.com";
  const newPassword = "1111";

  const passwordHash = await bcrypt.hash(newPassword, 12);

  await prisma.admin.update({
    where: { email },
    data: { passwordHash },
  });

  console.log("Admin password updated for", email);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
