import { AccountRole } from "@prisma/client";
import { prisma } from "@/services";
import bcrypt from "bcrypt";

export async function seedAdmin(): Promise<void> {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;

  if (!email || !password) {
    console.log("[seed:admin]: ADMIN_EMAIL/ADMIN_PASSWORD not set, skipping.");
    return;
  }

  const existing = await prisma.account.findFirst({ where: { email: email.toLowerCase() } });
  if (existing) {
    console.log("[seed:admin]: Admin already exists, skipping.");
    return;
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const admin = await prisma.account.create({
    data: {
      name: process.env.ADMIN_NAME || "Admin",
      email: email.toLowerCase(),
      password: hashedPassword,
      role: AccountRole.admin,
    },
  });

  console.log("[seed:admin]: Created admin:", admin.id);
}
