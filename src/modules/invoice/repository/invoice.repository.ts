import Address from "../../@shared/domain/value-object/address";
import Id from "../../@shared/domain/value-object/id.value-object";
import InvoiceItem from "../domain/invoice-item.entity";
import Invoice from "../domain/invoice.entity";
import InvoiceGateway from "../gateway/invoice.gateway";
import InvoiceItemModel from "./invoice-item.model";
import InvoiceModel from "./invoice.model";

export default class InvoiceRepository implements InvoiceGateway {
	async generate(invoice: Invoice): Promise<Invoice> {
		await InvoiceModel.create(
			{
				id: invoice.id.id,
				name: invoice.name,
				document: invoice.document,
				street: invoice.address.street,
				number: invoice.address.number,
				complement: invoice.address.complement,
				city: invoice.address.city,
				state: invoice.address.state,
				zipCode: invoice.address.zipCode,
				items: invoice.items.map((item) => ({
					id: item.id.id,
					name: item.name,
					price: item.price,
				})),
				createdAt: invoice.createdAt,
				updatedAt: invoice.updatedAt,
			},
			{ include: [{ model: InvoiceItemModel }] },
		);

		return invoice;
	}

	async find(id: string): Promise<Invoice> {
		const invoiceModel = await InvoiceModel.findOne({
			where: { id },
			include: [{ model: InvoiceItemModel }],
		});

		if (!invoiceModel) {
			throw new Error(`Invoice with id ${id} not found`);
		}

		return new Invoice({
			id: new Id(invoiceModel.id),
			name: invoiceModel.name,
			document: invoiceModel.document,
			address: new Address(
				invoiceModel.street,
				invoiceModel.number,
				invoiceModel.complement,
				invoiceModel.city,
				invoiceModel.state,
				invoiceModel.zipCode,
			),
			items: invoiceModel.items.map(
				(item) =>
					new InvoiceItem({
						id: new Id(item.id),
						name: item.name,
						price: item.price,
					}),
			),
			createdAt: invoiceModel.createdAt,
			updatedAt: invoiceModel.updatedAt,
		});
	}
}
