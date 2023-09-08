import { Column, Entity, OneToMany } from 'typeorm';
import { Request, Response } from 'express';

import Base from './BaseController';
import BooksUsers from './BookUserController';
import dataSource from '../utils/dataSource';


/**
 * User class mapped to `users` table
 */
@Entity('users')
class User extends Base {

  @Column({
    type: 'varchar',
    length: 256,
    nullable: false
  })
  name: string

  @Column({
    type: 'varchar',
    length: 256,
    nullable: false,
    unique: true
  })
  email: string

  // relationship books-users
  @OneToMany(() => BooksUsers, booksUsers => booksUsers.user)
  booksToUsers: BooksUsers[];

  /**
   * ### retrieves all users from the database
   * @param request request object
   * @param response response object
   */
  static async getAllUsers(request: Request, response: Response): Promise<Response> {
    const users = await dataSource.getAllUsers();
    return response.status(200).json(users);
  }
}

export default User;