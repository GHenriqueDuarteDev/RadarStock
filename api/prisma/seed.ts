import "dotenv/config";
import { hash } from "@node-rs/argon2";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client";
import { alertsService } from "../services/alerts-service";

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

const seedUsers = [
  {
    email: "ana.silva@radarstock.local",
    firstName: "Ana",
    lastName: "Silva",
    role: "manager" as const,
    status: "active" as const,
  },
  {
    email: "bruno.costa@radarstock.local",
    firstName: "Bruno",
    lastName: "Costa",
    role: "operator" as const,
    status: "active" as const,
  },
  {
    email: "carla.dias@radarstock.local",
    firstName: "Carla",
    lastName: "Dias",
    role: "viewer" as const,
    status: "active" as const,
  },
  {
    email: "diego.moura@radarstock.local",
    firstName: "Diego",
    lastName: "Moura",
    role: "operator" as const,
    status: "active" as const,
  },
  {
    email: "elena.rocha@radarstock.local",
    firstName: "Elena",
    lastName: "Rocha",
    role: "manager" as const,
    status: "active" as const,
  },
  {
    email: "felipe.nunes@radarstock.local",
    firstName: "Felipe",
    lastName: "Nunes",
    role: "viewer" as const,
    status: "inactive" as const,
  },
  {
    email: "gabriela.lopes@radarstock.local",
    firstName: "Gabriela",
    lastName: "Lopes",
    role: "operator" as const,
    status: "active" as const,
  },
  {
    email: "henrique.alves@radarstock.local",
    firstName: "Henrique",
    lastName: "Alves",
    role: "admin" as const,
    status: "active" as const,
  },
  {
    email: "isabela.porto@radarstock.local",
    firstName: "Isabela",
    lastName: "Porto",
    role: "viewer" as const,
    status: "active" as const,
  },
  {
    email: "joao.pinto@radarstock.local",
    firstName: "João",
    lastName: "Pinto",
    role: "operator" as const,
    status: "active" as const,
  },
  {
    email: "karina.souza@radarstock.local",
    firstName: "Karina",
    lastName: "Souza",
    role: "manager" as const,
    status: "active" as const,
  },
  {
    email: "lucas.ferreira@radarstock.local",
    firstName: "Lucas",
    lastName: "Ferreira",
    role: "viewer" as const,
    status: "inactive" as const,
  },
  {
    email: "marina.teixeira@radarstock.local",
    firstName: "Marina",
    lastName: "Teixeira",
    role: "operator" as const,
    status: "active" as const,
  },
  {
    email: "nicolas.barros@radarstock.local",
    firstName: "Nicolas",
    lastName: "Barros",
    role: "viewer" as const,
    status: "active" as const,
  },
  {
    email: "olivia.campos@radarstock.local",
    firstName: "Olívia",
    lastName: "Campos",
    role: "operator" as const,
    status: "active" as const,
  },
  {
    email: "paulo.reis@radarstock.local",
    firstName: "Paulo",
    lastName: "Reis",
    role: "manager" as const,
    status: "active" as const,
  },
  {
    email: "quezia.mendes@radarstock.local",
    firstName: "Quezia",
    lastName: "Mendes",
    role: "viewer" as const,
    status: "active" as const,
  },
  {
    email: "rafael.duarte@radarstock.local",
    firstName: "Rafael",
    lastName: "Duarte",
    role: "operator" as const,
    status: "inactive" as const,
  },
  {
    email: "sofia.araujo@radarstock.local",
    firstName: "Sofia",
    lastName: "Araújo",
    role: "viewer" as const,
    status: "active" as const,
  },
  {
    email: "tiago.neves@radarstock.local",
    firstName: "Tiago",
    lastName: "Neves",
    role: "operator" as const,
    status: "active" as const,
  },
] as const;

