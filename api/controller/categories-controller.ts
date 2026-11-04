import {
  categoryInputSchema,
  updateCategoryInputSchema,
} from "@radarstock/contracts";
import { categoryService } from "../services";
import type { Request, Response } from "express";

async function getAllCategories(_req: Request, res: Response) {
  const { status, data } = await categoryService.getAllCategories();
  res.status(status).json(data);
}

async function getCategoryById(req: Request, res: Response) {
  const id = req.params.id;

  if (!id || typeof id !== "string") {
    res.status(400).json({ message: "Id da categoria inválido." });
    return;
  }

  const { status, data } = await categoryService.getCategoryById(id);
  res.status(status).json(data);
}

async function createCategory(req: Request, res: Response) {
  const parsed = categoryInputSchema.safeParse(req.body);

  if (!parsed.success) {
    res.status(400).json({ message: "Dados de categoria inválidos." });
    return;
  }

  const { status, data } = await categoryService.createCategory(parsed.data);
  res.status(status).json(data);
}

async function updateCategoryById(req: Request, res: Response) {
  const id = req.params.id;

  if (!id || typeof id !== "string") {
    res.status(400).json({ message: "Id da categoria inválido." });
    return;
  }

  const parsed = updateCategoryInputSchema.safeParse(req.body);

  if (!parsed.success) {
    res.status(400).json({ message: "Dados de atualização inválidos." });
    return;
  }

  if (Object.keys(parsed.data).length === 0) {
    res.status(400).json({ message: "Nenhum campo para atualizar." });
    return;
  }

  const { status, data } = await categoryService.updateCategoryById(
    id,
    parsed.data,
  );
  res.status(status).json(data);
}

async function deleteCategoryById(req: Request, res: Response) {
  const id = req.params.id;

  if (!id || typeof id !== "string") {
    res.status(400).json({ message: "Id da categoria inválido." });
    return;
  }

  const { status, data } = await categoryService.deleteCategoryById(id);
  res.status(status).json(data);
}

export const categoryController = {
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategoryById,
  deleteCategoryById,
};
