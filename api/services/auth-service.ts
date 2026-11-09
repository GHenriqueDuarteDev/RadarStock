import type { AdminCreateUser, Credentials } from "@radarstock/contracts";
import { verify } from "@node-rs/argon2";
import { prisma } from "../src/db";
import { userService } from "./users-service";

async function adminRegister(input: AdminCreateUser) {
  return userService.createByAdmin(input);
}

async function login(body: Credentials) {
  const user = await prisma.user.findUnique({
    where: { email: body.email },
  });

  if (!user || user.status === "inactive") {
    return { status: 401, data: { message: "E-mail ou senha invalidos." } };
  }

  const passwordMatched = await verify(user.passwordHash, body.password);

  if (!passwordMatched) {
    return {
      status: 401,
      data: {
        message: "E-mail ou senha invalidos.",
      },
    };
  }
  return { status: 200, data: { id: user.id, email: user.email } };
}

async function me(idUser: string) {
  const user = await prisma.user.findUnique({
    where: { id: idUser },
    select: { id: true, email: true, role: true },
  });

  if (!user) {
    return {
      status: 401,
      data: {
        message: "Não autenticado.",
      },
    };
  }
  return {
    status: 200,
    data: { id: user.id, email: user.email, role: user.role },
  };
}

export const authService = {
  adminRegister,
  login,
  me,
};
