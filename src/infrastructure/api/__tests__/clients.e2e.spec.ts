import { Sequelize } from "sequelize-typescript";
import request from "supertest";
import { ClientModel } from "../../../modules/client-adm/repository/client.model";
import { setupApp } from "../express";

describe("Clients E2E", () => {
  let sequelize: Sequelize;

  beforeEach(async () => {
    sequelize = new Sequelize({
      dialect: "sqlite",
      storage: ":memory:",
      logging: false,
      sync: { force: true },
    });
    sequelize.addModels([ClientModel]);
    await sequelize.sync();
  });

  afterEach(async () => {
    await sequelize.close();
  });

  it("POST /clients - should create a client", async () => {
    const app = setupApp();

    const response = await request(app).post("/clients").send({
      name: "John Doe",
      email: "john@example.com",
      document: "123.456.789-00",
      address: {
        street: "Rua das Flores",
        number: "100",
        complement: "Apto 1",
        city: "São Paulo",
        state: "SP",
        zipCode: "01310-100",
      },
    });

    expect(response.status).toBe(201);
    expect(response.body.id).toBeDefined();
    expect(response.body.name).toBe("John Doe");
    expect(response.body.email).toBe("john@example.com");
    expect(response.body.document).toBe("123.456.789-00");
  });
});
