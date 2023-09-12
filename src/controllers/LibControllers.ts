/// <reference path='../utils/lms.d.ts' />
import 'dotenv/config';
import { Column, Entity, OneToMany } from 'typeorm';

import { NewLibrarian } from '../utils/interface';
import Base from './BaseController';
import BooksLibrarians from './BooksLibrarianController';
import { Request, Response } from 'express';
import dataSource from '../utils/dataSource';

import { setUniqueEmail, setUnqiuePassword } from '../utils/getLibrarianEmail';
import { createAccessToken } from '../middlewares/authAccessToken';
import { verifyPassword } from '../utils/hashVerifyPassword';
import { createNewLibrarian } from '../utils/saveObjects';
import redisClient from '../utils/redis';


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
  booksToLibrarians: BooksLibrarians[];

  constructor() {
    super();
  }

  /**
   * #### This endpoint uses the user's `name` to generate a unique platform
   * #### `org_email` and `password`. In case of forgotten password,
   * #### the original email is used to reset the password.
   * @param request 
   * @param response 
   */
  static async postNewLibrarian(request: Request, response: Response) {
    const { email, name } = request.body;

    if (!email) {
      return response.status(400).json({ error: 'Missing email' });
    }
    if (!name) {
      return response.status(400).json({ error: 'Missing name' });
    }

    // generate unique email and password for user (Librarian)
    const [org_email, password] = await Promise.all([
      setUniqueEmail(name), setUnqiuePassword()
    ]);

    // create new librarian
    const newLibrarian: NewLibrarian = {
      name, email, org_email, password
    }
    // check for truthy result
    const librarianCreated = await createNewLibrarian(newLibrarian);
    if (!librarianCreated) {
      return response.status(400).json({ error: 'Librarian not added' });
    }
    // send the org_email and password
    return response.status(201).json(
      { org_email, password, message: 'New Librarian created' }
    );
  }

  /**
   * ### endpoint to login a librarian
   * @param request
   * @param response
   * @returns Response
   */
  static async loginLibrarian(request: Request, response: Response) {
    const { org_email, password } = request.body;
    if (!org_email) {
      return response.status(400).json({ error: 'Missing org_email' });
    }
    if (!password) {
      return response.status(400).json({ error: 'Missing password' });
    }
    // verify librarian
    const librarian = await dataSource.getLibrarian(org_email);
    if (!librarian) {
      return response.status(404).json({ error: 'Not found' });
    }
    // verify password
    const [passwordVerified, accessToken] = await Promise.all(
      [verifyPassword(password, librarian.password), createAccessToken(org_email)]);

    if (!passwordVerified) {
      return response.status(400).json({ error: 'Wrong password' });
    }

    // set access token in cookies; maxAge is 5 days
    response.cookie('rememberUser', accessToken, { httpOnly: true, maxAge: 432000 * 1000 });

    return response.status(200).json({ org_email, message: 'Login successful' });
  }


  /**
     * ### endpoint to logout a librarian
     * @param request
     * @param response
     * @returns Response
     */
  static async logoutLibrarian(request: Request, response: Response) {

    // clear cookie in response
    response.clearCookie('rememberUser');
    // get librarian org_email from middleware
    const librarianOrgEmail = response.locals.librarianOrgEmail;
    // delete access token from redis
    await redisClient.deleteKey(`auth_${librarianOrgEmail}`);

    return response.status(204).json({ message: 'Logout successful' });
  }
}

export default Librarian;
