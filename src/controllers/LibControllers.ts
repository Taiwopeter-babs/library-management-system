import 'dotenv/config';
import { Column, Entity, OneToMany } from 'typeorm';

import Base from './BaseController';
import BooksLibrarians from './BooksLibrarianController';



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
    length: 256,
    nullable: false
  })
  password: string;

  // relationship books-librarians
  @OneToMany(() => BooksLibrarians, booksLibrarians => booksLibrarians.librarian)
  booksToLibrarians: BooksLibrarians[];

  constructor() {
    super();
  }

  /**
   * hash user's password
   */
  hashPassword() {

  }

  /**
   * verify user's password
   */
  verifyPassword() {

  }

  /**
   * Generate email field. A unique email is assigned
   * to each librarian with suffix - `@lms.com`
   */
  static setUniqueEmail(username: string): string {
    let nameForEmail;

    // remove leading and trailing whitespaces if any
    const nameArray = username.trim().split(' ');

    // first two names are chosen for the email, a single name works
    if (nameArray.length >= 2) {
      nameForEmail = nameArray.splice(0, 2).join('_');
    } else {
      nameForEmail = nameArray[0];
    }
    return `${nameForEmail.toLowerCase()}_${Librarian.generateRandom(3)}@lmsmail.com`;
  }

  /**
   * Generates a unique login password for the user.
   * @returns a unique password string
   */
  static generateRandom(numLength: number): string {

    let result = '';

    const chars = process.env.RANDOM_CHARACTERS;
    const charsLength = chars?.length;

    let count = 0;

    while (count < numLength) {
      result += chars?.charAt(Math.floor(Math.random() * (charsLength ?? 10)));
      count += 1;
    }
    return result;
  }
}

export default Librarian;
