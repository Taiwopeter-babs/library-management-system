import { Column, Entity, OneToMany } from 'typeorm';

import Base from './Base';
import BooksLibrarians from './BooksLibrarians';
import BooksUsers from './BooksUsers';


/**
 * Book class mapped to `books` table
 */
@Entity('books')
class Book extends Base {

    @Column({
        type: 'varchar',
        length: 256,
        nullable: false
    })
    name: string;

    @Column({
        type: "integer",
        default: 0
    })
    quantity: number;

    @Column({
        type: 'varchar',
        length: 128,
        nullable: true
    })
    publisher: string | null;

    @Column({
        type: 'varchar',
        length: 256,
        nullable: true
    })
    authors: string | null;

    @Column({
        type: 'varchar',
        length: 256,
        nullable: true
    })
    genres: string | null;

    // relationship books-users
    @OneToMany(() => BooksUsers, booksUsers => booksUsers.book)
    booksToUsers: BooksUsers[];

    // relationship books-librarians
    @OneToMany(() => BooksLibrarians, booksLibrarians => booksLibrarians.book)
    booksToLibrarians: BooksLibrarians[];
}

export default Book;
