import Address from "../../../@shared/domain/value-object/address";
import Id from "../../../@shared/domain/value-object/id.value-object";
import InvoiceItem from "../../domain/invoice-item.entity";
import Invoice from "../../domain/invoice.entity";
import FindInvoiceUseCase from "./find-invoice.usecase";

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

const MockRepository = () => ({
	generate: jest.fn(),
	find: jest.fn().mockResolvedValue(invoice),
});

describe("FindInvoice UseCase unit test", () => {
	it("should find an invoice", async () => {
		const repository = MockRepository();
		const usecase = new FindInvoiceUseCase(repository);

		const result = await usecase.execute({ id: "invoice-1" });

		expect(repository.find).toHaveBeenCalledWith("invoice-1");
		expect(result.id).toBe("invoice-1");
		expect(result.name).toBe("John Doe");
		expect(result.document).toBe("123.456.789-00");
		expect(result.address.street).toBe("Rua das Flores");
		expect(result.address.number).toBe("100");
		expect(result.address.complement).toBe("Apto 1");
		expect(result.address.city).toBe("São Paulo");
		expect(result.address.state).toBe("SP");
		expect(result.address.zipCode).toBe("01310-100");
		expect(result.items).toHaveLength(2);
		expect(result.items[0]).toEqual({
			id: "item-1",
			name: "Item A",
			price: 50,
		});
		expect(result.items[1]).toEqual({
			id: "item-2",
			name: "Item B",
			price: 70,
		});
		expect(result.total).toBe(120);
		expect(result.createdAt).toBeDefined();
	});
});
