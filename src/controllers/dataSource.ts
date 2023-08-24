import { DataSource } from "typeorm";
import 'dotenv/config';

import Author from "./AuthorController";
import Book from "./BookController";
import BooksAuthors from "./BookAuthorController";
import BooksGenres from "./BookGenreController";
import BooksUsers from "./BookUserController";
import Genre from "./GenreController";
import User from "./UserController";

/**
 * Sets up the database connection
 */
const dataSource = new DataSource({
  type: "mysql",
  host: process.env.HOST,
  port: parseInt(process.env.DB_PORT ?? '3306', 10),
  username: process.env.USERNAME,
  password: process.env.PASSWORD,
  database: process.env.DATABASE,
  entities: [Author, Book, Genre,
    User, BooksAuthors, BooksGenres,
    BooksUsers
  ],
  synchronize: true
})

/**
 * class to load database and control connections
 */
class DataClass {

  /**
   * Initializes the database connection
   */
  static async load() {
    await dataSource.initialize()
      .then(() => {
        console.log("Data Source has been initialized!");
      })
      .catch((err) => {
        console.error("Error during Data Source initialization", err);
      })
  }

  /**
   * closes the database connection
   */
  static async close() {
    await dataSource.destroy();
  }

  /**
   * get an author object from the database
   * @param authorId author Id
   * @returns a Promise Author object or null
   */
  async getAuthor(authorId: string): Promise<Author | null> {
    const authorsRepo = dataSource.getRepository(Author);

    const author = await authorsRepo.findOne({
      relations: {
        booksToAuthors: true
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
   * get a book from the database
   * @param bookId book Id
   * @returns a Promise Book object or null value
   */
  async getBook(bookId: string): Promise<Book | null> {
    const booksRepo = dataSource.getRepository(Book);

    const book = await booksRepo.findOne({
      relations: {
        booksToUsers: true,
        booksToAuthors: true,
        booksToGenres: true
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
   * 
   * @param userId user's Id
   * @returns a Promise User object or null
   */
  async getGenre(genreId: string): Promise<Genre | null> {
    const genresRepo = dataSource.getRepository(Genre);

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
   * 
   * @param userId user's Id
   * @returns a Promise User object or null
   */
  async getUser(userId: string): Promise<User | null> {
    const usersRepo = dataSource.getRepository(User);

    const user = await usersRepo.findOne({
      relations: {
        booksToUsers: true
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
   * saves an author to the database
   * @param author Author object
   */
  async saveAuthor(author: Author) {

    if (!author) {
      throw new Error('Object cannot be of null value');
    }
    const authorsRepo = dataSource.getRepository(Author);

    await authorsRepo.save(author);
  }

  /**
   * save a book to the database
   * @param book Book object
   */
  async saveBook(book: Book) {

    if (!book) {
      throw new Error('Object cannot be of null value');
    }
    const booksRepo = dataSource.getRepository(Book);

    await booksRepo.save(book);
  }

  async saveGenre(genre: Genre) {

    if (!genre) {
      throw new Error('Object cannot be of null value');
    }
    const genresRepo = dataSource.getRepository(Genre);

    await genresRepo.save(genre);
  }

  /**
   * saves a user object to the database
   * @param user User object
   */
  async saveUser(user: User) {

    if (!user) {
      throw new Error('Object cannot be of null value');
    }
    const usersRepo = dataSource.getRepository(User);

    await usersRepo.save(user);
  }


  /**
   * connect a book to an author's object
   * @param author author object
   * @param book Book object
   */
  async saveAuthorBooks(author: Author, book: Book) {

    if (!author || !book) {
      throw new Error('Object cannot be of null value');
    }
    const booksAuthorsRepo = dataSource.getRepository(BooksAuthors);
    const newAuthorBooks = new BooksAuthors();

    [newAuthorBooks.author, newAuthorBooks.book] = [author, book];
    await booksAuthorsRepo.save(newAuthorBooks);

    console.log('Books have been saved to author\'s collection!')
  }

  /**
   * connect a book to a user's object
   * @param user user object
   * @param book Book object 
   */
  async saveGenreBooks(genre: Genre, book: Book) {

    if (!genre || !book) {
      throw new Error('Object cannot be of null value');
    }
    const booksGenresRepo = dataSource.getRepository(BooksGenres);
    const newGenreBooks = new BooksGenres();

    [newGenreBooks.genre, newGenreBooks.book] = [genre, book];
    await booksGenresRepo.save(newGenreBooks);

    console.log('Books have been saved to genre\'s collection!')
  }

  /**
   * connect a book to a user's object
   * @param user user object
   * @param book Book object 
   */
  async saveUserBooks(user: User, book: Book) {

    if (!user || !book) {
      throw new Error('Object cannot be of null value');
    }
    const booksUsersRepo = dataSource.getRepository(BooksUsers);
    const newUserBooks = new BooksUsers();

    [newUserBooks.user, newUserBooks.book] = [user, book];
    await booksUsersRepo.save(newUserBooks);

    console.log('Books have been saved to user\'s collection!')
  }
}


export default DataClass;