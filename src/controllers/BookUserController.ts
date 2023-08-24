import { Entity, JoinColumn, ManyToOne, PrimaryColumn, CreateDateColumn } from 'typeorm';
import Book from './BookController';
import User from './UserController';



/**
 * Defines the Many-to-Many relationship table for books and users
 */
@Entity('books_users')
class BooksUsers {

  @PrimaryColumn({ length: 128 })
  userId: string;

  @PrimaryColumn({ length: 128 })
  bookId: string;

  @CreateDateColumn({ type: "timestamp" })
  issuedAt: Date;

  @ManyToOne(() => User, (user) => user.booksToUsers,
    { onUpdate: 'CASCADE', onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @ManyToOne(() => Book, (book) => book.booksToUsers,
    { onUpdate: 'CASCADE', onDelete: 'CASCADE' })
  @JoinColumn({ name: 'bookId' })
  book: Book;
}

export default BooksUsers;
