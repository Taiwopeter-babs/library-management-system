import express from 'express';
import cookieParser from 'cookie-parser';
import logger from 'morgan';
import 'dotenv/config';

import indexRouter from './src/api/routes/index';

const app = express();


app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());


app.use('/api', indexRouter);

const port = process.env.APP_PORT || 5000;
app.listen(port, () => {
  `Server is listening on port ${port}`
});
