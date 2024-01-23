import { Repository } from "typeorm";
import db from "../utils/dataSource";
import { TBook } from "../utils/interface";
import Book from "../models/Book";

type TUpdate = {
    name: string;
    quantity: number;
    publisher: string;
    updatedAt: Date
}


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

        const book = await this.queryBuilder.select('book')
            .leftJoinAndSelect("book.users", "users")
            .where("book.id = :id", { id: bookId })
            .getOne()
        return book;
    }

    static async getAllBooks(toSkip: number) {

        const books = await this.queryBuilder.select('book')
            .leftJoinAndSelect("book.users", "users")
            .skip(toSkip).take(25)
            .getMany()
        return books;
    }

    static async updateBook(bookId: string, data: TUpdate) {

        try {
            await this.queryBuilder.update(Book)
                .set({ ...data })
                .where("id = :bookId", { bookId })
                .execute();
            return true;
        } catch (error) {
            console.error(error);
            return false;
        }
    }

    static async deleteBook(bookId: string) {
        try {
            await this
                .queryBuilder.delete()
                .from(Book).where("id = :bookId", { bookId })
                .execute()
        } catch (error) {
            console.error(error);
            return false;
        }
    }

}