import { prisma } from "@/services";
import bcrypt from "bcrypt";

export async function seedUser(): Promise<void> {
  const email = process.env.USER_EMAIL;
  const password = process.env.USER_PASSWORD;

  if (!email || !password) {
    console.log("[seed:user]: USER_EMAIL/USER_PASSWORD not set, skipping.");
    return;
  }

  const existing = await prisma.account.findFirst({ where: { email: email.toLowerCase() } });
  if (existing) {
    console.log("[seed:user]: User already exists, skipping.");
    return;
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await prisma.account.create({
    data: {
      name: process.env.USER_NAME || "Test User",
      email: email.toLowerCase(),
      password: hashedPassword,
    },
  });

  console.log("[seed:user]: Created user:", user.id);
}
