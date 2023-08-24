import { Column, Entity, OneToMany } from 'typeorm';
import Base from './BaseController';
import BooksUsers from './BookUserController';
import User from './UserController';



/**
 * Book class mapped to `books` table
 */
@Entity('books')
class Book extends Base {

  @Column({
    type: 'varchar',
    length: 256,
    nullable: false
  })
  name: string;

  @Column({
    type: "integer",
    default: 0
  })
  quantity: number;

  @Column({
    type: 'varchar',
    length: 128,
    nullable: true
  })
  publisher: string;

  // relationship books-users
  @OneToMany(() => BooksUsers, booksUsers => booksUsers.book)
  booksToUsers: BooksUsers[];
}

export default Book;
