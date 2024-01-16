import { Request, Response } from 'express';

import { TBook } from '../utils/interface';

import { addAuthorsToQueueAndProcess, addGenresToQueueAndProcess } from '../backgroundJobs';
import skipItemsForPage from '../utils/pagination';
import CacheData from '../middlewares/getSetCacheData';
import BookRepo from '../repositories/BookRepo';


/**
 * Book controller
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

    const books = await BookRepo.getAllBooks(toSkipForPage);
    const allBooks: Array<TBook> = books?.map((book) => {
      let bookObj: TBook = {
        name: book.name,
        id: book.id,
        publisher: book.publisher,
        quantity: book.quantity,
        createdAt: book.createdAt,
        updatedAt: book.updatedAt
      };
      return bookObj;
    });
    return response.status(200).json({ message: 'success', ...allBooks });
  }

  /**
   * ### retrieves a book
   */
  static async getBook(request: Request, response: Response) {
    let idUsers: string[];
    let idAuthors: string[];

    const { bookId } = request.params;

    const book = await BookRepo.getBook(bookId);

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

    let bookObj = {
      id: book.id,
      name: book.name,
      quantity: book.quantity,
      users: book.booksToUsers,
      createdAt: book.createdAt,
      updatedAt: book.updatedAt
    };

    // cache data for recurring requests
    await CacheData.setData(`${book.id}:data`, JSON.stringify(bookObj));

    return response.status(200).json({ ...bookObj });
  }


  /**
   * ### Updates a book. Only `name`, `quantity`, and `publisher` can be updated
   */
  static async updateBook(request: Request, response: Response) {
    let name: string, quantity: number, publisher: string;

    ({ name, quantity, publisher } = request.body);
    const { id } = request.params;

    // get object
    const book = await BookRepo.getBook(id);
    if (!book) {
      return response.status(404).json({ error: 'Book not found' });
    }

    // define object for update
    const data = {
      updatedAt: new Date(),
      ...{ name, quantity, publisher }
    };

    const isUpdated = await BookRepo.updateBook(id, data);
    if (!isUpdated) {
      return response.status(500).json({ error: 'Internal Server Error' });
    }
    return response.status(200).json(data);

  }
  /**
   * ### Deletes a book.
   * @param request
   * @param response
   */
  static async deleteBook(request: Request, response: Response) {

    const { id } = request.params;

    // get object
    const book = await BookRepo.getBook(id);
    if (!book) {
      return response.status(404).json({ error: 'Book not found' });
    }

    const isDeleted = await BookRepo.deleteBook(id);
    if (!isDeleted) {
      return response.status(500).json({ error: 'Internal Server Error' });
    }
    return response.status(204).json({});
  }

}

export default BookController;
