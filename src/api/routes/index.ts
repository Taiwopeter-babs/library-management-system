import { Router } from 'express';

// middlewares
import { verifyAccessToken } from '../../middlewares/authAccess';
import CacheData from '../../middlewares/CacheData';
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
router.get('/users/:id', verifyAccessToken, CacheData.getData, User.getUserById);
router.post('/users', verifyAccessToken, User.addUser);
router.post('/users/:id/books/:id', verifyAccessToken, User.addBookToUser);

/**
 * BOOKS
 */
router.post('/books', verifyAccessToken, Book.addBook);
router.get('/books', verifyAccessToken, Book.getAllBooks);
router.get('/books/:id', verifyAccessToken, CacheData.getData, Book.getBook);
router.put('/books/:id', verifyAccessToken, Book.updateBook);
router.delete('/books/:id', verifyAccessToken, Book.deleteBook);

/**
 * librarians
 */
router.post('/librarians/', Librarian.postNewLibrarian);
router.post('/librarians/login', Librarian.loginLibrarian);
router.delete('/librarians/logout', verifyAccessToken, Librarian.logoutLibrarian);

export default router;
