import { TLibrarian } from "../utils/interface";
import dbClient from "../storage/dataSource";
import { ObjectId } from 'mongodb';
import { v4 as uuidv4 } from 'uuid';



export default class LibrarianRepo {

    private static readonly projection = {
        projection: {
            id: 1, name: 1, orgEmail: 1,
            email: 1, books: 1, createdAt: 1, updatedAt: 1
        },
    };
    private static readonly id = uuidv4();

    static async addLibrarian(librarian: TLibrarian) {

        try {
            const savedLibrarian = await dbClient.db.collection('librarians').insertOne(
                { id: this.id, ...librarian }
            );

            return { id: savedLibrarian.insertedId, ...librarian };
        } catch (error) {
            console.error(error);
            return null;
        }
    }

    /**
     * gets a librarian by id
     */
    static async getLibrarian(librarianId: string) {

        const librarian = await dbClient.db.collection('librarians').findOne(
            { id: librarianId },
            {
                projection: {
                    id: 1, name: 1, orgEmail: 1,
                    email: 1, books: 1,
                    createdAt: 1, updatedAt: 1
                },
            }
        )
        return librarian;
    }

    static async getLibrarianByEmail(orgEmail: string, loadBooks = false) {

        const librarian = await dbClient.db.collection('librarians').findOne(
            { orgEmail: orgEmail },
            {
                projection: {
                    _id: 0, id: 1, name: 1, orgEmail: 1, password: 1,
                    email: 1, createdAt: 1, updatedAt: 1
                },
            }
        );
        return librarian;
    }

    static async getAllLibrarians(toSkip: number) {

        try {
            const librarians = await dbClient.db.collection('librarians').aggregate([
                { $skip: toSkip },
                { $limit: 25 },
                { $project: { _id: 0 } }
            ]).toArray();

            console.log(librarians);

            return librarians;
        } catch (error) {
            throw error;
        }

    }


    static async deleteLibrarian(librarianId: string) {
        try {
            const result = await dbClient.db.collection('librarians').deleteOne(
                { _id: new ObjectId(librarianId) }
            );
            console.log(result);
            return true;
        } catch (error) {
            console.error(error);
            return false;
        }
    }

}