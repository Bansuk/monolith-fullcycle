import {
  Column,
  HasMany,
  Model,
  PrimaryKey,
  Table,
} from "sequelize-typescript";
import OrderProductModel from "./order-product.model";

@Table({
  tableName: "orders",
  timestamps: false,
})
export default class OrderModel extends Model {
  @PrimaryKey
  @Column({ allowNull: false })
  declare id: string;

  @Column({ allowNull: false, field: "client_id" })
  declare clientId: string;

  @Column({ allowNull: false })
  declare status: string;

  @Column({ allowNull: true, field: "invoice_id" })
  declare invoiceId: string;

  @HasMany(() => OrderProductModel)
  declare products: OrderProductModel[];

  @Column({ allowNull: false, field: "created_at" })
  declare createdAt: Date;

  @Column({ allowNull: false, field: "updated_at" })
  declare updatedAt: Date;
}
