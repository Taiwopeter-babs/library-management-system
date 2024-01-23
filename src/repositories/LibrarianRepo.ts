import db from "../utils/dataSource";
import { TLibrarian } from "../utils/interface";
import Librarian from "../models/Librarian";



export default class LibrarianRepo {

    private static repo = db.getRepo<Librarian>(new Librarian);
    private static queryBuilder = this.repo.createQueryBuilder('librarian');

    static async addLibrarian(librarian: TLibrarian) {
        let savedLibrarian: TLibrarian;

        try {
            savedLibrarian = await this.repo.save(librarian);
        } catch (error) {
            return null;
        }
        return savedLibrarian;
    }

    static async getLibrarian(librarianId: string) {

        const librarian = await this.queryBuilder.select('Librarian')
            .leftJoinAndSelect("librarian.books", "books")
            .where("librarian.id = :id", { id: librarianId })
            .getOne()
        return librarian;
    }

    static async getLibrarianByEmail(orgEmail: string) {

        const librarian = await this.queryBuilder.select('Librarian')
            .leftJoinAndSelect("librarian.books", "books")
            .where("librarian.org_email = :librarianEmail", { orgEmail })
            .getOne()
        return librarian;
    }

    static async getAllLibrarians(pagesToskip: number) {

        const librarian = await this.queryBuilder.select('Librarian')
            .leftJoinAndSelect("librarian.users", "users")
            .skip(pagesToskip).take(25)
            .getMany()
        return librarian;
    }


    static async deleteLibrarian(librarianId: string) {
        try {
            await this
                .queryBuilder.delete()
                .from(Librarian).where("id = :LibrarianId", { librarianId })
                .execute()
        } catch (error) {
            console.error(error);
            return false;
        }
    }

}