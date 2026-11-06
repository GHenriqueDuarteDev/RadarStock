import { hash } from "@node-rs/argon2";
import {
  PAGE_SIZE,
  type AdminCreateUser,
  type UserInput,
  type UserRole,
} from "@radarstock/contracts";
import { prisma } from "../src/db";

const publicUserSelect = {
  id: true,
  email: true,
  firstName: true,
  lastName: true,
  role: true,
  status: true,
  createdAt: true,
  updatedAt: true,
} as const;

async function registerUser(body: UserInput) {
  const passwordHash = await hash(body.password);

  try {
    const user = await prisma.user.create({
      data: {
        email: body.email,
        passwordHash,
        firstName: body.firstName,
        lastName: body.lastName,
        role: "viewer",
        status: "active",
      },
    });

    return {
      status: 201,
      data: {
        id: user.id,
        email: user.email,
      },
    };
  } catch {
    return {
      status: 409,
      data: {
        message: "Este E-mail ja esta cadastrado.",
      },
    };
  }
}

async function createByAdmin(input: AdminCreateUser) {
  const passwordHash = await hash(input.password);

  try {
    const user = await prisma.user.create({
      data: {
        email: input.email,
        passwordHash,
        firstName: input.firstName,
        lastName: input.lastName,
        role: input.role,
        status: "active",
      },
      select: publicUserSelect,
    });

    return { status: 201, data: user };
  } catch {
    return {
      status: 409,
      data: {
        message: "Este E-mail ja esta cadastrado.",
      },
    };
  }
}

async function listUsers(page: number, name?: string) {
  const skip = (page - 1) * PAGE_SIZE;

  const where = name
    ? {
        OR: [
          { firstName: { contains: name, mode: "insensitive" as const } },
          { lastName: { contains: name, mode: "insensitive" as const } },
        ],
      }
    : {};

  const [items, total] = await prisma.$transaction([
    prisma.user.findMany({
      where,
      select: publicUserSelect,
      orderBy: { createdAt: "desc" },
      skip,
      take: PAGE_SIZE,
    }),
    prisma.user.count({ where }),
  ]);

  return {
    status: 200,
    data: { items, total, page, pageSize: PAGE_SIZE },
  };
}

async function getSummary() {
  const [total, active, inactive, admins] = await prisma.$transaction([
    prisma.user.count(),
    prisma.user.count({ where: { status: "active" } }),
    prisma.user.count({ where: { status: "inactive" } }),
    prisma.user.count({ where: { role: "admin" } }),
  ]);

  return {
    status: 200,
    data: { total, active, inactive, admins },
  };
}

async function getUserById(id: string) {
  const user = await prisma.user.findUnique({
    where: { id },
    select: publicUserSelect,
  });

  if (!user) {
    return {
      status: 404,
      data: {
        message: "Usuário não encontrado.",
      },
    };
  }

  return { status: 200, data: user };
}

async function updateUserById(
  id: string,
  input: Partial<UserInput>,
  actorId: string,
) {
  if (actorId !== id) {
    const actor = await prisma.user.findUnique({
      where: { id: actorId },
      select: { role: true, status: true },
    });

    if (!actor || actor.status !== "active" || actor.role !== "admin") {
      return {
        status: 403,
        data: {
          message: "Sem permissão.",
        },
      };
    }
  }

  const existing = await prisma.user.findUnique({
    where: { id },
    select: { id: true },
  });

  if (!existing) {
    return {
      status: 404,
      data: {
        message: "Usuário não encontrado.",
      },
    };
  }

  const data: {
    email?: string;
    firstName?: string;
    lastName?: string;
    passwordHash?: string;
  } = {};

  if (input.email !== undefined) {
    data.email = input.email;
  }
  if (input.firstName !== undefined) {
    data.firstName = input.firstName;
  }
  if (input.lastName !== undefined) {
    data.lastName = input.lastName;
  }
  if (input.password !== undefined) {
    data.passwordHash = await hash(input.password);
  }

  try {
    const user = await prisma.user.update({
      where: { id },
      data,
      select: publicUserSelect,
    });

    return { status: 200, data: user };
  } catch {
    return {
      status: 409,
      data: {
        message: "Este E-mail ja esta cadastrado.",
      },
    };
  }
}

async function updateUserRole(id: string, role: UserRole, actorId: string) {
  if (actorId === id) {
    return {
      status: 403,
      data: {
        message: "Você não pode alterar a própria permissão.",
      },
    };
  }

  const existing = await prisma.user.findUnique({
    where: { id },
    select: { id: true },
  });

  if (!existing) {
    return {
      status: 404,
      data: {
        message: "Usuário não encontrado.",
      },
    };
  }

  const user = await prisma.user.update({
    where: { id },
    data: { role },
    select: publicUserSelect,
  });

  return { status: 200, data: user };
}

async function deleteUserById(id: string, actorId: string) {
  if (actorId === id) {
    return {
      status: 403,
      data: {
        message: "Você não pode deletar a própria conta.",
      },
    };
  }

  const existing = await prisma.user.findUnique({
    where: { id },
    select: { id: true },
  });

  if (!existing) {
    return {
      status: 404,
      data: {
        message: "Usuário não encontrado.",
      },
    };
  }

  try {
    await prisma.user.update({
      where: { id },
      data: {
        status: "inactive",
      },
    });

    return { status: 200, data: { message: "Usuário apagado com sucesso" } };
  } catch {
    return {
      status: 409,
      data: {
        message: "Falha ao deletar usuário.",
      },
    };
  }
}

export const userService = {
  registerUser,
  createByAdmin,
  listUsers,
  getSummary,
  getUserById,
  updateUserById,
  updateUserRole,
  deleteUserById,
};
