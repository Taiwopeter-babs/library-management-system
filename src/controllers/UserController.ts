import { Column, Entity, OneToMany } from 'typeorm';
import { Request, Response } from 'express';

import Base from './BaseController';
import BooksUsers from './BookUserController';
import dataSource from '../utils/dataSource';

import CreateEntity from '../utils/createEntity';
import { EntityInterface, UserInterface } from '../utils/interface';
import skipItemsForPage from '../utils/pagination';

/**
 * ### User class mapped to `users` table
 */
@Entity('users')
class User extends Base {

  @Column({
    type: 'varchar',
    length: 256,
    nullable: false
  })
  name: string

  @Column({
    type: 'varchar',
    length: 256,
    nullable: false,
    unique: true
  })
  email: string

  // relationship books-users
  @OneToMany(() => BooksUsers, booksUsers => booksUsers.user)
  booksToUsers: BooksUsers[];

  /**
   * ### retrieves all users from the database
   * @param request request object
   * @param response response object
   */
  static async getAllUsers(request: Request, response: Response): Promise<Response> {

    const toSkipForPage = skipItemsForPage(request);

    const users = await dataSource.getAllUsers(true, toSkipForPage);
    const allUsers: Array<UserInterface> = users?.map((user) => {
      let userObj: UserInterface = {
        name: user.name,
        email: user.email,
        id: user.id,
        books: user.booksToUsers?.length ? user.booksToUsers.map((book) => book.bookId) : [],
        createdAt: user.createdAt
      }
      return userObj;
    });
    return response.status(200).json(allUsers);
  }

  /**
   * ### retrieves a user from the database
   * @param request request object
   * @param response response object
   */
  static async getUserByEmail(request: Request, response: Response): Promise<Response> {
    const { userEmail } = request.params;
    if (!userEmail) {
      return response.status(400).json({ error: 'Missing email' });
    }
    const user = await dataSource.getUserByEmail(userEmail, true);
    if (!user) {
      return response.status(404).json({ error: 'Not found' });
    }
    const userObj: UserInterface = {
      name: user.name,
      email: user.email,
      id: user.id,
      books: user.booksToUsers?.length ? user.booksToUsers.map((book) => book.bookId) : [],
      createdAt: user.createdAt
    };

    return response.status(200).json(userObj)
  }

  /**
   * ### retrieves a user from the database
   * @param request request object
   * @param response response object
   */
  static async getUserById(request: Request, response: Response): Promise<Response> {
    const { userId } = request.params;
    if (!userId) {
      return response.status(400).json({ error: 'Missing Id' });
    }
    const user = await dataSource.getUser(userId, true);
    if (!user) {
      return response.status(404).json({ error: 'Not found' });
    }
    const userObj: UserInterface = {
      id: user.id,
      name: user.name,
      email: user.email,
      books: user.booksToUsers?.length ? user.booksToUsers.map((book) => book.bookId) : [],
      createdAt: user.createdAt
    };

    return response.status(200).json(userObj)
  }



  /**
   * ### Add a new user
   * @param request
   * @param response
   */
  static async addUser(request: Request, response: Response) {
    const { name, email } = request.body;
    if (!name) {
      return response.status(400).json({ error: 'Missing name' });
    }
    if (!email) {
      return response.status(400).json({ error: 'Missing email' });
    }
    const user = await dataSource.getUserByEmail(email);
    if (user) {
      return response.status(400).json({ error: 'User already exists' });
    }
    // create a new user
    const newUser = await CreateEntity.newUser({ name, email });
    const userBooks = newUser?.booksToUsers?.length ? newUser.booksToUsers.map((book) => book.bookId) : [];

    const userObj: UserInterface = {
      id: newUser?.id,
      name,
      email,
      createdAt: newUser?.createdAt,
      books: userBooks
    };

    return response.status(201).json({ ...userObj })
  }

  /**
   * ### add books to user collection
   * @param request
   * @param response
   */
  static async addBookToUser(request: Request, response: Response) {
    const { userId, bookId } = request.params;

    if (!userId) {
      return response.status(400).json({ error: 'Missing user Id' });
    }
    if (!bookId) {
      return response.status(400).json({ error: 'Missing book Id' });
    }
    // get user, book and current librarian to issue book
    const libOrgEmail: string = response.locals.librarianOrgEmail;

    const [userObj, bookObj, librarian] = await Promise.all([
      dataSource.getUser(userId, true), dataSource.getBook(bookId), dataSource.getLibrarian(libOrgEmail)
    ]);

    // VERIFY USER, BOOK AND LIBRARIAN
    if (!userObj) {
      return response.status(404).json({ error: 'User not found' });
    }
    if (!bookObj) {
      return response.status(404).json({ error: 'Book not found' });
    }
    // check book quantity
    if (bookObj.quantity === 0) {
      return response.status(200).json({ bookId: bookObj.id, message: 'Out of stock' })
    }
    if (!librarian) {
      return response.status(404).json({ error: 'Librarian not found' });
    }
    // check if book is in user's collection
    const userBookIndex = userObj.booksToUsers?.map((book) => book.bookId).indexOf(bookObj.id);

    if (userBookIndex !== -1) {
      return response.status(200).json({ userId, bookId, message: 'Book already issued' });
    }

    // issue book to user and update quantity
    const bookInfoToUpdate: EntityInterface = {
      id: bookObj.id, updatedAt: new Date(), quantity: bookObj.quantity - 1
    };

    // ensures that books are issued and book info is updated
    Promise.allSettled(
      [dataSource.issueBooksToUser(userObj, bookObj, librarian),
      dataSource.updateEntity('Book', bookInfoToUpdate)
      ]).then((results) => {
        let hasError = false; // flag to track errors

        results.forEach((res) => {
          if (res.status !== 'fulfilled') {
            hasError = true;
          }
        });

        if (hasError) {
          return response.status(400).json(
            {
              error: 'Could not add book to user',
              borrowerId: userId,
              bookId
            }
          );
        } else {
          // Return object definition
          const toReturn = {
            bookId,
            bookName: bookObj.name,
            bookQuantity: bookInfoToUpdate.quantity,
            borrowerId: userId,
            issuerId: librarian.id,
          }
          return response.status(200).json(toReturn);
        }

      }).catch((error) => {
        console.error(error);
        response.status(400).json(
          {
            error: 'Could not add book to user',
            borrowerId: userId,
            bookId
          });
      });
  }
}

export default User;