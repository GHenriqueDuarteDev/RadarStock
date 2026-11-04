import { hash } from "@node-rs/argon2";
import type {
  AdminCreateUser,
  UserInput,
  UserRole,
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

async function getAllUsers() {
  const users = await prisma.user.findMany({
    select: publicUserSelect,
  });

  return { status: 200, data: users };
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
  getAllUsers,
  getUserById,
  updateUserById,
  updateUserRole,
  deleteUserById,
};
