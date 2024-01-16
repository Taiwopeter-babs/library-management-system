import { Column, Entity, OneToMany } from 'typeorm';
import Base from './Base';
import BooksUsers from './BooksUsers';


/**
 * ### User class mapped to `users` table
 */
@Entity('users')
class User extends Base {

  @Column({
    type: 'varchar',
    length: 256,
    nullable: false
  })
  name: string

  @Column({
    type: 'varchar',
    length: 256,
    nullable: false,
    unique: true
  })
  email: string

  // relationship books-users
  @OneToMany(() => BooksUsers, booksUsers => booksUsers.user)
  booksToUsers: BooksUsers[];
}

export default User;
