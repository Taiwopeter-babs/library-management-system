import 'dotenv/config';
import { DataSourceOptions } from 'typeorm';

const ormConfig: Array<DataSourceOptions> = [
    {
        name: "development",
        type: "mysql",
        host: "localhost",
        port: 3306,
        username: "lms_local_user",
        password: process.env.PASSWORD,
        database: "lms_db",
        entities: [
            "src/controllers/*.ts"
        ],
        synchronize: true
    },
    {
        name: "test",
        type: "mysql",
        host: "localhost",
        port: 3306,
        username: "lms_local_user",
        password: process.env.PASSWORD,
        database: "lms_test_db",
        entities: [
            "src/controllers/*.ts"
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
    const nodeEnv = process.env.NODE_ENV;
    console.log(nodeEnv);
    if (nodeEnv === 'development') {
        return ormConfig[0];
    }
    return ormConfig[1];
}

export default setOrmConfig;