const seedProducts = [
  {
    name: "Produto demonstração",
    sku: "SKU-DEMO-001",
    barcode: "7891000100101",
    description: "Produto de exemplo para validar o catálogo.",
    categoryName: "Geral",
    cost: 10,
    salePrice: 19.9,
    minStock: 5,
    status: "active" as const,
  },
  {
    name: "Caixa de papelão M",
    sku: "SKU-CX-002",
    barcode: "7891000100102",
    description: "Embalagem média para expedição.",
    categoryName: "Insumos",
    cost: 2.5,
    salePrice: 5.9,
    minStock: 50,
    status: "active" as const,
  },
  {
    name: "Fita adesiva transparente",
    sku: "SKU-FT-003",
    barcode: "7891000100103",
    description: "Rolo 48mm para embalagem.",
    categoryName: "Insumos",
    cost: 3.2,
    salePrice: 7.5,
    minStock: 30,
    status: "active" as const,
  },
  {
    name: "Etiqueta térmica 100x50",
    sku: "SKU-ET-004",
    barcode: "7891000100104",
    description: "Bobina para impressora térmica.",
    categoryName: "Insumos",
    cost: 18,
    salePrice: 32,
    minStock: 10,
    status: "active" as const,
  },
  {
    name: "Palete plástico reforçado",
    sku: "SKU-PL-005",
    barcode: "7891000100105",
    description: "Palete reutilizável para armazenagem.",
    categoryName: "Insumos",
    cost: 85,
    salePrice: 149,
    minStock: 4,
    status: "active" as const,
  },
  {
    name: "Kit ferramentas básicas",
    sku: "SKU-KT-006",
    barcode: "7891000100106",
    description: "Kit com chave e alicate.",
    categoryName: "Acabados",
    cost: 45,
    salePrice: 89.9,
    minStock: 8,
    status: "active" as const,
  },
  {
    name: "Luminária LED bancada",
    sku: "SKU-LD-007",
    barcode: "7891000100107",
    description: "Iluminação para posto de trabalho.",
    categoryName: "Acabados",
    cost: 55,
    salePrice: 119.9,
    minStock: 6,
    status: "active" as const,
  },
  {
    name: "Mouse óptico USB",
    sku: "SKU-MS-008",
    barcode: "7891000100108",
    description: "Periférico padrão de estoque.",
    categoryName: "Acabados",
    cost: 22,
    salePrice: 49.9,
    minStock: 15,
    status: "active" as const,
  },
  {
    name: "Teclado ABNT2",
    sku: "SKU-TC-009",
    barcode: "7891000100109",
    description: "Teclado com layout brasileiro.",
    categoryName: "Acabados",
    cost: 35,
    salePrice: 79.9,
    minStock: 12,
    status: "active" as const,
  },
  {
    name: "Cabo HDMI 2m",
    sku: "SKU-CB-010",
    barcode: "7891000100110",
    description: "Cabo de vídeo HDMI.",
    categoryName: "Geral",
    cost: 12,
    salePrice: 29.9,
    minStock: 20,
    status: "active" as const,
  },
  {
    name: "Adaptador USB-C hub",
    sku: "SKU-AD-011",
    barcode: "7891000100111",
    description: "Hub multiporta USB-C.",
    categoryName: "Acabados",
    cost: 68,
    salePrice: 139.9,
    minStock: 7,
    status: "active" as const,
  },
  {
    name: "Caneta marca-texto amarela",
    sku: "SKU-CN-012",
    barcode: "7891000100112",
    description: "Material de escritório.",
    categoryName: "Insumos",
    cost: 1.2,
    salePrice: 3.5,
    minStock: 100,
    status: "active" as const,
  },
  {
    name: "Resma papel A4",
    sku: "SKU-PP-013",
    barcode: "7891000100113",
    description: "Pacote com 500 folhas.",
    categoryName: "Insumos",
    cost: 18.5,
    salePrice: 32.9,
    minStock: 25,
    status: "active" as const,
  },
  {
    name: "Pasta arquivo suspensa",
    sku: "SKU-PA-014",
    barcode: "7891000100114",
    description: "Pasta para arquivamento.",
    categoryName: "Insumos",
    cost: 2.8,
    salePrice: 6.9,
    minStock: 40,
    status: "inactive" as const,
  },
  {
    name: "Monitor 24 polegadas",
    sku: "SKU-MN-015",
    barcode: "7891000100115",
    description: "Monitor Full HD para escritório.",
    categoryName: "Acabados",
    cost: 520,
    salePrice: 899,
    minStock: 3,
    status: "active" as const,
  },
  {
    name: "Webcam HD",
    sku: "SKU-WC-016",
    barcode: "7891000100116",
    description: "Câmera para videoconferência.",
    categoryName: "Acabados",
    cost: 95,
    salePrice: 189.9,
    minStock: 9,
    status: "active" as const,
  },
  {
    name: "Headset com microfone",
    sku: "SKU-HS-017",
    barcode: "7891000100117",
    description: "Headset USB estéreo.",
    categoryName: "Acabados",
    cost: 75,
    salePrice: 159.9,
    minStock: 10,
    status: "active" as const,
  },
  {
    name: "Extensão elétrica 5m",
    sku: "SKU-EX-018",
    barcode: "7891000100118",
    description: "Extensão com 4 tomadas.",
    categoryName: "Geral",
    cost: 28,
    salePrice: 59.9,
    minStock: 14,
    status: "active" as const,
  },
  {
    name: "Organizador de gaveta",
    sku: "SKU-OG-019",
    barcode: "7891000100119",
    description: "Divisória plástica para gavetas.",
    categoryName: "Geral",
    cost: 9.5,
    salePrice: 24.9,
    minStock: 18,
    status: "inactive" as const,
  },
  {
    name: "Suporte notebook alumínio",
    sku: "SKU-SN-020",
    barcode: "7891000100120",
    description: "Base ergonômica para notebook.",
    categoryName: "Acabados",
    cost: 48,
    salePrice: 99.9,
    minStock: 11,
    status: "active" as const,
  },
] as const;

