import { Request, Response } from 'express';

import Author from './AuthorController';
import Genre from './GenreController';
import Base from './BaseController';
import BooksAuthors from './BookAuthorController';
import BooksGenres from './BookGenreController';
import BooksLibrarians from './BooksLibrarianController';
import BooksUsers from './BookUserController';

import CreateEntity from '../utils/createEntity';
import { BookInterface, CacheInterface, EntityInterface, TBook, UserInterface } from '../utils/interface';
import dataSource from '../utils/dataSource';
// background jobs
import { addAuthorsToQueueAndProcess, addGenresToQueueAndProcess } from '../backgroundJobs';
import skipItemsForPage from '../utils/pagination';
import CacheData from '../middlewares/getSetCacheData';
import BookRepo from '../repositories/BookRepo';


/**
 * Book class mapped to `books` table
 */
class BookController {

  /**
   * ### adds a new book
   */
  static async addBook(request: Request, response: Response) {
    // regex to validate quantity input
    const checkDigit = /^[0-9]+$/g;

    // authors and genres are arrays of authors and genres respectively
    let { name, quantity, publisher, authors, genres } = request.body;

    // validate input
    if (!name) {
      return response.status(400).json({ error: 'Missing name' });
    }

    if (quantity) {
      // check if it's a number
      if (!checkDigit.test(quantity)) {
        quantity = 0;
      } else {
        quantity = parseInt(quantity, 10);
      }
    } else {
      quantity = 0;
    }

    if (!publisher) {
      publisher = null;
    }

    const savedBook = await BookRepo.addBook({ name, quantity, publisher });
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

      switch (error.message) {

        case "Author absent":
          return response.status(201).json(
            { bookName: savedBook.name, message: 'Could not add book with author' }
          );
        case "Genre absent":
          return response.status(201).json(
            { bookName: savedBook.name, message: 'Could not add book with genre' }
          );

      }
    }

    const { id, createdAt, updatedAt } = savedBook;

    let bookObj: TBook = {
      id,
      name,
      quantity,
      publisher,
      users: [],
      authors,
      genres,
      createdAt,
      updatedAt
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
   * ### retrieves a book
   * @param request
   * @param response
   * @returns Response with a user object
   */
  static async getBook(request: Request, response: Response) {
    let idUsers: string[];
    let idAuthors: string[];

    const { bookId } = request.params;

    const book = await BookRepo.getBook(bookId, true);

    if (!book) {
      return response.status(404).json({ error: 'Book not found' });
    }

    // users linked to book
    if (book.booksToUsers.length > 0) {
      idUsers = book.booksToUsers.map((user) => user.userId)
    } else {
      idUsers = [];
    }

    // authors linked to book


    let bookObj: CacheInterface = {
      id: book.id,
      name: book.name,
      quantity: book.quantity,
      users: idUsers,
      createdAt: book.createdAt,
      updatedAt: book.updatedAt
    };

    // cache data for recurring requests
    // await CacheData.setDataToCache(bookObj);

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
