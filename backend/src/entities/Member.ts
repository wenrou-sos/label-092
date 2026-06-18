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

  @Column({ type: 'varchar', length: 255, nullable: true })
  password: string | null;

  @Column({ type: 'varchar', length: 20, default: 'normal' })
  level: MemberLevel;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  totalSpent: number;

  @Column({ type: 'date', nullable: true })
  birthday: Date;

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
}

export const getMemberDiscount = (level: MemberLevel): number => {
  switch (level) {
    case 'silver': return 0.9;
    case 'gold': return 0.85;
    case 'diamond': return 0.8;
    default: return 1;
  }
};

export const calcMemberLevel = (totalSpent: number): MemberLevel => {
  if (totalSpent >= 10000) return 'diamond';
  if (totalSpent >= 5000) return 'gold';
  if (totalSpent >= 1000) return 'silver';
  return 'normal';
};
