import { Sequelize } from "sequelize-typescript";
import request from "supertest";
import { ClientModel } from "../../../modules/client-adm/repository/client.model";
import InvoiceItemModel from "../../../modules/invoice/repository/invoice-item.model";
import InvoiceModel from "../../../modules/invoice/repository/invoice.model";
import TransactionModel from "../../../modules/payment/repository/transaction.model";
import { ProductModel as ProductAdmModel } from "../../../modules/product-adm/repository/product.model";
import OrderProductModel from "../../../modules/checkout/repository/order-product.model";
import OrderModel from "../../../modules/checkout/repository/order.model";
import StoreCatalogProductModel from "../../../modules/store-catalog/repository/product.model";
import { setupApp } from "../express";

describe("Checkout E2E", () => {
  let sequelize: Sequelize;

  beforeEach(async () => {
    sequelize = new Sequelize({
      dialect: "sqlite",
      storage: ":memory:",
      logging: false,
    });

    // ProductAdmModel is registered LAST so it wins the `products` table creation
    // (both models target the same table; force sync recreates based on last registered model)
    sequelize.addModels([
      StoreCatalogProductModel,
      ClientModel,
      InvoiceModel,
      InvoiceItemModel,
      TransactionModel,
      OrderModel,
      OrderProductModel,
      ProductAdmModel,
    ]);

    await sequelize.sync({ force: true });

    // store-catalog needs salesPrice; add it since ProductAdmModel won the table creation
    await sequelize.query(
      "ALTER TABLE products ADD COLUMN salesPrice REAL NOT NULL DEFAULT 0"
    );
  });

  afterEach(async () => {
    await sequelize.close();
  });

  it("POST /checkout - should process an order and generate an invoice", async () => {
    const app = setupApp();

    // seed product using ProductAdmModel (purchasePrice + stock) then set salesPrice
    const productId = "prod-1";
    await ProductAdmModel.create({
      id: productId,
      name: "Product A",
      description: "Description A",
      purchasePrice: 150,
      stock: 10,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    await sequelize.query(
      `UPDATE products SET salesPrice = 150 WHERE id = '${productId}'`
    );

    // create client via API
    const clientResponse = await request(app).post("/clients").send({
      name: "Jane Doe",
      email: "jane@example.com",
      document: "987.654.321-00",
      address: {
        street: "Avenida Paulista",
        number: "1000",
        complement: "Sala 1",
        city: "São Paulo",
        state: "SP",
        zipCode: "01310-200",
      },
    });
    expect(clientResponse.status).toBe(201);
    const clientId = clientResponse.body.id;

    // place order
    const checkoutResponse = await request(app).post("/checkout").send({
      clientId,
      products: [{ productId }],
    });

    expect(checkoutResponse.status).toBe(200);
    expect(checkoutResponse.body.id).toBeDefined();
    expect(checkoutResponse.body.invoiceId).toBeDefined();
    expect(checkoutResponse.body.status).toBe("approved");
    expect(checkoutResponse.body.total).toBe(150);
    expect(checkoutResponse.body.products).toHaveLength(1);
    expect(checkoutResponse.body.products[0].productId).toBe(productId);

    // verify invoice
    const invoiceId = checkoutResponse.body.invoiceId;
    const invoiceResponse = await request(app).get(`/invoice/${invoiceId}`);

    expect(invoiceResponse.status).toBe(200);
    expect(invoiceResponse.body.id).toBe(invoiceId);
    expect(invoiceResponse.body.name).toBe("Jane Doe");
    expect(invoiceResponse.body.total).toBe(150);
  });
});
