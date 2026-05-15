import BaseEntity from "../../@shared/domain/entity/base.entity";
import Id from "../../@shared/domain/value-object/id.value-object";
import Client from "./client.entity";
import Product from "./product.entity";

export default class Order extends BaseEntity {
  private _client: Client;
  private _products: Product[];
  private _status: string;
  private _invoiceId: string | null;

  constructor(props: {
    id?: Id;
    client: Client;
    products: Product[];
    status?: string;
    invoiceId?: string | null;
    createdAt?: Date;
    updatedAt?: Date;
  }) {
    super(props.id, props.createdAt, props.updatedAt);
    this._client = props.client;
    this._products = props.products;
    this._status = props.status || "pending";
    this._invoiceId = props.invoiceId || null;
  }

  get client(): Client {
    return this._client;
  }

  get products(): Product[] {
    return this._products;
  }

  get status(): string {
    return this._status;
  }

  set status(status: string) {
    this._status = status;
  }

  get invoiceId(): string | null {
    return this._invoiceId;
  }

  set invoiceId(invoiceId: string | null) {
    this._invoiceId = invoiceId;
  }

  get total(): number {
    return this._products.reduce((acc, product) => acc + product.salesPrice, 0);
  }
}
