import { Column, Entity, OneToMany } from 'typeorm';
import Base from './BaseController';
import BooksAuthors from './BookAuthorController';
import BooksGenres from './BookGenreController';
import BooksLibrarians from './BooksLibrarianController';
import BooksUsers from './BookUserController';


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

  // relationship books-authors
  @OneToMany(() => BooksAuthors, booksAuthors => booksAuthors.book)
  booksToAuthors: BooksAuthors[];

  // relationship books-genres
  @OneToMany(() => BooksGenres, booksGenres => booksGenres.book)
  booksToGenres: BooksGenres[];

  // relationship books-librarians
  @OneToMany(() => BooksLibrarians, booksLibrarians => booksLibrarians.book)
  booksToLibrarians: BooksLibrarians[];
}

export default Book;
