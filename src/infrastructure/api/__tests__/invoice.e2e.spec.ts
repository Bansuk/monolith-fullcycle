import { Sequelize } from "sequelize-typescript";
import request from "supertest";
import InvoiceFacadeFactory from "../../../modules/invoice/factory/invoice.facade.factory";
import InvoiceItemModel from "../../../modules/invoice/repository/invoice-item.model";
import InvoiceModel from "../../../modules/invoice/repository/invoice.model";
import { setupApp } from "../express";

describe("Invoice E2E", () => {
  let sequelize: Sequelize;

  beforeEach(async () => {
    sequelize = new Sequelize({
      dialect: "sqlite",
      storage: ":memory:",
      logging: false,
      sync: { force: true },
    });
    sequelize.addModels([InvoiceModel, InvoiceItemModel]);
    await sequelize.sync();
  });

  afterEach(async () => {
    await sequelize.close();
  });

  it("GET /invoice/:id - should return an invoice", async () => {
    const app = setupApp();

    const facade = InvoiceFacadeFactory.create();
    const generated = await facade.generate({
      name: "John Doe",
      document: "123.456.789-00",
      street: "Rua das Flores",
      number: "100",
      complement: "Apto 1",
      city: "São Paulo",
      state: "SP",
      zipCode: "01310-100",
      items: [
        { id: "p1", name: "Product 1", price: 100 },
        { id: "p2", name: "Product 2", price: 200 },
      ],
    });

    const response = await request(app).get(`/invoice/${generated.id}`);

    expect(response.status).toBe(200);
    expect(response.body.id).toBe(generated.id);
    expect(response.body.name).toBe("John Doe");
    expect(response.body.document).toBe("123.456.789-00");
    expect(response.body.total).toBe(300);
    expect(response.body.items).toHaveLength(2);
    expect(response.body.address).toBeDefined();
  });
});
