import 'dotenv/config';
import { DataSourceOptions } from 'typeorm';
import { configArray } from './config';


const ormConfig: Array<DataSourceOptions> = [
    {
        name: "development",
        type: "mysql",
        ...configArray[0],
        entities: [
            "src/controllers/*.ts"
        ],
        synchronize: true,
        logging: ['schema', 'error'],
        logger: 'file'
    },
    {
        name: "test",
        type: "mysql",
        ...configArray[1],
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

    if (nodeEnv === 'development') {
        return ormConfig[0];
    }
    return ormConfig[1];
}

export default setOrmConfig;