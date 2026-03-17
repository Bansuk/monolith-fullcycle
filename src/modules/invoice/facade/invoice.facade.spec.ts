import { Sequelize } from "sequelize-typescript";
import InvoiceFacadeFactory from "../factory/invoice.facade.factory";
import InvoiceItemModel from "../repository/invoice-item.model";
import InvoiceModel from "../repository/invoice.model";

describe("InvoiceFacade integration test", () => {
	let sequelize: Sequelize;

	beforeEach(async () => {
		sequelize = new Sequelize({
			dialect: "sqlite",
			storage: ":memory:",
			logging: false,
			sync: { force: true },
		});

		await sequelize.addModels([InvoiceModel, InvoiceItemModel]);
		await sequelize.sync();
	});

	afterEach(async () => {
		await sequelize.close();
	});

	it("should generate an invoice", async () => {
		const facade = InvoiceFacadeFactory.create();

		const input = {
			name: "John Doe",
			document: "123.456.789-00",
			street: "Rua das Flores",
			number: "100",
			complement: "Apto 1",
			city: "São Paulo",
			state: "SP",
			zipCode: "01310-100",
			items: [
				{ id: "item-1", name: "Item A", price: 50 },
				{ id: "item-2", name: "Item B", price: 70 },
			],
		};

		const result = await facade.generate(input);

		expect(result.id).toBeDefined();
		expect(result.name).toBe(input.name);
		expect(result.document).toBe(input.document);
		expect(result.street).toBe(input.street);
		expect(result.number).toBe(input.number);
		expect(result.complement).toBe(input.complement);
		expect(result.city).toBe(input.city);
		expect(result.state).toBe(input.state);
		expect(result.zipCode).toBe(input.zipCode);
		expect(result.items).toHaveLength(2);
		expect(result.total).toBe(120);
	});

	it("should find an invoice", async () => {
		const facade = InvoiceFacadeFactory.create();

		const input = {
			name: "Jane Doe",
			document: "987.654.321-00",
			street: "Av. Brasil",
			number: "200",
			complement: "",
			city: "Rio de Janeiro",
			state: "RJ",
			zipCode: "20040-020",
			items: [{ id: "item-3", name: "Item C", price: 150 }],
		};

		const generated = await facade.generate(input);
		const found = await facade.find({ id: generated.id });

		expect(found.id).toBe(generated.id);
		expect(found.name).toBe(input.name);
		expect(found.document).toBe(input.document);
		expect(found.address.street).toBe(input.street);
		expect(found.address.number).toBe(input.number);
		expect(found.address.complement).toBe(input.complement);
		expect(found.address.city).toBe(input.city);
		expect(found.address.state).toBe(input.state);
		expect(found.address.zipCode).toBe(input.zipCode);
		expect(found.items).toHaveLength(1);
		expect(found.items[0].name).toBe("Item C");
		expect(found.total).toBe(150);
		expect(found.createdAt).toBeDefined();
	});
});
