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
// add a book
router.post('/books', verifyAccessToken, Book.addBook);
// update a book
// delete a book
// get a book by id
// get all books - pagination by 25 books by page
// librarians authentication
router.post('/librarians/new', Librarian.postNewLibrarian);
router.post('/librarians/login', Librarian.loginLibrarian);
router.delete('/librarians/logout', verifyAccessToken, Librarian.logoutLibrarian);

export default router;
