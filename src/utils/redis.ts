import { createClient } from "redis";
import type { RedisClientType } from "redis";
import { BookInterface, UserInterface } from "./interface";


/**
 * ## redis client for caching
 */
class RedisClient {
  redisClient: RedisClientType
  constructor() {
    this.redisClient = createClient();
    this.redisClient.on('connect', () => {
      console.log('connected to redis server');
    }).on('error', (error) => {
      console.log('Connection to redis failed', error);
    });
  }

  async connectToRedis() {
    await this.redisClient.connect();
  }

  /**
   * ### get the value of a key from redis
   */
  async get(key: string) {
    const value = await this.redisClient.get(key);
    return value;
  }

  /**
   * ### set the value of a key in redis
   */
  async set(key: string, value: any, duration: number) {
    await this.redisClient.set(key, value, {
      EX: duration,
      NX: true,
    });
  }

  async hSet(hashKey: string, fields: any) {
    try {
      await this.redisClient.hSet(hashKey, fields);
    } catch (error) {
      console.error(error);
      throw new Error('hSetError');
    }
  }


  async hGetAll(hashKey: string) {
    try {
      const cachedData = await this.redisClient.hGetAll(hashKey);
      // An object is returned; empty or otherwise
      if (Object.keys(cachedData).length === 0) {
        return null;
      }
      const { updatedAt, createdAt, name, ...rest } = cachedData;
      const returnData = {
        updatedAt: new Date(updatedAt),
        createdAt: new Date(createdAt),
        name,
        ...rest
      }
      return returnData;
    } catch (error) {
      throw new Error('hGetError');
    }
  }

  async listPush(listKey: string, array: Array<string>) {
    try {
      for await (let item of array) {
        await this.redisClient.lPush(listKey, item);
      }
    } catch (error) {
      throw new Error('lPushError');
    }
  }

  async listRange(key: string | null | undefined) {
    if (!key) {
      return null;
    }
    try {
      const result = await this.redisClient.lRange(key, 0, -1);
      if (!result) {
        return null;
      }
      return result
    } catch (error) {
      console.error(error);
      throw new Error('lRangeError');
    }

  }


  /**
  * ### deletes a key in redis
  */
  async deleteKey(key: string) {
    await this.redisClient.del(key)
  }
}

const redisClient = new RedisClient();
export default redisClient;
