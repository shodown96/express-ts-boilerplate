import { prisma } from "@/services";
import bcrypt from "bcrypt";

interface ImportedUser {
  id: string;
  name: string;
  email: string;
  password?: string;
  createdAt?: string;
  updatedAt?: string;
}

// replace with actual import from a json file
const users: ImportedUser[] = [];

export async function importUsers(): Promise<void> {
  console.log("[seed:import-users]: Importing users...");

  let count = 0;
  for (const item of users) {
    const existing = await prisma.account.findFirst({ where: { id: item.id } });
    if (existing) continue;

    const created = await prisma.account.create({
      data: {
        ...item,
        email: item.email.toLowerCase(),
        password: item.password ? await bcrypt.hash(item.password, 10) : undefined,
        createdAt: item.createdAt ? new Date(item.createdAt) : undefined,
        updatedAt: item.updatedAt ? new Date(item.updatedAt) : undefined,
      },
    });

    console.log("[seed:import-users]: Created:", created.id);
    count++;
  }

  console.log(`[seed:import-users]: Done. ${count} users imported.`);
}
