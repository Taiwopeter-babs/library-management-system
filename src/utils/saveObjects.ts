/// <reference path='./lms.d.ts' />
import { NewLibrarian, NewBook, UserInterface } from "./interface";

import Book from "../controllers/BookController";
import Librarian from "../controllers/LibControllers";
import User from "../controllers/UserController";

import dataSource from "./dataSource";
import { hashPassword } from "./hashVerifyPassword";

export async function createNewLibrarian(librarianObj: NewLibrarian) {
  let newLibrarian: Librarian;

  try {
    const { name, email, org_email, password } = librarianObj;
    const librarian = new Librarian();
    librarian.name = name;
    librarian.email = email;
    librarian.org_email = org_email;
    librarian.password = await hashPassword(password);
    newLibrarian = await dataSource.saveEntity(librarian);
  } catch (error) {
    return null;
  }
  return newLibrarian;
}

export async function createNewBook(bookObj: NewBook) {
  let savedBook: Book;

  const { name, quantity, publisher } = bookObj;
  const book = new Book();
  book.name = name;
  book.quantity = quantity;
  book.publisher = publisher;

  try {
    savedBook = await dataSource.saveEntity(book);
  } catch (error) {
    return null;
  }
  return savedBook;
}

export async function createNewUser(userObj: UserInterface) {
  let savedUser: User;

  const { name, email } = userObj;
  const user = new User();
  user.name = name;
  user.email = email;

  try {
    savedUser = await dataSource.saveEntity(user);
  } catch (error) {
    return null
  }
  return savedUser;
}
