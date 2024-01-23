import { Request, Response } from 'express';
import { setEmail, setPassword } from '../utils/getLibrarianEmail';
import TokenAuth from '../middlewares/TokenAuth';
import PasswordAuth from '../utils/passwordAuth';
import redisClient from '../utils/redis';
import { TLibrarian } from '../utils/interface';
import LibrarianRepo from '../repositories/LibrarianRepo';
import itemsToSkip from '../utils/pagination';


/**
 * Librarian controller
 */
class LibrarianController {


  /**
   * #### This endpoint uses the user's `name` to generate a unique
   * #### `org_email` and `password`. In case of forgotten password,
   * #### the original email is used to reset the password. 
   */
  static async addLibrarian(request: Request, response: Response) {
    const { email, name } = request.body;

    if (!email) {
      return response.status(400).json({ statusCode: 400, error: 'Missing email' });
    }
    if (!name) {
      return response.status(400).json({ statusCode: 400, error: 'Missing name' });
    }

    // generate unique email and password for user (Librarian)
    const [orgEmail, password] = await Promise.all([
      setEmail(name), setPassword()
    ]);

    // create new librarian
    const librarian: TLibrarian = {
      name, email, orgEmail, password
    }

    const librarianCreated = await LibrarianRepo.addLibrarian(librarian);
    if (!librarianCreated) {
      return response.status(400).json({ statusCode: 400, message: 'Librarian not added' });
    }

    return response.status(201).json(
      { statusCode: 201, id: librarianCreated.id, orgEmail, password, message: 'New Librarian created' }
    );
  }


  static async getLibrarianById(request: Request, response: Response) {
    const { id } = request.params;

    let idBooks: string[];

    if (typeof id !== 'string') {
      return response.status(400).json({ statusCode: 400, error: 'Invalid Paramter' });
    }

    try {
      const librarian = await LibrarianRepo.getLibrarian(id);
      if (!librarian) {
        return response.status(404).json({ statusCode: 404, error: 'Not Found' });
      }

      if (librarian.booksToLibrarians.length > 0) {
        idBooks = librarian.booksToLibrarians.map((book) => book.bookId)
      } else {
        idBooks = [];
      }

      const lib: TLibrarian = {
        id: librarian.id,
        name: librarian.name,
        email: librarian.email,
        orgEmail: librarian.orgEmail,
        books: idBooks,
        createdAt: librarian.createdAt,
        updatedAt: librarian.updatedAt
      };

      return response.status(200).json({ statusCode: 200, message: 'success', ...lib })
    } catch (error) {
      return response.status(201).json(
        { statusCode: 500, error: 'Internal Server Error' }
      );
    }

  }

  static async getLibrarianByEmail(request: Request, response: Response) {
    const { email } = request.params;

    let idBooks: string[];

    if (typeof email !== 'string') {
      return response.status(400).json({ statusCode: 400, error: 'Invalid Paramter' });
    }

    try {
      const librarian = await LibrarianRepo.getLibrarianByEmail(email);
      if (!librarian) {
        return response.status(404).json({ statusCode: 404, error: 'Not Found' });
      }

      if (librarian.booksToLibrarians.length > 0) {
        idBooks = librarian.booksToLibrarians.map((book) => book.bookId)
      } else {
        idBooks = [];
      }

      const lib: TLibrarian = {
        id: librarian.id,
        name: librarian.name,
        email: librarian.email,
        orgEmail: librarian.orgEmail,
        books: idBooks,
        createdAt: librarian.createdAt,
        updatedAt: librarian.updatedAt
      };

      return response.status(200).json({ statusCode: 200, message: 'success', ...lib })
    } catch (error) {
      return response.status(201).json(
        { statusCode: 500, error: 'Internal Server Error' }
      );
    }
  }

  static async getLibrarians(request: Request, response: Response) {
    const pagesToskip = itemsToSkip(request, 25);

    let idBooks: string[];



    try {
      const librarians = await LibrarianRepo.getAllLibrarians(pagesToskip);

      if (librarians.length === 0) {
        return response.status(200).json({ statusCode: 200, librarians });
      }


      const allLibrarians: Array<TLibrarian> = librarians.map((lib) => {
        let libObj: TLibrarian = {
          id: lib.id,
          name: lib.name,
          email: lib.email,
          orgEmail: lib.orgEmail,
          books: lib.booksToLibrarians.length ? lib.booksToLibrarians.map(b => b.bookId) : [],
          createdAt: lib.createdAt,
          updatedAt: lib.updatedAt
        }
        return libObj;
      })

      return response.status(200).json({ statusCode: 200, message: 'success', ...allLibrarians })
    } catch (error) {
      return response.status(201).json(
        { statusCode: 500, error: 'Internal Server Error' }
      );
    }

  }

  /**
   * ### login a librarian
   */
  static async loginLibrarian(request: Request, response: Response) {
    const { orgEmail, password } = request.body;

    if (!orgEmail) {
      return response.status(400).json({ statusCode: 400, error: 'Missing org_email' });
    }
    if (!password) {
      return response.status(400).json({ statusCode: 400, error: 'Missing password' });
    }

    // verify librarian
    const librarian = await LibrarianRepo.getLibrarian(orgEmail);
    if (!librarian) {
      return response.status(404).json({ statusCode: 400, error: 'Not found' });
    }

    // verify password
    const isVerified = await PasswordAuth.verifyPassword(password, librarian.password);
    if (!isVerified) {
      return response.status(400).json({ statusCode: 400, error: 'Wrong password' });
    }

    const accessToken = await TokenAuth.createAccessToken(orgEmail);

    // set access token in cookies; maxAge is 5 days
    response.cookie('rememberUser', accessToken, { httpOnly: true, maxAge: 432000 * 1000 });

    return response.status(200).json(
      { statusCode: 200, id: librarian.id, orgEmail, message: 'Login successful' }
    );
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

    return response.status(204).json({ statusCode: 204, message: 'Logout successful' });
  }
}

export default LibrarianController;
