import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { Review } from './Review';

export type TeaCategory = 'green' | 'black' | 'oolong' | 'white' | 'dark' | 'yellow';

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100 })
  name: string;

  @Column({ type: 'varchar', length: 20 })
  category: TeaCategory;

  @Column({ type: 'text', nullable: true })
  originStory: string;

  @Column({ type: 'int' })
  harvestYear: number;

  @Column({ type: 'text', nullable: true })
  process: string;

  @Column({ type: 'decimal', precision: 3, scale: 1, default: 0 })
  reviewScore: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  pricePer100g: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  boxPrice: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  giftBoxPrice: number;

  @Column({ type: 'int', default: 100 })
  minWeight: number;

  @Column({ type: 'int', default: 0 })
  stock: number;

  @Column({ type: 'varchar', length: 255, nullable: true })
  image: string;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Column({ type: 'text', nullable: true })
  description: string;

  @OneToMany(() => Review, review => review.product)
  reviews: Review[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
