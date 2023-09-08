import express from 'express';

// middlewares
import { verifyAccessToken } from '../../middlewares/authAccessToken';
// controllers
import User from '../../controllers/UserController';
import Librarian from '../../controllers/LibControllers';

// define router
const router = express.Router();

// endpoints
router.get('/users', verifyAccessToken, User.getAllUsers);
router.post('/librarians/login', verifyAccessToken, Librarian.loginLibrarian);

export default router;
