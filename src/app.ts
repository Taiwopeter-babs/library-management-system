import express from 'express';
import cookieParser from 'cookie-parser';
import logger from 'morgan';
import 'dotenv/config';

import indexRouter from './api/routes/index';
import redisClient from './utils/redis';

const app = express();


app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());


app.use('/api/v1', indexRouter);

const port = process.env.APP_PORT ? parseInt(process.env.APP_PORT, 10) : 5000;
app.listen(port, async () => {
  // connect to redis
  await redisClient.connectToRedis()
  console.log(`Express Server is listening on port ${port}`);
});
