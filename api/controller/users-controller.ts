import { updateUserRoleSchema, userInputSchema } from "@radarstock/contracts";
import { userService } from "../services";
import type { Request, Response } from "express";

async function getAllUsers(_req: Request, res: Response) {
  const { status, data } = await userService.getAllUsers();
  res.status(status).json(data);
}

async function getUserById(req: Request, res: Response) {
  const idUser = req.params.id;

  if (!idUser || typeof idUser !== "string") {
    res.status(400).json({
      message: "Id do usuário inválido.",
    });
    return;
  }

  const { status, data } = await userService.getUserById(idUser);
  res.status(status).json(data);
}

async function updateUserById(req: Request, res: Response) {
  const idUser = req.params.id;

  if (!idUser || typeof idUser !== "string") {
    res.status(400).json({
      message: "Id do usuário inválido.",
    });
    return;
  }

  const parsed = userInputSchema.partial().safeParse(req.body);

  if (!parsed.success) {
    res.status(400).json({
      message: "Dados de atualização inválidos.",
    });
    return;
  }

  if (Object.keys(parsed.data).length === 0) {
    res.status(400).json({
      message: "Nenhum campo para atualizar.",
    });
    return;
  }

  const actorId = res.locals.userId as string;

  const { status, data } = await userService.updateUserById(
    idUser,
    parsed.data,
    actorId,
  );
  res.status(status).json(data);
}

async function updateUserRole(req: Request, res: Response) {
  const idUser = req.params.id;

  if (!idUser || typeof idUser !== "string") {
    res.status(400).json({
      message: "Id do usuário inválido.",
    });
    return;
  }

  const parsed = updateUserRoleSchema.safeParse(req.body);

  if (!parsed.success) {
    res.status(400).json({
      message: "Role inválida.",
    });
    return;
  }

  const { status, data } = await userService.updateUserRole(
    idUser,
    parsed.data.role,
  );
  res.status(status).json(data);
}

async function deleteUserById(req: Request, res: Response) {
  const idUser = req.params.id;

  if (!idUser || typeof idUser !== "string") {
    res.status(400).json({
      message: "Id do usuário inválido.",
    });
    return;
  }

  const { status, data } = await userService.deleteUserById(idUser);
  res.status(status).json(data);
}

export const userController = {
  getAllUsers,
  getUserById,
  updateUserById,
  updateUserRole,
  deleteUserById,
};
