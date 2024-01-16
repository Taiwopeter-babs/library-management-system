import { Request, Response } from 'express';
import { setEmail, setPassword } from '../utils/getLibrarianEmail';
import { createAccessToken } from '../middlewares/authAccess';
import PasswordAuth from '../utils/passwordAuth';
import redisClient from '../utils/redis';
import { TLibrarian } from '../utils/interface';
import LibrarianRepo from '../repositories/LibrarianRepo';


/**
 * Librarian controller
 */
class LibrarianController {


  /**
   * #### This endpoint uses the user's `name` to generate a unique platform
   * #### `org_email` and `password`. In case of forgotten password,
   * #### the original email is used to reset the password. 
   */
  static async addLibrarian(request: Request, response: Response) {
    const { email, name } = request.body;

    if (!email) {
      return response.status(400).json({ error: 'Missing email' });
    }
    if (!name) {
      return response.status(400).json({ error: 'Missing name' });
    }

    // generate unique email and password for user (Librarian)
    const [org_email, password] = await Promise.all([
      setEmail(name), setPassword()
    ]);

    // create new librarian
    const librarian: TLibrarian = {
      name, email, org_email, password
    }

    const librarianCreated = await LibrarianRepo.addLibrarian(librarian);
    if (!librarianCreated) {
      return response.status(400).json({ error: 'Librarian not added' });
    }

    return response.status(201).json(
      { id: librarianCreated.id, org_email, password, message: 'New Librarian created' }
    );
  }

  /**
   * ### login a librarian
   */
  static async loginLibrarian(request: Request, response: Response) {
    const { org_email, password } = request.body;

    if (!org_email) {
      return response.status(400).json({ error: 'Missing org_email' });
    }
    if (!password) {
      return response.status(400).json({ error: 'Missing password' });
    }

    // verify librarian
    const librarian = await LibrarianRepo.getLibrarian(org_email);
    if (!librarian) {
      return response.status(404).json({ error: 'Not found' });
    }

    // verify password
    const isVerified = await PasswordAuth.verifyPassword(password, librarian.password);
    if (!isVerified) {
      return response.status(400).json({ error: 'Wrong password' });
    }

    const accessToken = await createAccessToken(org_email);

    // set access token in cookies; maxAge is 5 days
    response.cookie('rememberUser', accessToken, { httpOnly: true, maxAge: 432000 * 1000 });

    return response.status(200).json({ id: librarian.id, org_email, message: 'Login successful' });
  }


  /**
     * ### endpoint to logout a librarian
     * @param request
     * @param response
     * @returns Response
     */
  static async logoutLibrarian(request: Request, response: Response) {

    // clear cookie in response
    response.clearCookie('rememberUser');
    // get librarian org_email from middleware
    const librarianOrgEmail = response.locals.librarianOrgEmail;
    // delete access token from redis
    await redisClient.deleteKey(`auth_${librarianOrgEmail}`);

    return response.status(204).json({ message: 'Logout successful' });
  }
}

export default LibrarianController;
