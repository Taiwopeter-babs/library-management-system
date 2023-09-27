import { Router } from 'express';

// middlewares
import { verifyAccessToken } from '../../middlewares/authAccess';
import CacheData from '../../middlewares/getSetCacheData';
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
router.get('/users', verifyAccessToken, User.getAllUsers);
router.get('/users/email/:userEmail', verifyAccessToken, User.getUserByEmail);
router.get('/users/id/:userId', verifyAccessToken, CacheData.getDataFromCache, User.getUserById);
router.post('/users', verifyAccessToken, User.addUser);
router.post('/users/:userId/books/:bookId', verifyAccessToken, User.addBookToUser);

/**
 * BOOKS
 */
router.post('/books', verifyAccessToken, Book.addBook);
router.get('/books', verifyAccessToken, Book.getAllBooks);
router.get('/books/:bookId', verifyAccessToken, CacheData.getDataFromCache, Book.getBook);
router.put('/books/:bookId', verifyAccessToken, Book.updateBook);
router.delete('/books/:bookId', verifyAccessToken, Book.deleteBook);

/**
 * librarians
 */
router.post('/librarians/', Librarian.postNewLibrarian);
router.post('/librarians/login', Librarian.loginLibrarian);
router.delete('/librarians/logout', verifyAccessToken, Librarian.logoutLibrarian);

export default router;
