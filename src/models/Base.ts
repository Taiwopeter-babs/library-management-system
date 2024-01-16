import { CreateDateColumn, Entity, Index, PrimaryColumn, UpdateDateColumn } from 'typeorm';
import { v4 as uuid } from 'uuid';

@Entity()
export default abstract class Base {

  constructor() {
    this.id = uuid();
  }

  @PrimaryColumn({
    type: "varchar",
    length: 128,
  })
  @Index('')
  id: string;

  @CreateDateColumn({ type: "timestamp" })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date
}