import express, { Express } from "express";
import { checkoutRouter } from "./routes/checkout.route";
import { clientsRouter } from "./routes/clients.route";
import { invoiceRouter } from "./routes/invoice.route";
import { productsRouter } from "./routes/products.route";

export function setupApp(): Express {
  const app = express();
  app.use(express.json());
  app.use("/products", productsRouter);
  app.use("/clients", clientsRouter);
  app.use("/checkout", checkoutRouter);
  app.use("/invoice", invoiceRouter);
  return app;
}
