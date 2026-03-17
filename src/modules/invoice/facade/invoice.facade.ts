import UseCaseInterface from "../../@shared/usecase/use-case.interface";
import InvoiceFacadeInterface, {
	FindInvoiceFacadeInputDTO,
	FindInvoiceFacadeOutputDTO,
	GenerateInvoiceFacadeInputDTO,
	GenerateInvoiceFacadeOutputDTO,
} from "./invoice.facade.interface";

export interface UseCaseProps {
	generateUseCase: UseCaseInterface;
	findUseCase: UseCaseInterface;
}

export default class InvoiceFacade implements InvoiceFacadeInterface {
	private _generateUseCase: UseCaseInterface;
	private _findUseCase: UseCaseInterface;

	constructor(usecaseProps: UseCaseProps) {
		this._generateUseCase = usecaseProps.generateUseCase;
		this._findUseCase = usecaseProps.findUseCase;
	}

	async generate(
		input: GenerateInvoiceFacadeInputDTO,
	): Promise<GenerateInvoiceFacadeOutputDTO> {
		return await this._generateUseCase.execute(input);
	}

	async find(
		input: FindInvoiceFacadeInputDTO,
	): Promise<FindInvoiceFacadeOutputDTO> {
		return await this._findUseCase.execute(input);
	}
}
