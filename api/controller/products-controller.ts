import {
  productInputSchema,
  updateProductInputSchema,
} from "@radarstock/contracts";
import { productService } from "../services";
import type { Request, Response } from "express";

async function getAllProducts(_req: Request, res: Response) {
  const { status, data } = await productService.getAllProducts();
  res.status(status).json(data);
}

async function getProductById(req: Request, res: Response) {
  const id = req.params.id;

  if (!id || typeof id !== "string") {
    res.status(400).json({ message: "Id do produto inválido." });
    return;
  }

  const { status, data } = await productService.getProductById(id);
  res.status(status).json(data);
}

async function createProduct(req: Request, res: Response) {
  const parsed = productInputSchema.safeParse(req.body);

  if (!parsed.success) {
    res.status(400).json({ message: "Dados de produto inválidos." });
    return;
  }

  const { status, data } = await productService.createProduct(parsed.data);
  res.status(status).json(data);
}

async function updateProductById(req: Request, res: Response) {
  const id = req.params.id;

  if (!id || typeof id !== "string") {
    res.status(400).json({ message: "Id do produto inválido." });
    return;
  }

  const parsed = updateProductInputSchema.safeParse(req.body);

  if (!parsed.success) {
    res.status(400).json({ message: "Dados de atualização inválidos." });
    return;
  }

  if (Object.keys(parsed.data).length === 0) {
    res.status(400).json({ message: "Nenhum campo para atualizar." });
    return;
  }

  const { status, data } = await productService.updateProductById(
    id,
    parsed.data,
  );
  res.status(status).json(data);
}

async function deleteProductById(req: Request, res: Response) {
  const id = req.params.id;

  if (!id || typeof id !== "string") {
    res.status(400).json({ message: "Id do produto inválido." });
    return;
  }

  const { status, data } = await productService.deleteProductById(id);
  res.status(status).json(data);
}

export const productController = {
  getAllProducts,
  getProductById,
  createProduct,
  updateProductById,
  deleteProductById,
};
