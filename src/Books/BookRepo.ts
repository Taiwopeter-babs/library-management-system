import dbClient from "../storage/dataSource";
import { TBook } from "../utils/interface";
import { ObjectId } from 'mongodb';


type TUpdate = {
    name: string;
    quantity: number;
    publisher: string;
};


export default class BookRepo {

    private static readonly db = dbClient.db;
    private static readonly projection = {
        projection: {
            _id: 0, id: '$_id', name: 1, publisher: 1,
            quantity: 1, authors: 1, genres: 1
        },
    };


    static async addBook(book: TBook) {
        try {
            const savedBook = await this.db.collection('books').insertOne(book);

            return { id: savedBook.insertedId, ...book };

        } catch (error) {
            console.error(error);
        }
    }

    static async getBook(bookId: string) {
        try {
            const book = await this.db.collection('books').findOne(
                { _id: new ObjectId(bookId) },
                {
                    projection: this.projection,
                });
            return book;
        } catch (error) {
            console.error(error);
        }

    }

    static async getAllBooks(toSkip: number) {
        try {
            const books = await this.db.collection('books').aggregate([
                { $skip: toSkip },
                { $limit: 25 },
                { $project: this.projection }
            ]).toArray();

            return books;
        } catch (error) {
            console.error(error);
        }
    }

    static async updateBook(bookId: string, data: TUpdate) {

        try {
            const updated = await this.db.collection('books').updateOne(
                { _id: new ObjectId(bookId) },
                {
                    $set: { ...data, },
                    $currentDate: { updatedAt: true }
                },
            );
            console.log(updated);
            return true;
        } catch (error) {
            console.error(error);
            return false;
        }
    }

    static async deleteBook(bookId: string) {

        try {
            const result = await this.db.collection('books').deleteOne(
                { _id: new ObjectId(bookId) }
            );

            console.log(result);
            return true;
        } catch (error) {
            console.error(error);
            return false;
        }
    }

}