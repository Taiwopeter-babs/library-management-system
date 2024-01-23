import { Request, Response, NextFunction } from "express";
import redisClient from "../utils/redis";
import { TCache } from "../utils/interface";


export default class CacheData {

    static async getData(req: Request, res: Response, next: NextFunction) {

        const { id } = req.params;
        const key = `${id}:data`;

        const data = await redisClient.get(key)

        if (!data) {
            // pass to next function in middleware
            return next();
        }

        const cachedResult: TCache = {
            ...JSON.parse(data)
        };

        return res.status(200).json({ message: 'success', ...cachedResult });
    }

    static async setData(key: string, data: string) {

        try {
            await redisClient.set(key, data);
        } catch (error: any) {
            console.log(error.message);
        }
    }
}
