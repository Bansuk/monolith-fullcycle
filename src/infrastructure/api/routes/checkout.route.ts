import { Router } from "express";
import CheckoutFacadeFactory from "../../../modules/checkout/factory/checkout.facade.factory";

export const checkoutRouter = Router();

checkoutRouter.post("/", async (req, res) => {
  try {
    const facade = CheckoutFacadeFactory.create();
    const output = await facade.placeOrder(req.body);
    res.status(200).json(output);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});
