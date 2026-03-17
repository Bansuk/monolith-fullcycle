import GenerateInvoiceUseCase from "./generate-invoice.usecase";

const MockRepository = () => ({
	generate: jest.fn().mockImplementation((invoice) => Promise.resolve(invoice)),
	find: jest.fn(),
});

describe("GenerateInvoice UseCase unit test", () => {
	it("should generate an invoice", async () => {
		const repository = MockRepository();
		const usecase = new GenerateInvoiceUseCase(repository);

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

		const result = await usecase.execute(input);

		expect(repository.generate).toHaveBeenCalled();
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
		expect(result.items[0].name).toBe("Item A");
		expect(result.items[1].name).toBe("Item B");
		expect(result.total).toBe(120);
	});
});
