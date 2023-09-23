import { Column, Entity, OneToMany } from 'typeorm';
import { Request, Response } from 'express';

import Author from './AuthorController';
import Genre from './GenreController';
import Base from './BaseController';
import BooksAuthors from './BookAuthorController';
import BooksGenres from './BookGenreController';
import BooksLibrarians from './BooksLibrarianController';
import BooksUsers from './BookUserController';

import { createNewBook } from '../utils/saveObjects';
import { BookInterface, UserInterface } from '../utils/interface';
import dataSource from '../utils/dataSource';
// background jobs
import { addAuthorsToQueueAndProcess, addGenresToQueueAndProcess } from '../processJobs';
import { skipItemsForPage } from '../utils/pagination';


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
  publisher: string | null;

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

  // ========== ENDPOINTS ===============

  /**
   * ### adds a new book to the `books` table
   */
  static async addBook(request: Request, response: Response) {
    // regex to validate quantity input
    const checkDigit = /^[0-9]+$/g;
    // authors and genres are arrays of authors and genres respectively
    let { name, quantity, publisher, authors, genres } = request.body;
    // validate input
    if (!name) return response.status(400).json({ error: 'Missing name' });
    if (quantity) {
      // check if it's a number
      if (!checkDigit.test(quantity)) {
        return response.status(400).json({ error: 'Quantity not a number' });
      }
      quantity = parseInt(quantity, 10);
    } else {
      quantity = 0;
    }
    if (!publisher) {
      publisher = null;
    }
    const savedBook = await createNewBook({ name, quantity, publisher });
    if (!savedBook) {
      return response.status(400).json({ error: 'Book not saved' });
    }
    /**
     * Background jobs for linking authors and genres with a book:
     * In each array, query the genre or author by name; if it does not exist,
     * create that author or genre and link to the book that is created
     */
    try {
      await addAuthorsToQueueAndProcess(authors, savedBook);
      await addGenresToQueueAndProcess(genres, savedBook);
    } catch (error: any) {
      if (error.message === 'Author absent') {
        return response.status(201).json(
          { bookName: savedBook.name, message: 'Could not add book with author' }
        );
      }
      if (error.message === 'Genre absent') {
        return response.status(201).json(
          { bookName: savedBook.name, message: 'Could not add book with genre' }
        );
      }
    }
    return response.status(201).json({ bookName: savedBook.name, message: 'Book added' });
  }

  /**
   * ### Get all books from the database
   * @param request
   * @param response
   * @returns 
   */
  static async getAllBooks(request: Request, response: Response) {
    // get number of items to skip
    const toSkipForPage = skipItemsForPage(request);

    const books = await dataSource.getAllBooks(true, toSkipForPage);
    const allBooks: Array<BookInterface> = books?.map((book) => {
      let bookObj: BookInterface = {
        name: book.name,
        id: book.id,
        quantity: book.quantity,
        users: book.booksToUsers?.length ? book.booksToUsers.map((user) => user.userId) : [],
        createdAt: book.createdAt
      };
      return bookObj;
    });
    return response.status(200).json(allBooks);
  }
}

export default Book;
