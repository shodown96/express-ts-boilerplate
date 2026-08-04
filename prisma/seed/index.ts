import dotenv from "dotenv";
import { prisma } from "@/services";
import { seedAdmin } from "./seed-admin";
import { seedUser } from "./seed-user";
import { importUsers } from "./import-users";

dotenv.config();

async function main() {
  await seedAdmin();
  await seedUser();
  await importUsers();
  await prisma.$disconnect();
}

main().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
