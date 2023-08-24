import { DataSource } from "typeorm";
import 'dotenv/config';

// import Author from "../authors";
import BooksUsers from "./BookUserController";
import Book from "./BookController";
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
  entities: [Book, User, BooksUsers],
  synchronize: true
})

class DataClass {

  /**
   * Initialize the database connection
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

  async saveUser(userObj: User) {

    if (!userObj) {
      throw new Error('Object cannot be of null value');
    }
    const usersRepo = dataSource.getRepository(User);

    await usersRepo.save(userObj);
  }

  async getBook(bookId: string): Promise<Book | null> {
    const booksRepo = dataSource.getRepository(Book);

    const book = await booksRepo.findOne({
      relations: {
        booksToUsers: true
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

  async saveBook(bookObj: Book) {

    if (!bookObj) {
      throw new Error('Object cannot be of null value');
    }
    const booksRepo = dataSource.getRepository(Book);

    await booksRepo.save(bookObj);
  }

  async saveUserBooks(userObj: User, bookObj: Book) {

    if (!userObj || !bookObj) {
      throw new Error('Object cannot be of null value');
    }
    const booksUsersRepo = dataSource.getRepository(BooksUsers);
    const newUserBooks = new BooksUsers();
    newUserBooks.user = userObj;
    newUserBooks.book = bookObj;

    await booksUsersRepo.save(newUserBooks);

    console.log('Books have been saved to user\'s collection!')
  }
}


export default DataClass;