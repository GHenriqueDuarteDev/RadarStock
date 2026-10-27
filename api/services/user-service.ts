import { Credentials } from "@radarstock/contracts";
import { prisma } from "../src/db";
import { hash, verify } from "@node-rs/argon2";

async function register(body: Credentials) {
  const passwordHash = await hash(body.password);

  try {
    const user = await prisma.user.create({
      data: { email: body.email, passwordHash },
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

async function login(body: Credentials) {
  const user = await prisma.user.findUnique({
    where: { email: body.email },
  });

  if (!user) {
    return { status: 401, data: { message: "E-mail ou senha invalidos" } };
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
  });

  if (!user) {
    return {
      status: 401,
      data: {
        message: "Não autenticado.",
      },
    };
  }
  return { status: 200, data: { id: user.id, email: user.email } };
}

export const userService = {
  register,
  login,
  me,
};
