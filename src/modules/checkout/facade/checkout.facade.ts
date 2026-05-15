import UseCaseInterface from "../../@shared/usecase/use-case.interface";
import CheckoutFacadeInterface from "./checkout.facade.interface";
import { PlaceOrderInputDto, PlaceOrderOutputDto } from "../usecase/place-order/place-order.dto";

export default class CheckoutFacade implements CheckoutFacadeInterface {
  constructor(private readonly placeOrderUseCase: UseCaseInterface) {}

  async placeOrder(input: PlaceOrderInputDto): Promise<PlaceOrderOutputDto> {
    return this.placeOrderUseCase.execute(input);
  }
}
