import { Entity, JoinColumn, ManyToOne, PrimaryColumn, CreateDateColumn } from 'typeorm';
import Book from './BookController';
import Genre from './GenreController';



/**
 * Defines the Many-to-Many relationship table for books and genres
 */
@Entity('books_genres')
class BooksGenres {

  @PrimaryColumn({ length: 128 })
  genreId: string;

  @PrimaryColumn({ length: 128 })
  bookId: string;

  @ManyToOne(() => Genre, (genre) => genre.booksToGenres,
    { onUpdate: 'CASCADE', onDelete: 'CASCADE' })
  @JoinColumn({ name: 'genreId' })
  genre: Genre;

  @ManyToOne(() => Book, (book) => book.booksToGenres,
    { onUpdate: 'CASCADE', onDelete: 'CASCADE' })
  @JoinColumn({ name: 'bookId' })
  book: Book;
}

export default BooksGenres;
