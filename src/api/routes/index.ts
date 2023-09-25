import { Router } from 'express';

// middlewares
import authAccess from '../../middlewares/authAccess';
// controllers
import User from '../../controllers/UserController';
import Librarian from '../../controllers/LibControllers';
import Book from '../../controllers/BookController';

// define router
const router = Router();

/**
 * ENDPOINTS
 */
// USERS
router.get('/users', authAccess.verifyAccessToken, User.getAllUsers);
router.get('/users/:userEmail', authAccess.verifyAccessToken, User.getUserByEmail);
router.get('/users/id/:userId', authAccess.verifyAccessToken, User.getUserById);
router.post('/users', authAccess.verifyAccessToken, User.addUser);
router.post('/users/:userId/books/:bookId', authAccess.verifyAccessToken, User.addBookToUser);

/**
 * BOOKS
 */
router.post('/books', authAccess.verifyAccessToken, Book.addBook);
router.get('/books', authAccess.verifyAccessToken, Book.getAllBooks);
router.get('/books/:bookId', authAccess.verifyAccessToken, Book.getBook);
router.put('/books/:bookId', authAccess.verifyAccessToken, Book.updateBook);
router.delete('/books/:bookId', authAccess.verifyAccessToken, Book.deleteBook);

/**
 * librarians
 */
router.post('/librarians/', Librarian.postNewLibrarian);
router.post('/librarians/login', Librarian.loginLibrarian);
router.delete('/librarians/logout', authAccess.verifyAccessToken, Librarian.logoutLibrarian);

export default router;
