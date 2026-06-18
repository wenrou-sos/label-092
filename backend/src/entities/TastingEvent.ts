import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { TastingRegistration } from './TastingRegistration';

export type TastingStatus = 'upcoming' | 'ongoing' | 'completed' | 'cancelled';

@Entity('tasting_events')
export class TastingEvent {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100 })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'timestamp' })
  eventDate: Date;

  @Column({ length: 200 })
  location: string;

  @Column({ type: 'int', default: 20 })
  maxParticipants: number;

  @Column({ type: 'int', default: 0 })
  currentParticipants: number;

  @Column({ type: 'varchar', length: 20, default: 'upcoming' })
  status: TastingStatus;

  @Column({ type: 'varchar', length: 255, nullable: true })
  image: string;

  @Column({ type: 'text', nullable: true })
  teaList: string;

  @Column({ type: 'text', nullable: true })
  host: string;

  @OneToMany(() => TastingRegistration, reg => reg.event)
  registrations: TastingRegistration[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
