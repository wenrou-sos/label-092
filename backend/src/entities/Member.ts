import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { Order } from './Order';
import { Review } from './Review';
import { TastingRegistration } from './TastingRegistration';

export type MemberLevel = 'normal' | 'silver' | 'gold' | 'diamond';

@Entity('members')
export class Member {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 50, unique: true })
  phone: string;

  @Column({ length: 100 })
  name: string;

  @Column({ length: 255, nullable: true })
  password: string | null;

  @Column({
    type: 'enum',
    enum: ['normal', 'silver', 'gold', 'diamond'],
    default: 'normal',
  })
  level: MemberLevel;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  totalSpent: number;

  @Column({ type: 'date', nullable: true })
  birthday: Date | null;

  @Column({ type: 'boolean', default: false })
  birthdayGiftSent: boolean;

  @Column({ type: 'int', default: 0 })
  points: number;

  @OneToMany(() => Order, order => order.member)
  orders: Order[];

  @OneToMany(() => Review, review => review.member)
  reviews: Review[];

  @OneToMany(() => TastingRegistration, reg => reg.member)
  tastingRegistrations: TastingRegistration[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  getDiscount(): number {
    switch (this.level) {
      case 'silver': return 0.9;
      case 'gold': return 0.85;
      case 'diamond': return 0.8;
      default: return 1;
    }
  }

  updateLevel(): void {
    if (this.totalSpent >= 10000) {
      this.level = 'diamond';
    } else if (this.totalSpent >= 5000) {
      this.level = 'gold';
    } else if (this.totalSpent >= 1000) {
      this.level = 'silver';
    } else {
      this.level = 'normal';
    }
  }
}
