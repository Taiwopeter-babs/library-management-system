import 'dotenv/config';
import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import { Secret } from 'jsonwebtoken';

import redisClient from '../utils/redis';
import dataSource from '../utils/dataSource';

type DecodedReturn = string | jwt.JwtPayload | undefined;
// type AwaitReturn = Awaited<ReturnType<() => Promise<DecodedReturn>>>


/**
 * ## Auth Class
 * create json web token
 * cache in redis with auth_<librarianId> for 5 days and send
 * access token in a secure http only cookie
 * whenever a librarian requests access to a protected route,
 * verify the jwt and check the cache if the token still exists
 */
class AuthAccess {
  static #secretKey: Secret | string = process.env.JWT ?? 'secret';
  // _secretKey: Secret | string;

  constructor() {
    // this._secretKey = this.#secretKey;
  }
  /**
 * creates and caches the access token for a librarian
 * @param librarianId id of librarian
 * @returns a promise
 */
  createAccessToken(librarianOrgEmail: string): Promise<string | undefined> {
    return new Promise((resolve, reject) => {
      /**
       * options for creating token:
       * LibrarianOrgEmail is the audience - will be used during verification
       */
      const options = {
        expiresIn: '5 days',
        audience: librarianOrgEmail
      }
      // create web token
      jwt.sign({ librarianOrgEmail }, AuthAccess.#secretKey, options, async (error, accessToken) => {
        if (error) {
          reject(error);
        }
        // cache token for five days in redis using librarianId
        const key = `auth_${librarianOrgEmail}`;
        await redisClient.set(key, accessToken, 432000);
        // token will be set in cookie
        resolve(accessToken);
      });
    });
  }

  /**
 * ### decodes the access token with jwt
 * @param accessToken access token to be decoded
 * @returns a promise object
 */
  async decodeAccessToken(accessToken: string): Promise<DecodedReturn> {
    return new Promise((resolve, reject) => {
      jwt.verify(accessToken, AuthAccess.#secretKey, async (error, decodedToken) => {
        if (error) {
          // Expired or some other error
          reject(new Error('Unauthorized'));
        }
        resolve(decodedToken)
      });
    })
  }

  /**
   * Middleware function to verify client(librarian) and authorize access
   * to protected endpoints
   * @param request
   * @param response
   * @param next 
   * @returns Nothing, grants access to the next function
   */
  async verifyAccessToken(request: Request, response: Response, next: NextFunction) {
    let librarianOrgEmail: string;

    // get access token from request cookie
    const accessToken: string = request.cookies.rememberUser;
    if (!accessToken) {
      return response.status(401).json({ error: 'Unauthorized' });
    }

    // verify access token
    try {
      const decodedToken: DecodedReturn = await this.decodeAccessToken(accessToken);
      if (!decodedToken || typeof decodedToken === 'string') {
        librarianOrgEmail = '';
      } else {
        librarianOrgEmail = decodedToken.librarianOrgEmail;
      }
      // get accessToken from cache, if not expired;
      // authentication is repeated here but required for better security
      const cachedaccessToken = await redisClient.get(`auth_${librarianOrgEmail}`);
      if (!cachedaccessToken) {
        return response.status(401).json({ error: 'Unauthorized' });
      }
      // verify user
      // verify user
      const librarian = await dataSource.getLibrarian(librarianOrgEmail, false);
      if (!librarian) {
        return response.status(401).json({ error: 'Unauthorized' });
      }
      // pass librarian org_email to next function
      response.locals.librarianOrgEmail = librarianOrgEmail;
      next();

    } catch (error) {
      // Unauthorized access
      console.error(error);
      return response.status(401).json({ error: 'Unauthorized' });
    }
  }
}

const authAccess = new AuthAccess();
export default authAccess;
