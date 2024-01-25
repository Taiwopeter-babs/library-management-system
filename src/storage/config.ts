import 'dotenv/config';


const {
    HOST, PORT,
    DATABASE, DATABASE_TEST, NODE_ENV
} = process.env;

export const mongoConfig = {
    host: HOST ?? '127.0.0.1',
    port: PORT ?? '27017',
    database: NODE_ENV === 'development'
        ? DATABASE || 'lms_db'
        : DATABASE_TEST || 'lms_db_test',

}