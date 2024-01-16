import { Repository } from "typeorm";
import db from "../utils/dataSource";
import { TBook } from "../utils/interface";
import Book from "../models/Book";


export default class BookRepo {

    private static repo = db.getRepo<Book>(new Book);
    private static queryBuilder = this.repo.createQueryBuilder('book');

    static async addBook(book: TBook) {
        let savedBook: TBook;

        try {
            savedBook = await this.repo.save(book);
        } catch (error) {
            return null;
        }
        return savedBook;
    }

    static async getBook(bookId: string) {

        const book = this.repo.createQueryBuilder('book')
            .leftJoinAndSelect("book.users", "users")
            .leftJoinAndSelect("book.authors", "authors")
            .leftJoinAndSelect("book.genres", "genres")
            .where("book.id = :id", { id: bookId })
            .getSql()
        return book;
    }

}