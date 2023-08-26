import { Entity, JoinColumn, ManyToOne, PrimaryColumn, CreateDateColumn, Column } from 'typeorm';
import Book from './BookController';
import Librarian from './LibControllers';


/**
 * Defines the Many-to-Many relationship table for books and librarians
 * to track the librarian issuing books and books issued.
 */
@Entity('books_librarians')
class BooksLibrarians {

  @PrimaryColumn({ length: 128 })
  librarianId: string;

  @PrimaryColumn({ length: 128 })
  bookId: string;

  @CreateDateColumn({ type: "timestamp" })
  issuedAt: Date;

  @ManyToOne(() => Librarian, (librarian) => librarian.booksToLibrarians,
    { onUpdate: 'CASCADE', onDelete: 'CASCADE' })
  @JoinColumn({ name: 'librarianId' })
  librarian: Librarian;

  @ManyToOne(() => Book, (book) => book.booksToLibrarians,
    { onUpdate: 'CASCADE', onDelete: 'CASCADE' })
  @JoinColumn({ name: 'bookId' })
  book: Book;
}

export default BooksLibrarians;
