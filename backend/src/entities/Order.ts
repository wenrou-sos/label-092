import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Member } from './Member';
import { OrderItem } from './OrderItem';

export type OrderStatus = 'pending' | 'paid' | 'shipped' | 'completed' | 'cancelled';

@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 32, unique: true })
  orderNo: string;

  @Column()
  memberId: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  totalAmount: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  discountAmount: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  actualAmount: number;

  @Column({ type: 'varchar', length: 20, default: 'pending' })
  status: OrderStatus;

  @Column({ type: 'varchar', length: 500 })
  shippingAddress: string;

  @Column({ length: 20 })
  contactPhone: string;

  @Column({ length: 50 })
  contactName: string;

  @Column({ type: 'text', nullable: true })
  remark: string;

  @Column({ type: 'timestamp', nullable: true })
  paidAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  shippedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  completedAt: Date;

  @ManyToOne(() => Member, member => member.orders)
  @JoinColumn({ name: 'memberId' })
  member: Member;

  @OneToMany(() => OrderItem, item => item.order, { cascade: true })
  items: OrderItem[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
