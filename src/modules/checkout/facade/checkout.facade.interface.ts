import { PlaceOrderInputDto, PlaceOrderOutputDto } from "../usecase/place-order/place-order.dto";

export default interface CheckoutFacadeInterface {
  placeOrder(input: PlaceOrderInputDto): Promise<PlaceOrderOutputDto>;
}
