import Book from "./src/controllers/BookController";
import User from "./src/controllers/UserController";
import DataClass from './src/controllers/dataSource';

const dataClass = new DataClass();


async function testSaveUserBooks() {

  await DataClass.load();

  const user = await dataClass.getUser('57b19454-703c-422d-8433-7344ad9586fa');

  if (user) {
    // console.log(user.booksToUsers.length)
    // for (const book of user.booksToUsers) {
    //   console.log(book);
    // }
    console.log(user);
    await DataClass.close();
    return;

  }

}

testSaveUserBooks();
