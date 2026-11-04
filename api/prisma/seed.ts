import "dotenv/config";
import { hash } from "@node-rs/argon2";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({ adapter });

const seedCategories = [
  {
    name: "Geral",
    description: "Categoria padrão para produtos diversos.",
  },
  {
    name: "Insumos",
    description: "Materiais e insumos de consumo.",
  },
  {
    name: "Acabados",
    description: "Produtos acabados para venda.",
  },
] as const;

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

  for (const category of seedCategories) {
    await prisma.category.upsert({
      where: { name: category.name },
      update: {
        description: category.description,
      },
      create: {
        name: category.name,
        description: category.description,
      },
    });
  }

  console.log("Category seed ok");

  const geral = await prisma.category.findUniqueOrThrow({
    where: { name: "Geral" },
  });

  await prisma.product.upsert({
    where: { sku: "SKU-DEMO-001" },
    update: {
      name: "Produto demonstração",
      description: "Produto de exemplo para validar o catálogo.",
      categoryId: geral.id,
      cost: 10,
      salePrice: 19.9,
      minStock: 5,
      status: "active",
    },
    create: {
      name: "Produto demonstração",
      sku: "SKU-DEMO-001",
      barcode: "7891000100101",
      description: "Produto de exemplo para validar o catálogo.",
      categoryId: geral.id,
      cost: 10,
      salePrice: 19.9,
      minStock: 5,
      status: "active",
    },
  });

  console.log("Product seed ok: SKU-DEMO-001");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
