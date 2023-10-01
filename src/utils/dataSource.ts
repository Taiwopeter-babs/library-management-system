import { DataSource, Driver, DataSourceOptions, Like } from "typeorm";
import 'dotenv/config';

import setOrmConfig from "./ormConfig";

import Author from "../controllers/AuthorController";
import Book from "../controllers/BookController";
import BooksAuthors from '../controllers/BookAuthorController';
import BooksGenres from "../controllers/BookGenreController";
import BooksLibrarians from "../controllers/BooksLibrarianController";
import BooksUsers from "../controllers/BookUserController";
import Genre from "../controllers/GenreController";
import Librarian from "../controllers/LibControllers";
import User from "../controllers/UserController";
import { EntityInterface, EntityNameType, EntityType, entityConstructors } from "./interface";

/**
 * class to load database and control connections
 */
class DataClass {

  dataSource: DataSource;

  /**
   * ### Initializes the database connection
   */
  constructor(ormConfig: DataSourceOptions) {

    this.dataSource = new DataSource({ ...ormConfig });

    // initialize database connection
    this.dataSource.initialize()
      .then(() => {
        console.log("Data Source has been initialized!");
      })
      .catch((err) => {
        console.error("Error during Data Source initialization", err);
      });
  }

  /**
   * ### get an author object from the database
   * @param authorId author Id
   * @returns a Promise Author object or null
   */
  async getAuthor(authorId: string, relation: boolean = false): Promise<Author | null> {
    const authorsRepo = this.dataSource.getRepository(Author);

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
    const authorsRepo = this.dataSource.getRepository(Author);

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

  async getBookByName(bookName: string, relation: boolean = false): Promise<Book | null> {
    const booksRepo = this.dataSource.getRepository(Book);

    const book = await booksRepo.findOne({
      select: {
        id: true
      },
      where: {
        name: Like(`${bookName}%`),
      }
    });
    return book;
  }

  async getGenreByName(genreName: string, relation: boolean = false): Promise<Genre | null> {
    const genresRepo = this.dataSource.getRepository(Genre);

    const genre = await genresRepo.findOne({
      select: {
        id: true
      },
      where: {
        name: Like(`${genreName}%`),
      }
    });
    return genre;
  }

  /**
   * ### get a book from the database
   * @param bookId book Id
   * @returns a Promise Book object or null value
   */
  async getBook(bookId: string, relation: boolean = false): Promise<Book | null> {
    const booksRepo = this.dataSource.getRepository(Book);

    const book = await booksRepo.findOne({
      relations: {
        booksToUsers: relation,
        booksToAuthors: relation,
        booksToGenres: relation,
        booksToLibrarians: relation
      },
      where: {
        id: bookId
      }
    })
    if (!book) {
      return null;
    }
    return book;
  }

  /**
   * ### Gets a genre
   * @param userId user's Id
   * @returns a Promise User object or null
   */
  async getGenre(genreId: string): Promise<Genre | null> {
    const genresRepo = this.dataSource.getRepository(Genre);

    const genre = await genresRepo.findOne({
      relations: {
        booksToGenres: true
      },
      where: {
        id: genreId
      }
    });
    if (!genre) {
      return null;
    }
    return genre;
  }

  /**
   * ### Gets a librarian object
   * @param librarianEmail
   * @returns a `Librarian` object
   */
  async getLibrarian(librarianEmail: string, relation: boolean = false) {
    const libRepo = this.dataSource.getRepository(Librarian);

    const librarian = await libRepo.findOne({
      where: {
        org_email: librarianEmail
      },
      relations: {
        booksToLibrarians: relation
      }
    });
    if (!librarian) {
      return null;
    }
    return librarian;
  }


  /**
   * ## gets a user
   * @param userId user's Id
   * @param relation load relation with books; default value is false
   * @returns a Promise User object or null
   */
  async getUser(userId: string, relation: boolean = false): Promise<User | null> {
    const usersRepo = this.dataSource.getRepository(User);

    const user = await usersRepo.findOne({
      relations: {
        booksToUsers: relation
      },
      where: {
        id: userId
      }
    });
    if (!user) {
      return null;
    }
    return user;
  }

  /**
   * ## gets a user
   * @param userEmail user's email
   * @param relation load relation with books; default value is false
   * @returns a Promise User object or null
   */
  async getUserByEmail(userEmail: string, relation: boolean = false): Promise<User | null> {
    const usersRepo = this.dataSource.getRepository(User);

    const user = await usersRepo.findOne({
      relations: {
        booksToUsers: relation
      },
      where: {
        email: userEmail
      }
    });
    if (!user) {
      return null;
    }
    return user;
  }

  /**
   * ### get all books from the database, paginated by 25 books per page
   * @param relation a boolean to load users relations with books:
   * - default value is false
   * @returns a Promise User array
   */
  async getAllBooks(relation: boolean = false, toSkipForPage: number): Promise<Book[]> {
    const booksRepo = this.dataSource.getRepository(Book);

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
    const usersRepo = this.dataSource.getRepository(User);

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
  async saveEntity<EntityType>(entity: EntityType, entityName: string): Promise<EntityType> {
    if (!entity) {
      throw new Error('Object cannot be null');
    }
    const EntityTypeCon = entityConstructors[entityName];
    try {
      const entityRepo = this.dataSource.getRepository(EntityTypeCon);
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
      const booksAuthorsRepo = this.dataSource.getRepository(BooksAuthors);
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
    const booksGenresRepo = this.dataSource.getRepository(BooksGenres);
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
    const booksUsersRepo = this.dataSource.getRepository(BooksUsers);
    const booksLibrariansRepo = this.dataSource.getRepository(BooksLibrarians);

    const newLibrarianBooks = new BooksLibrarians();
    const newUserBooks = new BooksUsers();

    [newUserBooks.user, newUserBooks.book] = [user, book];
    [newLibrarianBooks.librarian, newLibrarianBooks.book] = [issuer, book];

    await Promise.allSettled([
      booksUsersRepo.save(newUserBooks), booksLibrariansRepo.save(newLibrarianBooks)
    ]);
  }

  /**
   * ### Updates an entity in the database with query builder
   * @param entityName name of entity to be mapped
   * @param toUpdate Object to update with
   */
  async updateEntity(entityName: EntityNameType, toUpdate: EntityInterface) {
    const { id, ...dataToUpdate } = toUpdate;
    const EntityTypeCon = entityConstructors[entityName];
    try {
      const updatedEntity = await this.dataSource
        .createQueryBuilder()
        .update(EntityTypeCon)
        .set({ ...dataToUpdate })
        .where("id = :id", { id })
        .execute();
    } catch (error) {
      throw new Error('Could not Update entity');
    }
  }

  async deleteEntity(entityName: EntityNameType, objId: string) {
    const EntityTypeCon = entityConstructors[entityName];

    try {
      await this.dataSource
        .createQueryBuilder()
        .delete()
        .from(EntityTypeCon)
        .where("id = :id", { id: objId })
        .execute();
    } catch (error) {
      throw new Error('Could not delete entity');
    }
  }
}

// Get database configuration
const ormConfig: DataSourceOptions = setOrmConfig();

const dataSource = new DataClass(ormConfig);

export default dataSource;
