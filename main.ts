import Book from "./src/controllers/BookController";
import User from "./src/controllers/UserController";
import dataClass from './src/utils/dataSource';

import Librarian from './src/controllers/LibControllers';




async function testSaveLibBooks() {

  const lib = await dataClass.getLibrarian('6b457dbc-93f2-414d-866c-fb8900dc7bcf');
  const user = await dataClass.getUser('57b19454-703c-422d-8433-7344ad9586fa');
  const book = await dataClass.getBook('874d14f2-61bb-4d95-b08e-bce44f5465c0');

  console.log(lib);
  console.log(user);
  console.log(book);

  // if (lib && user && book) {
  //   // await dataClass.issueBooksToUser(user, book, lib);
  //   const libupdate = await dataClass.getLibrarian('6b457dbc-93f2-414d-866c-fb8900dc7bcf');
  //   const bookupdate = await dataClass.getBook('874d14f2-61bb-4d95-b08e-bce44f5465c0');
  //   console.log(libupdate);
  //   console.log(bookupdate)
  // }

  await dataClass.close();

}

testSaveLibBooks();
