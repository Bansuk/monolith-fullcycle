import { Router } from "express";
import ProductRepository from "../../../modules/product-adm/repository/product.repository";
import AddProductUseCase from "../../../modules/product-adm/usecase/add-product/add-product.usecase";

export const productsRouter = Router();

productsRouter.post("/", async (req, res) => {
  try {
    const repository = new ProductRepository();
    const useCase = new AddProductUseCase(repository);
    const output = await useCase.execute(req.body);
    res.status(201).json(output);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});
