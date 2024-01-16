import Book from "../controllers/BookController";
import Librarian from "../controllers/LibControllers";
import User from "../controllers/UserController";

import dataSource from "./dataSource";
import PasswordAuth from "./passwordAuth";


/**
 * ### CreateEntity class
 */
export default class CreateEntity {

  static async newLibrarian(librarianObj: NewLibrarian) {
    let savedEntity: Librarian;

    const { name, email, org_email, password } = librarianObj;
    const librarian = new Librarian();
    librarian.name = name;
    librarian.email = email;
    librarian.org_email = org_email;

    // hash password and save to database
    try {
      const hash = await PasswordAuth.hashPassword(password);
      librarian.password = hash;
      savedEntity = await dataSource.saveEntity(librarian, 'Librarian');
    } catch (error) {
      return null;
    }
    return savedEntity;
  }


  static async newUser(userObj: UserInterface) {
    let savedUser: User;

    const { name, email } = userObj;
    const user = new User();
    user.name = name;
    user.email = email;

    try {
      savedUser = await dataSource.saveEntity(user, 'User');
    } catch (error) {
      return null
    }
    return savedUser;
  }
}