const seedWarehouses = [
  {
    name: "Galpão Central",
    code: "GAL-001",
    address: "Av. Industrial, 1000",
    capacity: 5000,
    status: "active" as const,
  },
  {
    name: "Galpão Norte",
    code: "GAL-002",
    address: "Rodovia BR-101, km 12",
    capacity: 3200,
    status: "active" as const,
  },
  {
    name: "Galpão Sul",
    code: "GAL-003",
    address: "Rua das Indústrias, 45",
    capacity: 2800,
    status: "active" as const,
  },
  {
    name: "Galpão Leste",
    code: "GAL-004",
    address: "Distrito Logístico, bloco A",
    capacity: 4100,
    status: "active" as const,
  },
  {
    name: "Galpão Oeste",
    code: "GAL-005",
    address: null,
    capacity: 1500,
    status: "active" as const,
  },
  {
    name: "Galpão Frigorífico",
    code: "GAL-006",
    address: "Av. Frio, 200",
    capacity: 900,
    status: "active" as const,
  },
  {
    name: "Galpão Seco A",
    code: "GAL-007",
    address: "Rua Armazém, 10",
    capacity: 2200,
    status: "active" as const,
  },
  {
    name: "Galpão Seco B",
    code: "GAL-008",
    address: "Rua Armazém, 20",
    capacity: 2200,
    status: "inactive" as const,
  },
  {
    name: "Galpão Transitório",
    code: "GAL-009",
    address: "Porto Seco, área 3",
    capacity: null,
    status: "active" as const,
  },
  {
    name: "Galpão Cross-dock",
    code: "GAL-010",
    address: "Terminal de Cargas, box 7",
    capacity: 800,
    status: "active" as const,
  },
  {
    name: "Galpão Químicos",
    code: "GAL-011",
    address: "Zona Especial, setor Q",
    capacity: 600,
    status: "active" as const,
  },
  {
    name: "Galpão Peças",
    code: "GAL-012",
    address: "Rua Oficina, 88",
    capacity: 1100,
    status: "active" as const,
  },
  {
    name: "Galpão Reserva 1",
    code: "GAL-013",
    address: null,
    capacity: 700,
    status: "inactive" as const,
  },
  {
    name: "Galpão Reserva 2",
    code: "GAL-014",
    address: "Av. Backup, 15",
    capacity: 700,
    status: "inactive" as const,
  },
  {
    name: "Galpão Express",
    code: "GAL-015",
    address: "Hub Urbano, piso 1",
    capacity: 450,
    status: "active" as const,
  },
  {
    name: "Galpão Bulk",
    code: "GAL-016",
    address: "Pátio Externo, área B",
    capacity: 8000,
    status: "active" as const,
  },
  {
    name: "Galpão Mezanino",
    code: "GAL-017",
    address: "Av. Industrial, 1000 - mezanino",
    capacity: 350,
    status: "active" as const,
  },
  {
    name: "Galpão Devoluções",
    code: "GAL-018",
    address: "Rua Retorno, 5",
    capacity: 500,
    status: "active" as const,
  },
  {
    name: "Galpão Temporário C",
    code: "GAL-019",
    address: null,
    capacity: null,
    status: "inactive" as const,
  },
  {
    name: "Galpão Exportação",
    code: "GAL-020",
    address: "Zona Portuária, armazém 9",
    capacity: 3600,
    status: "active" as const,
  },
] as const;

