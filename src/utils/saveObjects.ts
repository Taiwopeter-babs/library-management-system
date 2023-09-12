/// <reference path='./lms.d.ts' />
import { NewLibrarian, NewBook } from "./interface";

import Book from "../controllers/BookController";
import Librarian from "../controllers/LibControllers";
import dataSource from "./dataSource";
import { hashPassword } from "./hashVerifyPassword";

export async function createNewLibrarian(librarianObj: NewLibrarian): Promise<boolean> {
  try {
    const { name, email, org_email, password } = librarianObj;
    const librarian = new Librarian();
    librarian.name = name;
    librarian.email = email;
    librarian.org_email = org_email;
    librarian.password = await hashPassword(password);
    await dataSource.saveLibrarian(librarian);
    return true;
  } catch (error) {
    return false;
  }
}

export async function createNewBook(bookObj: NewBook) {

  const { name, quantity, publisher } = bookObj;
  const book = new Book();
  book.name = name;
  book.quantity = quantity;
  book.publisher = publisher;
  const savedBook = await dataSource.saveBook(book);
  return savedBook;
}
