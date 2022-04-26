import express, { Express } from 'express';

import authRouter from './route/auth.route';
import imageRouter from './route/image.route';
import config from './config/app.config';
import mongo from './utility/mongo.db';
import redis from './utility/redis.db';
import cors from './middleware/cors.middleware';
import logger from './utility/logger';

const app: Express = express();

app.use(express.json());
app.use(cors);

global.__basedir = __dirname;

mongo(config.db.MONGODB_URI);

redis.on('connect', () => {
	logger.info('[Connected to Redis DB.]');
});

app.use('/api/user', authRouter);
app.use('/api/image', imageRouter);

app.listen(config.app.PORT, () => {
	logger.info(`[Server is listening on ${config.app.PORT}]`);
});

// process.on('uncaughtException', (error, _origin) => {
// 	logger.info('[uncaughtException]');
// 	logger.error(error);
// });

export default app;
