/// <reference path='./lms.d.ts' />
import NewLibrarian from "./interface";

import Librarian from "../controllers/LibControllers";
import dataSource from "./dataSource";
import { hashPassword } from "./hashVerifyPassword";

export default async function createNewLibrarian(librarianObj: NewLibrarian): Promise<boolean> {
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
