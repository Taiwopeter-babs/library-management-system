import {
  DataSource,
  DataSourceOptions, Like,
} from "typeorm";

import setOrmConfig from "./ormConfig";


import Book from "../models/Book";
import BooksLibrarians from "../models/BooksLibrarians";
import BooksUsers from "../models/BooksUsers";
import Librarian from "../models/Librarian";
import User from "../models/User";



/**
 * class to load database and control connections
 */
class DataClass {

  db: DataSource;

  /**
   * ### Initializes the database connection
   */
  constructor(ormConfig: DataSourceOptions) {

    this.db = new DataSource({ ...ormConfig });

    // initialize database connection
    this.db.initialize()
      .then(() => {
        console.log("Data Source has been initialized!");
      })
      .catch((err) => {
        console.error("Error during Data Source initialization", err);
      });
  }

  getRepo<T>(entity: T) {
    return this.db.getRepository<T>(entity);
  }



  /**
   * ### issue a book to a user/client
   * @param user receiver of book
   * @param book book to be issued
   * @param issuer issuer of book
   */
  async issueBooksToUser(user: User, book: Book, issuer: Librarian) {

    if (!user || !book || !issuer) {
      throw new Error('Object cannot be of null value');
    }
    const booksUsersRepo = this.db.getRepository(BooksUsers);
    const booksLibrariansRepo = this.db.getRepository(BooksLibrarians);

    const newLibrarianBooks = new BooksLibrarians();
    const newUserBooks = new BooksUsers();

    [newUserBooks.user, newUserBooks.book] = [user, book];
    [newLibrarianBooks.librarian, newLibrarianBooks.book] = [issuer, book];

    await Promise.allSettled([
      booksUsersRepo.save(newUserBooks), booksLibrariansRepo.save(newLibrarianBooks)
    ]);
  }
}

// Get database configuration
const ormConfig: DataSourceOptions = setOrmConfig();

const db = new DataClass(ormConfig);

export default db;
