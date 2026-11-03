import { credentialsSchema, userInputSchema } from "@radarstock/contracts";
import { authService } from "../services";
import type { Request, Response } from "express";

async function register(req: Request, res: Response) {
  const parsed = userInputSchema.safeParse(req.body);

  if (!parsed.success) {
    res.status(400).json({
      message: "Dados de registro inválidos.",
    });
    return;
  }

  const { status, data } = await authService.register(parsed.data);
  res.status(status).json(data);
}

async function login(req: Request, res: Response) {
  const parsed = credentialsSchema.safeParse(req.body);

  if (!parsed.success) {
    res.status(400).json({
      message: "E-mail ou senha incorretos.",
    });
    return;
  }

  const { status, data } = await authService.login(parsed.data);
  res.status(status).json(data);
}

async function me(req: Request, res: Response) {
  const idUser = res.locals.userId as string;

  if (!idUser) {
    res.status(401).json({
      message: "Não autenticado",
    });
    return;
  }

  const { status, data } = await authService.me(idUser);
  res.status(status).json(data);
}

export const authController = {
  register,
  login,
  me,
};
