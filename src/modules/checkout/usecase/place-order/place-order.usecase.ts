import Id from "../../../@shared/domain/value-object/id.value-object";
import UseCaseInterface from "../../../@shared/usecase/use-case.interface";
import ClientAdmFacadeInterface from "../../../client-adm/facade/client-adm.facade.interface";
import InvoiceFacadeInterface from "../../../invoice/facade/invoice.facade.interface";
import PaymentFacadeInterface from "../../../payment/facade/facade.interface";
import ProductAdmFacadeInterface from "../../../product-adm/facade/product-adm.facade.interface";
import StoreCatalogFacadeInterface from "../../../store-catalog/facade/store-catalog.facade.interface";
import Address from "../../../@shared/domain/value-object/address";
import Client from "../../domain/client.entity";
import Order from "../../domain/order.entity";
import Product from "../../domain/product.entity";
import CheckoutGatewayInterface from "../../gateway/checkout.gateway";
import { PlaceOrderInputDto, PlaceOrderOutputDto } from "./place-order.dto";

export default class PlaceOrderUseCase implements UseCaseInterface {
  constructor(
    private readonly clientFacade: ClientAdmFacadeInterface,
    private readonly productAdmFacade: ProductAdmFacadeInterface,
    private readonly storeCatalogFacade: StoreCatalogFacadeInterface,
    private readonly paymentFacade: PaymentFacadeInterface,
    private readonly invoiceFacade: InvoiceFacadeInterface,
    private readonly orderRepository: CheckoutGatewayInterface
  ) {}

  async execute(input: PlaceOrderInputDto): Promise<PlaceOrderOutputDto> {
    const clientData = await this.clientFacade.find({ id: input.clientId });

    const client = new Client({
      id: new Id(clientData.id),
      name: clientData.name,
      email: clientData.email,
      document: clientData.document,
      address: new Address(
        clientData.address.street,
        clientData.address.number,
        clientData.address.complement,
        clientData.address.city,
        clientData.address.state,
        clientData.address.zipCode
      ),
    });

    const products = await Promise.all(
      input.products.map(async ({ productId }) => {
        const stock = await this.productAdmFacade.checkStock({ productId });
        if (stock.stock === 0) {
          throw new Error(`Product ${productId} is out of stock`);
        }
        const catalogProduct = await this.storeCatalogFacade.find({ id: productId });
        return new Product({
          id: new Id(catalogProduct.id),
          name: catalogProduct.name,
          description: catalogProduct.description,
          salesPrice: catalogProduct.salesPrice,
        });
      })
    );

    const order = new Order({ client, products });

    const payment = await this.paymentFacade.process({
      orderId: order.id.id,
      amount: order.total,
    });

    order.status = payment.status;

    if (payment.status === "approved") {
      const invoice = await this.invoiceFacade.generate({
        name: client.name,
        document: client.document,
        street: client.address.street,
        number: client.address.number,
        complement: client.address.complement,
        city: client.address.city,
        state: client.address.state,
        zipCode: client.address.zipCode,
        items: products.map((p) => ({
          id: p.id.id,
          name: p.name,
          price: p.salesPrice,
        })),
      });
      order.invoiceId = invoice.id;
    }

    await this.orderRepository.placeOrder(order);

    return {
      id: order.id.id,
      invoiceId: order.invoiceId,
      status: order.status,
      total: order.total,
      products: order.products.map((p) => ({ productId: p.id.id })),
    };
  }
}
