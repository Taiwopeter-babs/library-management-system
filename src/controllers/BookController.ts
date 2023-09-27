import { Column, Entity, OneToMany } from 'typeorm';
import { Request, Response } from 'express';

import Author from './AuthorController';
import Genre from './GenreController';
import Base from './BaseController';
import BooksAuthors from './BookAuthorController';
import BooksGenres from './BookGenreController';
import BooksLibrarians from './BooksLibrarianController';
import BooksUsers from './BookUserController';

import CreateEntity from '../utils/createEntity';
import { BookInterface, CacheInterface, EntityInterface, UserInterface } from '../utils/interface';
import dataSource from '../utils/dataSource';
// background jobs
import { addAuthorsToQueueAndProcess, addGenresToQueueAndProcess } from '../processJobs';
import skipItemsForPage from '../utils/pagination';
import CacheData from '../middlewares/getSetCacheData';


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

  // ========== ENDPOINTS =============== //

  /**
   * ### adds a new book to the `books` table
   */
  static async addBook(request: Request, response: Response) {
    let usersArray: string[];
    let authorsArray: string[];
    let genresArray: string[];

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
    const savedBook = await CreateEntity.newBook({ name, quantity, publisher });
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

    let bookObj: BookInterface = {
      id: savedBook.id,
      name: savedBook.name,
      quantity: savedBook.quantity,
      users: [],
      authors,
      genres,
      createdAt: savedBook.createdAt,
      updatedAt: savedBook.updatedAt
    };
    return response.status(201).json({ ...bookObj, message: 'Book added' });
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
        createdAt: book.createdAt,
        updatedAt: book.updatedAt
      };
      return bookObj;
    });
    return response.status(200).json(allBooks);
  }

  /**
   * ### retrieves a book with links to users
   * @param request
   * @param response
   * @returns Response with a user object
   */
  static async getBook(request: Request, response: Response) {
    let usersArray: string[];

    const { bookId } = request.params;
    const book = await dataSource.getBook(bookId, true);
    if (!book) {
      return response.status(404).json({ error: 'Book not found' });
    }

    // create links to users
    if (book.booksToUsers.length > 0) {
      usersArray = book.booksToUsers.map((user) => `http://0.0.0.0:5000/api/users/${user.userId}`)
    } else {
      usersArray = [];
    }


    let bookObj: CacheInterface = {
      id: book.id,
      name: book.name,
      quantity: book.quantity,
      users: usersArray,
      createdAt: book.createdAt,
      updatedAt: book.updatedAt
    };

    // cache data for recurring requests
    await CacheData.setDataToCache(bookObj);

    return response.status(200).json({ ...bookObj });
  }

  /**
   * ### Updates a book. Only `name`, `quantity`, and `publisher` can be updated
   * @param request
   * @param response
   */
  static async updateBook(request: Request, response: Response) {
    let name: string, quantity: number, publisher: string;

    ({ name, quantity, publisher } = request.body);
    const { bookId } = request.params;

    // get object
    const book = await dataSource.getBook(bookId);
    if (!book) {
      return response.status(404).json({ error: 'Book not found' });
    }

    // define object for update
    const updateObj: EntityInterface = {
      id: book.id,
      updatedAt: new Date(),
      ...{ name, quantity, publisher }
    };

    dataSource.updateEntity('Book', updateObj)
      .then(() => {
        return response.status(200).json(updateObj);
      }).catch((error) => {
        return response.status(500).json({ error: 'Internal Server Error' });
      });
  }
  /**
   * ### Deletes a book.
   * @param request
   * @param response
   */
  static async deleteBook(request: Request, response: Response) {

    const { bookId } = request.params;

    // get object
    const book = await dataSource.getBook(bookId);
    if (!book) {
      return response.status(404).json({ error: 'Book not found' });
    }

    dataSource.deleteEntity('Book', book.id)
      .then(() => {
        return response.status(204).send({});
      }).catch((error: Error | undefined) => {
        return response.status(400).json({ error: 'Unsuccessful deletion' });
      });
  }

}

export default Book;
