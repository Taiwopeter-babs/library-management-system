import {
  DataSource,
  DataSourceOptions, Like,
} from "typeorm";

import setOrmConfig from "./ormConfig";

import Author from "../models/Author";
import Book from "../models/Book";
import BooksAuthors from '../models/BooksAuthors';
import BooksGenres from "../models/BooksGenres";
import BooksLibrarians from "../models/BooksLibrarians";
import BooksUsers from "../models/BooksUsers";
import Genre from "../models/Genre";
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
   * ### get an author object from the database
   * @param authorId author Id
   * @returns a Promise Author object or null
   */
  async getAuthor(authorId: string, relation: boolean = false): Promise<Author | null> {
    const authorsRepo = this.db.getRepository(Author);

    const author = await authorsRepo.findOne({
      relations: {
        booksToAuthors: relation
      },
      where: {
        id: authorId
      }
    });
    if (!author) {
      return null;
    }
    return author;
  }
  /**
   * ### get an author object by name from the database
   * @param authorId author Id
   * @returns a Promise Author object or null
   */
  async getAuthorByName(authorName: string, relation: boolean = false): Promise<Author | null> {
    const authorsRepo = this.db.getRepository(Author);

    const author = await authorsRepo.findOne({
      select: {
        id: true
      },
      where: {
        name: Like(`${authorName}%`),
      },
      relations: {
        booksToAuthors: relation
      }
    });
    return author;
  }


  /**
   * ### get all books from the database, paginated by 25 books per page
   * @param relation a boolean to load users relations with books:
   * - default value is false
   * @returns a Promise User array
   */
  async getAllBooks(relation: boolean = false, toSkipForPage: number): Promise<Book[]> {
    const booksRepo = this.db.getRepository(Book);

    const books = await booksRepo.find({
      relations: {
        booksToUsers: relation,
      },
      skip: toSkipForPage,
      take: 25
    });
    return books;
  }

  /**
   * ### get all users from the database
   * @param relation a boolean to load books relations with books;
   * default value is false
   * @returns a Promise User array
   */
  async getAllUsers(relation: boolean = false, toSkipForPage: number): Promise<User[]> {
    const usersRepo = this.db.getRepository(User);

    // paginate by 25 items
    const users = await usersRepo.find({
      relations: {
        booksToUsers: relation,
      },
      skip: toSkipForPage,
      take: 25
    });
    return users;
  }

  /**
   * ### saves an entity of types `Author, User, Books, Genre, Librarian`
   * @param entity entity object to be saved to the database
   * @returns the saved entity
   */
  async saveEntity<T>(entity: T, name: string): Promise<T> {
    if (!entity) {
      throw new Error('Object cannot be null');
    }
    try {
      const entityRepo = this.getRepo(entity);
      const savedEntity = await entityRepo.save(entity);
      return savedEntity;
    } catch (error) {
      console.error(error);
      throw new Error('Entity not saved');
    }
  }


  /**
   * ## connect a book to an author's object
   * @param author author object
   * @param book Book object
   */
  async saveAuthorBooks(author: Author, book: Book) {

    if (!author || !book) {
      throw new Error('Object cannot be of null value');
    }
    try {
      const booksAuthorsRepo = this.db.getRepository(BooksAuthors);
      const newAuthorBooks = new BooksAuthors();

      [newAuthorBooks.author, newAuthorBooks.book] = [author, book];
      await booksAuthorsRepo.save(newAuthorBooks);
      return true;
    } catch (error) {
      throw new Error('Cannot link author with book');
    }
  }

  /**
   * ## connect a book to a genre
   * @param user user object
   * @param book Book object 
   */
  async saveGenreBooks(genre: Genre, book: Book) {

    if (!genre || !book) {
      throw new Error('Object cannot be of null value');
    }
    const booksGenresRepo = this.db.getRepository(BooksGenres);
    const newGenreBooks = new BooksGenres();

    [newGenreBooks.genre, newGenreBooks.book] = [genre, book];
    await booksGenresRepo.save(newGenreBooks);
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
