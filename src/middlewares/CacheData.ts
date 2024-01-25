import { Request, Response, NextFunction } from "express";
import redisClient from "../storage/redis";
import { TCache } from "../utils/interface";


export default class CacheData {

    static async getData(req: Request, res: Response, next: NextFunction) {

        const { id, email } = req.params;

        // use id or email
        const key = `${!id ? email : id}:data`;

        const data = await redisClient.get(key);

        console.log(data, 'data from cache');

        if (!data) {
            // pass to next function in middleware
            return next();
        }

        const cachedResult: TCache = {
            ...JSON.parse(data)
        };

        return res.status(200).json({ statusCode: 200, message: 'success', ...cachedResult });
    }

    static async setData(key: string, data: string) {

        try {
            const result = await redisClient.set(key, data);
            return result;
        } catch (error: any) {
            console.log(error.message);
        }
    }
}
