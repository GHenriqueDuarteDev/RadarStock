import "dotenv/config";
import { hash } from "@node-rs/argon2";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({ adapter });

async function main() {
  const email = process.env.ADMIN_SEED_EMAIL ?? "admin@radarstock.local";
  const password = process.env.ADMIN_SEED_PASSWORD ?? "Admin123!";
  const passwordHash = await hash(password);

  await prisma.user.upsert({
    where: { email },
    update: {
      passwordHash,
      firstName: "Admin",
      lastName: "RadarStock",
      role: "admin",
      status: "active",
    },
    create: {
      email,
      passwordHash,
      firstName: "Admin",
      lastName: "RadarStock",
      role: "admin",
      status: "active",
    },
  });

  console.log(`Admin seed ok: ${email}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
