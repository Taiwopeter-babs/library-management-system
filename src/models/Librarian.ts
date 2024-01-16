/// <reference path='../utils/lms.d.ts' />
import 'dotenv/config';
import { Column, Entity, OneToMany } from 'typeorm';

import Base from './Base';
import BooksLibrarians from './BooksLibrarians';


/**
 * Librarian class mapped to `librarians` table
 */
@Entity('librarians')
class Librarian extends Base {


  @Column({
    type: 'varchar',
    length: 100,
    nullable: false,
    unique: true
  })
  name: string;

  @Column({
    type: 'varchar',
    length: 128,
    unique: true
  })
  email: string;

  @Column({
    type: 'varchar',
    length: 128,
    unique: true
  })
  org_email: string;

  @Column({
    type: 'varchar',
    length: 256,
    nullable: false
  })
  password: string;

  // relationship books-librarians
  @OneToMany(() => BooksLibrarians, booksLibrarians => booksLibrarians.librarian)
  booksToLibrarians?: BooksLibrarians[];
}

export default Librarian;
