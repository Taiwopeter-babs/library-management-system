import { Router } from 'express';

// middlewares
import TokenAuth from '../../middlewares/TokenAuth';
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
router.get('/users', TokenAuth.verifyAccessToken, User.getAllUsers);
router.get('/users/email/:userEmail', TokenAuth.verifyAccessToken, User.getUserByEmail);
router.get('/users/:id', TokenAuth.verifyAccessToken, CacheData.getData, User.getUserById);
router.post('/users', TokenAuth.verifyAccessToken, User.addUser);
router.post('/users/:id/books/:id', TokenAuth.verifyAccessToken, User.addBookToUser);

/**
 * BOOKS
 */
router.post('/books', TokenAuth.verifyAccessToken, Book.addBook);
router.get('/books', TokenAuth.verifyAccessToken, Book.getAllBooks);
router.get('/books/:id', TokenAuth.verifyAccessToken, CacheData.getData, Book.getBook);
router.put('/books/:id', TokenAuth.verifyAccessToken, Book.updateBook);
router.delete('/books/:id', TokenAuth.verifyAccessToken, Book.deleteBook);

/**
 * librarians
 */
router.post('/librarians/', Librarian.addLibrarian);
router.post('/librarians/login', Librarian.loginLibrarian);
router.get('/librarians', Librarian.getLibrarians);
router.get('/librarians/:id', TokenAuth.verifyAccessToken, Librarian.getLibrarianById);
router.get('/librarians/:email', TokenAuth.verifyAccessToken, Librarian.getLibrarianByEmail);
router.delete('/librarians/logout', TokenAuth.verifyAccessToken, Librarian.logoutLibrarian);

export default router;
