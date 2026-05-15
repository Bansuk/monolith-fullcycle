import Id from "../../@shared/domain/value-object/id.value-object";
import Client from "../domain/client.entity";
import Order from "../domain/order.entity";
import Product from "../domain/product.entity";
import CheckoutGatewayInterface from "../gateway/checkout.gateway";
import OrderProductModel from "./order-product.model";
import OrderModel from "./order.model";

export default class OrderRepository implements CheckoutGatewayInterface {
  async placeOrder(order: Order): Promise<Order> {
    await OrderModel.create(
      {
        id: order.id.id,
        clientId: order.client.id.id,
        status: order.status,
        invoiceId: order.invoiceId,
        createdAt: order.createdAt,
        updatedAt: order.updatedAt,
        products: order.products.map((p) => ({
          id: new Id().id,
          orderId: order.id.id,
          productId: p.id.id,
        })),
      },
      { include: [{ model: OrderProductModel }] }
    );

    return order;
  }

  async findOrder(id: string): Promise<Order | null> {
    const orderModel = await OrderModel.findOne({
      where: { id },
      include: [{ model: OrderProductModel }],
    });

    if (!orderModel) return null;

    return new Order({
      id: new Id(orderModel.id),
      client: new Client({
        id: new Id(orderModel.clientId),
        name: "",
        email: "",
        document: "",
        address: null,
      }),
      products: orderModel.products.map(
        (p) =>
          new Product({
            id: new Id(p.productId),
            name: "",
            description: "",
            salesPrice: 0,
          })
      ),
      status: orderModel.status,
      invoiceId: orderModel.invoiceId,
      createdAt: orderModel.createdAt,
      updatedAt: orderModel.updatedAt,
    });
  }
}
