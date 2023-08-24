import Book from "./src/models/books";
import User from "./src/models/users";
import DataClass from './src/models/database/dataSource';




async function testSaveUserBooks() {

  const dataClass = new DataClass();
  await dataClass.load();
  console.log('done');

  const book = new Book();
  book.name = 'My Life Story';
  book.quantity = 6;
  await dataClass.saveBook(book)

  const user = new User();
  user.email = 'test2@email.com';
  user.name = 'taiwo peter';
  await dataClass.saveUser(user);

  await dataClass.saveUserBooks(user, book);

  const nUser = await dataClass.getUser(user.id);
  if (!nUser) {
    console.log('User does not exist')
  } else {
    console.log(nUser.id, nUser.booksToUsers);
  }
  return;
}

testSaveUserBooks();
