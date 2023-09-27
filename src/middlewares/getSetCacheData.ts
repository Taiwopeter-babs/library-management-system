import { Request, Response, NextFunction } from "express";
import redisClient from "../utils/redis";
import { CacheInterface } from "../utils/interface";

let hashKey: string;
let usersKey: string;
let booksKey: string;

export default class CacheData {
    static async getDataFromCache(req: Request, res: Response, next: NextFunction) {

        const { bookId, userId } = req.params;
        // construct keys
        if (bookId) {
            hashKey = `${bookId}:data`;
            usersKey = `${bookId}:users`;
        } else {
            hashKey = `${userId}:data`;
            booksKey = `${userId}:books`;
        }

        const [hashResult, listUsers, listBooks] = await Promise.all([
            redisClient.hGetAll(hashKey),
            redisClient.listRange(usersKey),
            redisClient.listRange(booksKey),
        ]);
        /**
         * hashResult is the object, while listUsers and listBooks are the
         * arrays of users or books, if any.
         * If hashResult is null, there are no arrays cached
         */
        if (!hashResult) {
            // pass to next function in middleware
            return next();
        }

        const cachedResult: CacheInterface = {
            ...hashResult,
        };
        /**
         * get list and add to property based on cached arrays
         * object with users property cannot have books property
         * and vice versa
         */
        if (listUsers && listUsers.length !== 0) {
            cachedResult.users = listUsers;
        }
        if (listBooks && listBooks.length !== 0) {
            cachedResult.books = listBooks;
        }
        return res.status(200).json(cachedResult);
    }

    static async setDataToCache(objCache: CacheInterface) {
        const { updatedAt, createdAt, users, books, ...rest } = objCache;
        // date should be in string format
        const toCache = {
            updatedAt: updatedAt?.toString(),
            createdAt: createdAt?.toString(),
            ...rest,
        };
        try {
            // arrays are cached separately
            if (users) {
                await redisClient.listPush(`${objCache?.id}:users`, users);
            }
            if (books) {
                await redisClient.listPush(`${objCache?.id}:books`, books);
            }
            // cache object data in a hash
            await redisClient.hSet(`${objCache?.id}:data`, toCache);
        } catch (error: any) {
            console.log(error.message);
        }
    }
}
