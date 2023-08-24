import { Entity, JoinColumn, ManyToOne, PrimaryColumn, CreateDateColumn } from 'typeorm';
import Book from './BookController';
import Author from './AuthorController';



/**
 * Defines the Many-to-Many relationship table for books and authors
 */
@Entity('books_authors')
class BooksAuthors {

  @PrimaryColumn({ length: 128 })
  authorId: string;

  @PrimaryColumn({ length: 128 })
  bookId: string;

  @ManyToOne(() => Author, (author) => author.booksToAuthors,
    { onUpdate: 'CASCADE', onDelete: 'CASCADE' })
  @JoinColumn({ name: 'authorId' })
  author: Author;

  @ManyToOne(() => Book, (book) => book.booksToAuthors,
    { onUpdate: 'CASCADE', onDelete: 'CASCADE' })
  @JoinColumn({ name: 'bookId' })
  book: Book;
}

export default BooksAuthors;
