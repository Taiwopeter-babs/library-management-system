import { Request, Response } from 'express';

import { TBook } from '../utils/interface';

import CacheData from '../middlewares/CacheData';
import BookRepo from '../repositories/BookRepo';
import itemsToSkip from '../utils/pagination';



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
      return response.status(400).json({ statusCode: 400, error: 'Missing name' });
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

    const toSave: TBook = {
      name, publisher, quantity,
      authors: authors ? authors.join() : null,
      genres: genres ? genres.join() : null
    }

    try {
      const savedBook = await BookRepo.addBook(toSave);
      if (!savedBook) {
        return response.status(400).json({ statusCode: 400, error: 'Book not saved' });
      }
      const { id, createdAt, updatedAt } = savedBook;

      let bookObj: TBook = {
        id,
        name,
        quantity,
        publisher,
        authors,
        genres,
        createdAt,
        updatedAt
      };

      return response.status(201).json({ statusCode: 201, message: 'Book added', ...bookObj });

    } catch (error: any) {
      return response.status(500).json(
        { statusCode: 500, error: 'Internal Server Error' }
      );
    }
  }


  /**
   * ### Get all books from the database
   */
  static async getAllBooks(request: Request, response: Response) {
    // get number of items to skip
    const pagesToskip = itemsToSkip(request, 25);

    const books = await BookRepo.getAllBooks(pagesToskip);

    if (books.length === 0) {
      return response.status(200).json({ statusCode: 200, message: 'success', books });
    }

    const allBooks = books.map((book) => {
      let bookObj = {
        name: book.name,
        id: book.id,
        publisher: book.publisher,
        authors: book.authors ? book.authors.split(',') : [],
        genres: book.genres ? book.genres.split(',') : [],
        quantity: book.quantity,
        createdAt: book.createdAt,
        updatedAt: book.updatedAt
      };
      return bookObj;

    });
    return response.status(200).json({ statusCode: 200, message: 'success', ...allBooks });
  }

  /**
   * ### retrieves a book
   */
  static async getBook(request: Request, response: Response) {
    let idUsers: string[];

    const { bookId } = request.params;

    const book = await BookRepo.getBook(bookId);

    if (!book) {
      return response.status(404).json({ statusCode: 404, error: 'Book not found' });
    }

    // users linked to book
    if (book.booksToUsers.length > 0) {
      idUsers = book.booksToUsers.map((user) => user.userId)
    } else {
      idUsers = [];
    }

    let bookObj = {
      id: book.id,
      name: book.name,
      quantity: book.quantity,
      publisher: book.publisher,
      authors: book.authors ? book.authors.split(',') : [],
      genres: book.genres ? book.genres.split(',') : [],
      users: book.booksToUsers,
      createdAt: book.createdAt,
      updatedAt: book.updatedAt
    };

    // cache data for recurring requests
    await CacheData.setData(`${book.id}:data`, JSON.stringify(bookObj));

    return response.status(200).json({ statusCode: 200, ...bookObj });
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
      return response.status(404).json({ statusCode: 404, error: 'Book not found' });
    }

    // define object for update
    const data = {
      updatedAt: new Date(),
      ...{ name, quantity, publisher }
    };

    const isUpdated = await BookRepo.updateBook(id, data);
    if (!isUpdated) {
      return response.status(500).json({ statusCode: 500, error: 'Internal Server Error' });
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
      return response.status(404).json({ statusCode: 404, error: 'Book not found' });
    }

    const isDeleted = await BookRepo.deleteBook(id);
    if (!isDeleted) {
      return response.status(500).json({ statusCode: 500, error: 'Internal Server Error' });
    }
    return response.status(204).json({});
  }

}

export default BookController;
