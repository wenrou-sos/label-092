import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { TastingEvent } from './TastingEvent';
import { Member } from './Member';

export type RegistrationStatus = 'pending' | 'confirmed' | 'cancelled' | 'attended';

@Entity('tasting_registrations')
export class TastingRegistration {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  eventId: number;

  @Column()
  memberId: number;

  @Column({ type: 'int', default: 1 })
  guestsCount: number;

  @Column({
    type: 'enum',
    enum: ['pending', 'confirmed', 'cancelled', 'attended'],
    default: 'pending',
  })
  status: RegistrationStatus;

  @Column({ type: 'text', nullable: true })
  remark: string;

  @ManyToOne(() => TastingEvent, event => event.registrations)
  @JoinColumn({ name: 'eventId' })
  event: TastingEvent;

  @ManyToOne(() => Member, member => member.tastingRegistrations)
  @JoinColumn({ name: 'memberId' })
  member: Member;

  @CreateDateColumn()
  createdAt: Date;
}
