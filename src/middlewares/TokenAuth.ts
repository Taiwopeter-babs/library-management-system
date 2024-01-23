import 'dotenv/config';
import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';

import redisClient from '../utils/redis';
import LibrarianRepo from '../repositories/LibrarianRepo';

type DecodedReturn = string | jwt.JwtPayload | undefined;
const secretKey = process.env.JWT || 'secret';



export default class TokenAuth {

    /**
    * creates and caches the access token for a librarian
    */
    static createAccessToken(orgEmail: string): Promise<string> {
        return new Promise((resolve, reject) => {
            /**
             * options for creating token:
             * LibrarianOrgEmail is the audience - will be used during verification
             */
            const options = {
                expiresIn: '5 days',
                audience: orgEmail
            }
            // create web token
            jwt.sign({ orgEmail }, secretKey, options, async (error, accessToken) => {
                if (error) {
                    reject(error);
                }

                // cache token for five days in redis using librarianId
                const key = `auth_${orgEmail}`;
                const value = accessToken as string;
                await redisClient.set(key, value);

                // token will be set in cookie
                resolve(value);
            });
        });
    }

    /**
    * ### decodes the access token with jwt
    */
    private static decodeAccessToken(accessToken: string): Promise<DecodedReturn> {
        return new Promise((resolve, reject) => {
            jwt.verify(accessToken, secretKey, async (error, decodedToken) => {
                if (error) {
                    // Expired or some other error
                    console.error(error);
                    reject(new Error('Unauthorized'));
                }
                resolve(decodedToken);
            });
        })
    }


    /**
     * Middleware function to verify client(librarian) and authorize access
     * to protected endpoints
     */
    static async verifyAccessToken(request: Request, response: Response, next: NextFunction) {
        let orgEmail: string;
        const unauthorizedError = { statusCode: 401, error: 'Unauthorized Access To Resource' };

        // get access token from request cookie
        const accessToken: string = request.cookies.rememberUser;
        if (!accessToken) {
            return response.status(401).json(unauthorizedError);
        }

        // verify access token
        try {
            const decodedToken: DecodedReturn = await TokenAuth.decodeAccessToken(accessToken);
            if (!decodedToken || typeof decodedToken === 'string') {
                orgEmail = '';
            } else {
                orgEmail = decodedToken.librarianOrgEmail;
            }

            // get accessToken from cache, if not expired;
            // authentication is repeated here but required for better security
            const cachedaccessToken = await redisClient.get(`auth_${orgEmail}`);
            if (!cachedaccessToken) {
                return response.status(401).json(unauthorizedError);
            }

            // verify user
            const librarian = await LibrarianRepo.getLibrarian(orgEmail);
            if (!librarian) {
                return response.status(401).json(unauthorizedError);
            }

            // pass librarian org_email to next function
            response.locals.librarianOrgEmail = orgEmail;
            next();

        } catch (error) {
            // Unauthorized access
            console.error(error);
            return response.status(401).json(unauthorizedError);
        }
    }

}

