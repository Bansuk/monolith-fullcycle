import Order from "../domain/order.entity";

export default interface CheckoutGatewayInterface {
  placeOrder(order: Order): Promise<Order>;
  findOrder(id: string): Promise<Order | null>;
}
