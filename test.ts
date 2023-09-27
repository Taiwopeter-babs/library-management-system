import { createClient } from "redis";

interface UserInterface {
    name: string;
    email: string;
    id: number;
    books?: Array<string>;
    createdAt: Date;
    updatedAt: Date;
}

console.log()

const testObj: UserInterface = {
    name: "tee",
    email: "tee@,com",
    id: 1,
    books: ['first book', 'second book'],
    createdAt: new Date(),
    updatedAt: new Date()
}


const redisClient = createClient();

const connectClient = async () => {
    await redisClient.connect();

    if (redisClient.isOpen && redisClient.isReady) {
        console.log('listening');
    }
}

redisClient.on('connect', () => {
    console.log('connected');
}).on('error', (error) => {
    console.log('Connection to redis failed', error);
});

async function hSet(hashKey: string, fields: any) {
    const { updatedAt, createdAt, ...rest } = fields;
    const toCache = {
        updatedAt: updatedAt.toString(),
        createdAt: createdAt.toString(),
        ...rest
    }

    try {
        const res = await redisClient.hSet(hashKey, toCache);
        return res;
    } catch (error) {
        console.error(error);
        return;
    }
}


async function hGetAll(hashKey: string) {
    try {
        const { updatedAt, createdAt, ...rest } = await redisClient.hGetAll(hashKey);
        const cachedData = {
            updatedAt: new Date(updatedAt),
            createdAt: new Date(createdAt),
            ...rest
        }
        return cachedData;
    } catch (error) {
        return null;
    }
}

async function listPush(listKey: string, array: Array<string>) {
    let itemCount = 0;
    try {
        for await (let item of array) {
            await redisClient.lPush(listKey, item);
            itemCount += 1;
        }
        return itemCount;
    } catch (error) {
        return 0;
    }
}

async function listRange(key: string) {
    const result = await redisClient.lRange(key, 0, -1);
    return result
}


async function run() {
    let dataNum: number | undefined = 0;
    let itemCount: number = 0;

    console.log('Start')
    try {
        await connectClient();

        const { books, ...rest } = testObj;
        if (books) {
            [dataNum, itemCount] = await Promise.all([
                hSet('firstHash:data', rest),
                listPush('firstHash:data:list', books)
            ])
        }

        console.log(dataNum, itemCount);
        const data = await hGetAll('firstHash:data');
        console.log(data);

        const array = await listRange('firstHash:data:list')
        console.log(array);


        return;
    } catch (error) {
        console.error(error);
    }

}

run();