async function main() {
  const email = process.env.ADMIN_SEED_EMAIL ?? "admin@radarstock.local";
  const password = process.env.ADMIN_SEED_PASSWORD ?? "Admin123!";
  const passwordHash = await hash(password);
  const memberPasswordHash = await hash("Membro123!");

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

  for (const user of seedUsers) {
    await prisma.user.upsert({
      where: { email: user.email },
      update: {
        passwordHash: memberPasswordHash,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        status: user.status,
      },
      create: {
        email: user.email,
        passwordHash: memberPasswordHash,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        status: user.status,
      },
    });
  }

  console.log(`Users seed ok: ${seedUsers.length} members`);

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

  const alertKinds = [
    "low_stock",
    "out_of_stock",
    "warehouse_near_capacity",
    "warehouse_full",
    "inventory_pending",
    "inventory_discrepancy",
    "inactive_with_stock",
  ] as const;

  for (const kind of alertKinds) {
    await prisma.alertRule.upsert({
      where: { kind },
      update: {},
      create: { kind, enabled: true },
    });
  }

  console.log(`Alert rules seed ok: ${alertKinds.length}`);

  const categories = await prisma.category.findMany({
    where: {
      name: { in: seedCategories.map((category) => category.name) },
    },
  });
  const categoryIdByName = new Map(
    categories.map((category) => [category.name, category.id]),
  );

  for (const product of seedProducts) {
    const categoryId = categoryIdByName.get(product.categoryName);
    if (!categoryId) {
      throw new Error(`Categoria não encontrada: ${product.categoryName}`);
    }

    await prisma.product.upsert({
      where: { sku: product.sku },
      update: {
        name: product.name,
        barcode: product.barcode,
        description: product.description,
        categoryId,
        cost: product.cost,
        salePrice: product.salePrice,
        minStock: product.minStock,
        status: product.status,
      },
      create: {
        name: product.name,
        sku: product.sku,
        barcode: product.barcode,
        description: product.description,
        categoryId,
        cost: product.cost,
        salePrice: product.salePrice,
        minStock: product.minStock,
        status: product.status,
      },
    });
  }

  console.log(`Product seed ok: ${seedProducts.length} products`);

  for (const warehouse of seedWarehouses) {
    await prisma.warehouse.upsert({
      where: { code: warehouse.code },
      update: {
        name: warehouse.name,
        address: warehouse.address,
        capacity: warehouse.capacity,
        status: warehouse.status,
      },
      create: {
        name: warehouse.name,
        code: warehouse.code,
        address: warehouse.address,
        capacity: warehouse.capacity,
        status: warehouse.status,
      },
    });
  }

  console.log(`Warehouse seed ok: ${seedWarehouses.length} warehouses`);

  const adminUser = await prisma.user.findUniqueOrThrow({
    where: { email },
  });

  const products = await prisma.product.findMany({
    where: {
      sku: { in: seedProducts.map((product) => product.sku) },
      status: "active",
    },
    orderBy: { sku: "asc" },
  });

  const warehouses = await prisma.warehouse.findMany({
    where: {
      code: { in: ["GAL-001", "GAL-002", "GAL-003", "GAL-004", "GAL-005"] },
      status: "active",
    },
    orderBy: { code: "asc" },
  });

  if (products.length < 10 || warehouses.length < 3) {
    throw new Error(
      "Seed de movimentações requer ao menos 10 produtos e 3 galpões ativos.",
    );
  }

  await prisma.inventoryCount.deleteMany();
  await prisma.receipt.deleteMany();
  await prisma.sale.deleteMany();
  await prisma.stockMovement.deleteMany();
  await prisma.stockBalance.deleteMany();

  type SeedMovement = {
    type: "in" | "out" | "transfer" | "adjustment";
    productIndex: number;
    quantity: number;
    fromCode?: string;
    toCode?: string;
    note: string;
  };

  const seedMovements: SeedMovement[] = [
    { type: "in", productIndex: 0, quantity: 100, toCode: "GAL-001", note: "Entrada inicial" },
    { type: "in", productIndex: 1, quantity: 80, toCode: "GAL-001", note: "Recebimento de fornecedor" },
    { type: "in", productIndex: 2, quantity: 60, toCode: "GAL-002", note: "Entrada galpão norte" },
    { type: "in", productIndex: 3, quantity: 50, toCode: "GAL-002", note: "Reposição estoque" },
    { type: "in", productIndex: 4, quantity: 40, toCode: "GAL-003", note: "Entrada sul" },
    { type: "in", productIndex: 5, quantity: 70, toCode: "GAL-001", note: "Compra programada" },
    { type: "in", productIndex: 6, quantity: 55, toCode: "GAL-003", note: "Entrada luminárias" },
    { type: "in", productIndex: 7, quantity: 90, toCode: "GAL-004", note: "Entrada periféricos" },
    { type: "transfer", productIndex: 0, quantity: 20, fromCode: "GAL-001", toCode: "GAL-002", note: "Transferência para norte" },
    { type: "transfer", productIndex: 1, quantity: 15, fromCode: "GAL-001", toCode: "GAL-003", note: "Balanceamento sul" },
    { type: "transfer", productIndex: 7, quantity: 10, fromCode: "GAL-004", toCode: "GAL-001", note: "Centralização" },
    { type: "out", productIndex: 0, quantity: 12, fromCode: "GAL-001", note: "Saída para venda" },
    { type: "out", productIndex: 2, quantity: 8, fromCode: "GAL-002", note: "Consumo interno" },
    { type: "out", productIndex: 5, quantity: 5, fromCode: "GAL-001", note: "Baixa operacional" },
    { type: "out", productIndex: 7, quantity: 6, fromCode: "GAL-004", note: "Expedição" },
    { type: "adjustment", productIndex: 3, quantity: 4, toCode: "GAL-002", note: "Ajuste inventário (+)" },
    { type: "adjustment", productIndex: 4, quantity: 2, fromCode: "GAL-003", note: "Ajuste inventário (-)" },
    { type: "in", productIndex: 8, quantity: 45, toCode: "GAL-005", note: "Entrada oeste" },
    { type: "in", productIndex: 9, quantity: 35, toCode: "GAL-001", note: "Entrada cabos" },
    { type: "transfer", productIndex: 8, quantity: 10, fromCode: "GAL-005", toCode: "GAL-001", note: "Transferência oeste→central" },
    { type: "out", productIndex: 9, quantity: 7, fromCode: "GAL-001", note: "Saída cabos" },
    { type: "adjustment", productIndex: 1, quantity: 3, toCode: "GAL-001", note: "Correção contagem" },
  ];

  const warehouseByCode = new Map(
    warehouses.map((warehouse) => [warehouse.code, warehouse]),
  );

  async function applySeedIncrement(
    productId: string,
    warehouseId: string,
    quantity: number,
  ) {
    await prisma.stockBalance.upsert({
      where: {
        productId_warehouseId: { productId, warehouseId },
      },
      create: { productId, warehouseId, quantity },
      update: { quantity: { increment: quantity } },
    });
  }

  async function applySeedDecrement(
    productId: string,
    warehouseId: string,
    quantity: number,
  ) {
    const balance = await prisma.stockBalance.findUnique({
      where: {
        productId_warehouseId: { productId, warehouseId },
      },
    });

    if (!balance || balance.quantity < quantity) {
      throw new Error(
        `Saldo insuficiente no seed para produto ${productId} no galpão ${warehouseId}.`,
      );
    }

    await prisma.stockBalance.update({
      where: { id: balance.id },
      data: { quantity: { decrement: quantity } },
    });
  }

  for (const movement of seedMovements) {
    const product = products[movement.productIndex];
    if (!product) {
      throw new Error(`Produto de índice ${movement.productIndex} não encontrado.`);
    }

    const fromWarehouse = movement.fromCode
      ? warehouseByCode.get(movement.fromCode)
      : undefined;
    const toWarehouse = movement.toCode
      ? warehouseByCode.get(movement.toCode)
      : undefined;

    if (movement.fromCode && !fromWarehouse) {
      throw new Error(`Galpão de origem não encontrado: ${movement.fromCode}`);
    }
    if (movement.toCode && !toWarehouse) {
      throw new Error(`Galpão de destino não encontrado: ${movement.toCode}`);
    }

    if (movement.type === "in" && toWarehouse) {
      await applySeedIncrement(product.id, toWarehouse.id, movement.quantity);
    } else if (movement.type === "out" && fromWarehouse) {
      await applySeedDecrement(product.id, fromWarehouse.id, movement.quantity);
    } else if (
      movement.type === "transfer" &&
      fromWarehouse &&
      toWarehouse
    ) {
      await applySeedDecrement(product.id, fromWarehouse.id, movement.quantity);
      await applySeedIncrement(product.id, toWarehouse.id, movement.quantity);
    } else if (movement.type === "adjustment") {
      if (toWarehouse) {
        await applySeedIncrement(product.id, toWarehouse.id, movement.quantity);
      } else if (fromWarehouse) {
        await applySeedDecrement(
          product.id,
          fromWarehouse.id,
          movement.quantity,
        );
      }
    }

    await prisma.stockMovement.create({
      data: {
        type: movement.type,
        productId: product.id,
        quantity: movement.quantity,
        fromWarehouseId: fromWarehouse?.id ?? null,
        toWarehouseId: toWarehouse?.id ?? null,
        userId: adminUser.id,
        note: movement.note,
        referenceType: "manual",
        referenceId: null,
      },
    });
  }

  console.log(`Movement seed ok: ${seedMovements.length} movements`);

  const saleStockBoosts: Array<{
    productIndex: number;
    warehouseCode: string;
    quantity: number;
  }> = [
    { productIndex: 0, warehouseCode: "GAL-001", quantity: 200 },
    { productIndex: 1, warehouseCode: "GAL-001", quantity: 150 },
    { productIndex: 2, warehouseCode: "GAL-002", quantity: 120 },
    { productIndex: 3, warehouseCode: "GAL-002", quantity: 100 },
    { productIndex: 5, warehouseCode: "GAL-001", quantity: 100 },
    { productIndex: 7, warehouseCode: "GAL-004", quantity: 100 },
  ];

  for (const boost of saleStockBoosts) {
    const product = products[boost.productIndex];
    const warehouse = warehouseByCode.get(boost.warehouseCode);
    if (!product || !warehouse) {
      throw new Error("Falha ao preparar estoque para seed de vendas.");
    }

    await applySeedIncrement(product.id, warehouse.id, boost.quantity);
    await prisma.stockMovement.create({
      data: {
        type: "in",
        productId: product.id,
        quantity: boost.quantity,
        fromWarehouseId: null,
        toWarehouseId: warehouse.id,
        userId: adminUser.id,
        note: "Entrada preparatória para seed de vendas",
        referenceType: "manual",
        referenceId: null,
      },
    });
  }

  type SeedSale = {
    code: string;
    warehouseCode: string;
    cancel: boolean;
    items: Array<{ productIndex: number; quantity: number; unitPrice: number }>;
  };

  const productsByWarehouse: Record<string, number[]> = {
    "GAL-001": [0, 1, 5],
    "GAL-002": [2, 3],
    "GAL-004": [7],
  };

  const seedSales: SeedSale[] = Array.from({ length: 22 }, (_, index) => {
    const n = index + 1;
    const code = `VEN-${String(n).padStart(3, "0")}`;
    const warehouseCodes = ["GAL-001", "GAL-002", "GAL-004"] as const;
    const warehouseCode = warehouseCodes[index % warehouseCodes.length];
    const availableProducts = productsByWarehouse[warehouseCode] ?? [0];
    const productIndex = availableProducts[index % availableProducts.length]!;
    const secondProductIndex =
      availableProducts[(index + 1) % availableProducts.length]!;

    return {
      code,
      warehouseCode,
      cancel: n > 18,
      items: [
        {
          productIndex,
          quantity: 2 + (index % 3),
          unitPrice: 10 + index,
        },
        ...(n % 2 === 0 && availableProducts.length > 1
          ? [
              {
                productIndex: secondProductIndex,
                quantity: 1,
                unitPrice: 15 + index,
              },
            ]
          : []),
      ],
    };
  });

  for (const [saleIndex, seedSale] of seedSales.entries()) {
    const warehouse = warehouseByCode.get(seedSale.warehouseCode);
    if (!warehouse) {
      throw new Error(`Galpão não encontrado para venda ${seedSale.code}`);
    }

    const items = seedSale.items.map((item) => {
      const product = products[item.productIndex];
      if (!product) {
        throw new Error(
          `Produto índice ${item.productIndex} não encontrado para ${seedSale.code}`,
        );
      }
      return {
        product,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
      };
    });

    const totalAmount = items.reduce(
      (sum, item) => sum + item.quantity * item.unitPrice,
      0,
    );

    for (const item of items) {
      await applySeedDecrement(item.product.id, warehouse.id, item.quantity);
    }

    const sale = await prisma.sale.create({
      data: {
        code: seedSale.code,
        status: "confirmed",
        warehouseId: warehouse.id,
        totalAmount,
        soldAt: new Date(2026, 0, Math.min(saleIndex + 1, 28)),
        createdById: adminUser.id,
        notes: `Seed ${seedSale.code}`,
        items: {
          create: items.map((item) => ({
            productId: item.product.id,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
          })),
        },
      },
      include: { items: true },
    });

    for (const item of sale.items) {
      await prisma.stockMovement.create({
        data: {
          type: "out",
          productId: item.productId,
          quantity: item.quantity,
          fromWarehouseId: warehouse.id,
          toWarehouseId: null,
          userId: adminUser.id,
          note: `Venda ${sale.code}`,
          referenceType: "sale",
          referenceId: sale.id,
        },
      });
    }

    if (seedSale.cancel) {
      await prisma.sale.update({
        where: { id: sale.id },
        data: { status: "cancelled" },
      });

      for (const item of sale.items) {
        await applySeedIncrement(item.productId, warehouse.id, item.quantity);
        await prisma.stockMovement.create({
          data: {
            type: "in",
            productId: item.productId,
            quantity: item.quantity,
            fromWarehouseId: null,
            toWarehouseId: warehouse.id,
            userId: adminUser.id,
            note: `Estorno venda ${sale.code}`,
            referenceType: "sale",
            referenceId: sale.id,
          },
        });
      }
    }
  }

  console.log(`Sale seed ok: ${seedSales.length} sales`);

  type SeedReceipt = {
    code: string;
    warehouseCode: string;
    supplierName: string;
    cancel: boolean;
    items: Array<{ productIndex: number; quantity: number; unitCost: number }>;
  };

  const receiptProductsByWarehouse: Record<string, number[]> = {
    "GAL-001": [0, 1, 5],
    "GAL-002": [2, 3],
    "GAL-003": [4, 6],
    "GAL-004": [7],
  };

  const seedReceipts: SeedReceipt[] = Array.from({ length: 22 }, (_, index) => {
    const n = index + 1;
    const code = `REC-${String(n).padStart(3, "0")}`;
    const warehouseCodes = ["GAL-001", "GAL-002", "GAL-003", "GAL-004"] as const;
    const warehouseCode = warehouseCodes[index % warehouseCodes.length];
    const availableProducts = receiptProductsByWarehouse[warehouseCode] ?? [0];
    const productIndex = availableProducts[index % availableProducts.length]!;
    const secondProductIndex =
      availableProducts[(index + 1) % availableProducts.length]!;

    return {
      code,
      warehouseCode,
      supplierName: `Fornecedor ${String.fromCharCode(65 + (index % 5))}`,
      cancel: n > 18,
      items: [
        {
          productIndex,
          quantity: 5 + (index % 4),
          unitCost: Number((1.5 + index * 0.25).toFixed(2)),
        },
        ...(n % 2 === 0 && availableProducts.length > 1
          ? [
              {
                productIndex: secondProductIndex,
                quantity: 2,
                unitCost: Number((2 + index * 0.1).toFixed(2)),
              },
            ]
          : []),
      ],
    };
  });

  for (const [receiptIndex, seedReceipt] of seedReceipts.entries()) {
    const warehouse = warehouseByCode.get(seedReceipt.warehouseCode);
    if (!warehouse) {
      throw new Error(
        `Galpão não encontrado para recebimento ${seedReceipt.code}`,
      );
    }

    const items = seedReceipt.items.map((item) => {
      const product = products[item.productIndex];
      if (!product) {
        throw new Error(
          `Produto índice ${item.productIndex} não encontrado para ${seedReceipt.code}`,
        );
      }
      return {
        product,
        quantity: item.quantity,
        unitCost: item.unitCost,
      };
    });

    for (const item of items) {
      await applySeedIncrement(item.product.id, warehouse.id, item.quantity);
    }

    const receipt = await prisma.receipt.create({
      data: {
        code: seedReceipt.code,
        status: "confirmed",
        warehouseId: warehouse.id,
        supplierName: seedReceipt.supplierName,
        receivedAt: new Date(2026, 1, Math.min(receiptIndex + 1, 28)),
        createdById: adminUser.id,
        notes: `Seed ${seedReceipt.code}`,
        items: {
          create: items.map((item) => ({
            productId: item.product.id,
            quantity: item.quantity,
            unitCost: item.unitCost,
          })),
        },
      },
      include: { items: true },
    });

    for (const item of receipt.items) {
      await prisma.stockMovement.create({
        data: {
          type: "in",
          productId: item.productId,
          quantity: item.quantity,
          fromWarehouseId: null,
          toWarehouseId: warehouse.id,
          userId: adminUser.id,
          note: `Recebimento ${receipt.code}`,
          referenceType: "receipt",
          referenceId: receipt.id,
        },
      });
    }

    if (seedReceipt.cancel) {
      await prisma.receipt.update({
        where: { id: receipt.id },
        data: { status: "cancelled" },
      });

      for (const item of receipt.items) {
        await applySeedDecrement(item.productId, warehouse.id, item.quantity);
        await prisma.stockMovement.create({
          data: {
            type: "out",
            productId: item.productId,
            quantity: item.quantity,
            fromWarehouseId: warehouse.id,
            toWarehouseId: null,
            userId: adminUser.id,
            note: `Estorno recebimento ${receipt.code}`,
            referenceType: "receipt",
            referenceId: receipt.id,
          },
        });
      }
    }
  }

  console.log(`Receipt seed ok: ${seedReceipts.length} receipts`);

  type SeedInventoryKind =
    | "confirmed"
    | "draft"
    | "cancelledDraft"
    | "cancelledConfirmed";

  async function setSeedBalanceAbsolute(
    productId: string,
    warehouseId: string,
    quantity: number,
  ) {
    await prisma.stockBalance.upsert({
      where: {
        productId_warehouseId: { productId, warehouseId },
      },
      create: { productId, warehouseId, quantity },
      update: { quantity },
    });
  }

  const inventoryWarehouseCodes = [
    "GAL-001",
    "GAL-002",
    "GAL-003",
    "GAL-004",
  ] as const;

  let inventorySeedCount = 0;

  for (let index = 0; index < 22; index += 1) {
    const n = index + 1;
    const code = `INV-${String(n).padStart(3, "0")}`;
    const warehouseCode =
      inventoryWarehouseCodes[index % inventoryWarehouseCodes.length]!;
    const warehouse = warehouseByCode.get(warehouseCode);
    if (!warehouse) {
      throw new Error(`Galpão não encontrado para inventário ${code}`);
    }

    const balances = await prisma.stockBalance.findMany({
      where: {
        warehouseId: warehouse.id,
        quantity: { gte: 0 },
      },
      take: 3,
      orderBy: { productId: "asc" },
    });

    if (balances.length === 0) {
      continue;
    }

    let kind: SeedInventoryKind = "confirmed";
    if (n >= 15 && n <= 18) {
      kind = "draft";
    } else if (n === 19 || n === 20) {
      kind = "cancelledDraft";
    } else if (n === 21 || n === 22) {
      kind = "cancelledConfirmed";
    }

    const items = balances.map((balance, itemIndex) => {
      const expectedQty = balance.quantity;
      let countedQty = 0;
      if (kind === "draft" || kind === "cancelledDraft") {
        countedQty = itemIndex === 0 ? Math.max(expectedQty - 1, 1) : 0;
      } else {
        countedQty =
          itemIndex === 0
            ? Math.max(expectedQty - 1, 1)
            : itemIndex === 1
              ? 0
              : expectedQty;
      }
      return {
        productId: balance.productId,
        expectedQty,
        countedQty,
      };
    });

    const initialStatus =
      kind === "draft"
        ? "draft"
        : kind === "cancelledDraft"
          ? "cancelled"
          : "confirmed";

    const inventory = await prisma.inventoryCount.create({
      data: {
        code,
        status: initialStatus,
        warehouseId: warehouse.id,
        countedAt: new Date(2026, 2, Math.min(index + 1, 28)),
        createdById: adminUser.id,
        notes: `Seed ${code}`,
        items: {
          create: items,
        },
      },
      include: { items: true },
    });

    inventorySeedCount += 1;

    if (kind === "confirmed" || kind === "cancelledConfirmed") {
      for (const item of inventory.items) {
        if (item.countedQty === 0) {
          continue;
        }

        await setSeedBalanceAbsolute(
          item.productId,
          warehouse.id,
          item.countedQty,
        );

        const delta = item.countedQty - item.expectedQty;
        if (delta !== 0) {
          await prisma.stockMovement.create({
            data: {
              type: "adjustment",
              productId: item.productId,
              quantity: Math.abs(delta),
              fromWarehouseId: delta < 0 ? warehouse.id : null,
              toWarehouseId: delta > 0 ? warehouse.id : null,
              userId: adminUser.id,
              note: `Inventário ${inventory.code}`,
              referenceType: "inventory",
              referenceId: inventory.id,
            },
          });
        }
      }
    }

    if (kind === "cancelledConfirmed") {
      await prisma.inventoryCount.update({
        where: { id: inventory.id },
        data: { status: "cancelled" },
      });

      for (const item of inventory.items) {
        if (item.countedQty === 0) {
          continue;
        }

        await setSeedBalanceAbsolute(
          item.productId,
          warehouse.id,
          item.expectedQty,
        );

        const reverseDelta = item.expectedQty - item.countedQty;
        if (reverseDelta !== 0) {
          await prisma.stockMovement.create({
            data: {
              type: "adjustment",
              productId: item.productId,
              quantity: Math.abs(reverseDelta),
              fromWarehouseId: reverseDelta < 0 ? warehouse.id : null,
              toWarehouseId: reverseDelta > 0 ? warehouse.id : null,
              userId: adminUser.id,
              note: `Estorno inventário ${inventory.code}`,
              referenceType: "inventory",
              referenceId: inventory.id,
            },
          });
        }
      }
    }
  }

  console.log(`Inventory seed ok: ${inventorySeedCount} inventory counts`);

  await alertsService.reevaluateAll();
  const openAlerts = await prisma.alert.count({ where: { status: "open" } });
  console.log(`Alerts seed ok: ${openAlerts} open alerts`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
