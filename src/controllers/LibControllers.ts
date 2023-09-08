import 'dotenv/config';
import { Column, Entity, OneToMany } from 'typeorm';

import Base from './BaseController';
import BooksLibrarians from './BooksLibrarianController';
import { Request, Response } from 'express';
import dataSource from '../utils/dataSource';

import setUniqueEmail from '../utils/getLibrarianEmail';
import { verifyPassword } from '../utils/hashVerifyPassword';


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
   * ### endpoint to login a librarian
   * @param request
   * @param response
   * @returns Response
   */
  static async loginLibrarian(request: Request, response: Response) {
    const { email, password } = request.body;
    // verify librarian
    const librarian = await dataSource.getLibrarian(email);
    if (!librarian) {
      return response.status(404).json({ error: 'Not found' });
    }
    // verify password
    const passwordVerified = await verifyPassword(password, librarian.password);
    if (!passwordVerified) {
      return response.status(400).json({ error: 'Wrong password' });
    }

    return response.status(200).json({ id: librarian.id, message: 'Login successful' });

  }


}

export default Librarian;
