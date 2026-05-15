import { Router } from "express";
import InvoiceFacadeFactory from "../../../modules/invoice/factory/invoice.facade.factory";

export const invoiceRouter = Router();

invoiceRouter.get("/:id", async (req, res) => {
  try {
    const facade = InvoiceFacadeFactory.create();
    const output = await facade.find({ id: req.params.id });
    res.status(200).json(output);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});
