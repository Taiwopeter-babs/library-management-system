import { Column, Entity, OneToMany } from 'typeorm';
import Base from './Base';
import BooksAuthors from './BooksAuthors';


/**
 * Author class - An author can be linked to multiple books
 * and vice versa. Mapped to `authors` table.
 */
@Entity('authors')
class Author extends Base {

  @Column({
    type: 'varchar',
    length: 256,
    nullable: false
  })
  name: string;

  // relationship books-users
  @OneToMany(() => BooksAuthors, booksAuthors => booksAuthors.author)
  booksToAuthors: BooksAuthors[];

}

export default Author;