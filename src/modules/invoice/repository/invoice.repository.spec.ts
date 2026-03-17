import { Sequelize } from "sequelize-typescript";
import Address from "../../@shared/domain/value-object/address";
import Id from "../../@shared/domain/value-object/id.value-object";
import InvoiceItem from "../domain/invoice-item.entity";
import Invoice from "../domain/invoice.entity";
import InvoiceItemModel from "./invoice-item.model";
import InvoiceModel from "./invoice.model";
import InvoiceRepository from "./invoice.repository";

describe("InvoiceRepository integration test", () => {
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
		const repository = new InvoiceRepository();

		const invoice = new Invoice({
			id: new Id("invoice-1"),
			name: "John Doe",
			document: "123.456.789-00",
			address: new Address(
				"Rua das Flores",
				"100",
				"Apto 1",
				"São Paulo",
				"SP",
				"01310-100",
			),
			items: [
				new InvoiceItem({ id: new Id("item-1"), name: "Item A", price: 50 }),
				new InvoiceItem({ id: new Id("item-2"), name: "Item B", price: 70 }),
			],
		});

		await repository.generate(invoice);

		const result = await InvoiceModel.findOne({
			where: { id: "invoice-1" },
			include: [{ model: InvoiceItemModel }],
		});

		expect(result.id).toBe("invoice-1");
		expect(result.name).toBe("John Doe");
		expect(result.document).toBe("123.456.789-00");
		expect(result.street).toBe("Rua das Flores");
		expect(result.items).toHaveLength(2);
		expect(result.items[0].name).toBe("Item A");
		expect(result.items[1].name).toBe("Item B");
	});

	it("should find an invoice", async () => {
		const repository = new InvoiceRepository();

		const invoice = new Invoice({
			id: new Id("invoice-2"),
			name: "Jane Doe",
			document: "987.654.321-00",
			address: new Address(
				"Av. Brasil",
				"200",
				"",
				"Rio de Janeiro",
				"RJ",
				"20040-020",
			),
			items: [
				new InvoiceItem({ id: new Id("item-3"), name: "Item C", price: 150 }),
			],
		});

		await repository.generate(invoice);

		const found = await repository.find("invoice-2");

		expect(found.id.id).toBe("invoice-2");
		expect(found.name).toBe("Jane Doe");
		expect(found.document).toBe("987.654.321-00");
		expect(found.address.street).toBe("Av. Brasil");
		expect(found.items).toHaveLength(1);
		expect(found.items[0].name).toBe("Item C");
		expect(found.items[0].price).toBe(150);
		expect(found.total).toBe(150);
	});

	it("should throw when invoice is not found", async () => {
		const repository = new InvoiceRepository();
		await expect(repository.find("non-existent")).rejects.toThrow(
			"Invoice with id non-existent not found",
		);
	});
});
