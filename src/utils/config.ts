import 'dotenv/config';


type Config = {
    host?: string;
    port?: number;
    username?: string;
    password?: string;
    database?: string;
}

const devConfig: Config = {
    host: process.env.HOST,
    port: process.env.PORT ? parseInt(process.env.PORT, 10) : 3306,
    username: process.env.USERNAME,
    password: process.env.PASSWORD,
    database: process.env.DATABASE,
}

const testConfig: Config = {
    host: process.env.HOST,
    port: process.env.PORT ? parseInt(process.env.PORT, 10) : 3306,
    username: process.env.USERNAME,
    password: process.env.PASSWORD,
    database: process.env.DATABASE_TEST,
}

export const configArray: Array<Config> = [devConfig, testConfig];
