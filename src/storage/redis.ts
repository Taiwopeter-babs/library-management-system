import { createClient } from "redis";
import type { RedisClientType } from "redis";


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
  async set(key: string, value: string) {
    const val = await this.redisClient.set(key, value, {
      EX: 432000,
      NX: true,
    });
    return val;
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
