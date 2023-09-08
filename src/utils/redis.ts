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
      console.log('connected to redis server')
    }).on('error', (error) => {
      console.log('Connetion to redis failed', error);
    });
  }

  /**
   * ### get the value of a key from redis
   */
  async get(key: string) {
    const value = this.redisClient.get(key);
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
}

const redisClient = new RedisClient();
export default redisClient;