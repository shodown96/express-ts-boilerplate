import { prisma } from "@/services";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
import fs from "fs";

dotenv.config();

export interface Account {
  id: string;
  name: string;
  email: string;
  password?: string;
  createdAt: string;
  updatedAt: string;
}

// replace with actual import from a json file
const items: Account[] = [];

class SeedService {
  static async createPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 10);
  }

  static async seedAccount(item: Account): Promise<void> {
    const existing = await prisma.account.findFirst({ where: { id: item.id } });
    if (existing) return;

    const created = await prisma.account.create({
      data: {
        ...item,
        createdAt: item.createdAt ? new Date(item.createdAt) : undefined,
        updatedAt: item.updatedAt ? new Date(item.updatedAt) : undefined,
      },
    });

    console.log("Created:", created.id);
  }

  static async seedAll(accounts: Account[]): Promise<void> {
    console.log("Seeding accounts...");
    let count = 0;
    for (const item of accounts) {
      await this.seedAccount(item);
      count++;
    }
    console.log(`Done. ${count} accounts processed.`);
  }

  static writeToFile(fileName: string, data: any): void {
    fs.writeFile(fileName, JSON.stringify(data), "utf8", () => {});
  }
}

async function main() {
  await SeedService.seedAll(items);
  await prisma.$disconnect();
}

main().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});