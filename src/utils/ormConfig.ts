import 'dotenv/config';
import { DataSourceOptions } from 'typeorm';


const {
    HOST, PORT, USERNAME, PASSWORD,
    DATABASE, DATABASE_TEST, NODE_ENV
} = process.env;

const configOptions = {
    devConfig: {
        host: HOST,
        port: PORT ? parseInt(PORT, 10) : 3306,
        username: USERNAME,
        password: PASSWORD,
        database: DATABASE,
    },

    testConfig: {
        host: HOST,
        port: PORT ? parseInt(PORT, 10) : 3306,
        username: USERNAME,
        password: PASSWORD,
        database: DATABASE_TEST,
    }
}


const ormConfig: DataSourceOptions[] = [
    {
        name: "development",
        type: "mysql",
        ...configOptions.devConfig,
        entities: [
            "src/models/*.ts"
        ],
        synchronize: true,
        logging: ['schema', 'error'],
        logger: 'file'
    },
    {
        name: "test",
        type: "mysql",
        ...configOptions.testConfig,
        entities: [
            "src/models/*.ts"
        ],
        synchronize: true,
        dropSchema: true,
        logging: ['query', 'schema', 'error'],
        logger: 'file'
    }
];

/**
 * ### select database for ORM
 */
const setOrmConfig = (): DataSourceOptions => {

    if (NODE_ENV === 'development') {
        return ormConfig[0];
    }
    return ormConfig[1];
}

export default setOrmConfig;