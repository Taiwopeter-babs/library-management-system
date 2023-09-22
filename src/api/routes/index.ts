import { Router } from 'express';

// middlewares
import { verifyAccessToken } from '../../middlewares/authAccessToken';
// controllers
import User from '../../controllers/UserController';
import Librarian from '../../controllers/LibControllers';
import Book from '../../controllers/BookController';

// define router
const router = Router();

// endpoints
router.get('/users', verifyAccessToken, User.getAllUsers);
router.get('/users/:userEmail', verifyAccessToken, User.getUser);
router.post('/users', verifyAccessToken, User.addUser);
router.post('/users/:userId/books/:bookId', verifyAccessToken, User.addBookToUser);
// add a book
router.post('/books', verifyAccessToken, Book.addBook);
router.get('/books', verifyAccessToken, Book.getAllBooks);
// update a book
// delete a book
// get a book by id
// get all books - pagination by 25 books per page

// librarians authentication
router.post('/librarians/', Librarian.postNewLibrarian);
router.post('/librarians/login', Librarian.loginLibrarian);
router.delete('/librarians/logout', verifyAccessToken, Librarian.logoutLibrarian);

export default router;
