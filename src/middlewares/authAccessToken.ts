import 'dotenv/config';
import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import { Secret } from 'jsonwebtoken';

import redisClient from '../utils/redis';
import dataSource from '../utils/dataSource';

/** create json web token
 * cache in redis with auth_<librarianId> for 5 days and send
 * access token in a secure http only cookie
 * whenever a librarian requests access to a protected route,
 * verify the jwt and check the cache if the token still exists
 */


const secretKey: Secret | string = process.env.JWT ?? 'secret';

/**
 * creates and caches the access token for a librarian
 * @param librarianId id of librarian
 * @returns a promise
 */
export function createAccessToken(librarianEmail: string) {
  return new Promise((resolve, reject) => {
    /**
     * options for creating token:
     * LibrarianEmail is the audience - will be used during verification
     */
    const options = {
      expiresIn: '5 days',
      audience: librarianEmail
    }
    // create web token
    jwt.sign({ librarianEmail }, secretKey, options, async (error, accessToken) => {
      if (error) {
        reject(error);
      }
      // cache token for five days in redis using librarianId
      const key = `auth_${librarianEmail}`;
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
const decodeAccessToken = (accessToken: string) => {
  return new Promise((resolve, reject) => {
    jwt.verify(accessToken, secretKey, async (error, decodedToken) => {
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
export async function verifyAccessToken(request: Request, response: Response, next: NextFunction) {
  // get access token from request cookie
  const accessToken: string = request.cookies.accessToken;
  if (!accessToken) {
    return response.status(401).json({ error: 'Unauthorized' });
  }

  // verify access token
  try {

    const decodedToken: any = await decodeAccessToken(accessToken);
    const librarianEmail = decodedToken.librarianEmail;
    // get accessToken from cache, if not expired;
    // authentication is repeated here but required for better security
    const cachedaccessToken = await redisClient.get(`auth_${librarianEmail}`);
    if (!cachedaccessToken) {
      return response.status(401).json({ error: 'Unauthorized' });
    }
    // verify user
    // verify user
    const librarian = await dataSource.getLibrarian(librarianEmail, false);
    if (!librarian) {
      return response.status(404).json({ error: 'Not found' });
    }
    return next();

  } catch (error) {
    // Unauthorized access
    return response.status(401).json({ error: 'Unauthorized' });
  }
}
