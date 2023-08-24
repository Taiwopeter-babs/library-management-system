import { Column, Entity } from 'typeorm';
import Base from './BaseController';


@Entity('authors')
class Author extends Base {

  @Column({
    type: 'varchar',
    length: 256,
    nullable: false
  })
  name: string

}

export default Author;