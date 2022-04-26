import httpCode from '../utility/httpcodes';
import config from '../config/app.config';
import jwt from '../utility/jwt';
import redis from '../utility/redis.db';
import { Response, Request, NextFunction } from 'express';
import logger from '../utility/logger';

/**
 *
 * @param req express.Request
 * @param res express.Response
 * @param next express.NextFunction
 * @description Function checks if user is authorized to access the route
 */
const authorize = async (req: Request, res: Response, next: NextFunction) => {
	logger.info('[Authorize middleware]');
	try {
		//Get token from user request
		const authHeader = req.headers['authorization'];
		const token = authHeader && authHeader.split(' ')[1];

		if (token == null)
			return res
				.status(httpCode.UNAUTHORIZED)
				.json({ message: 'Access Token required to validate client', details: null });

		const result = await jwt.verifyToken(token, config.auth.JWT_SECRET_KEY);
		logger.debug(result);

		if (!result.number)
			return res.status(httpCode.FORBIDDEN).json({ message: 'User token verification failed', details: result });

		const key = config.db.REDIS_AT_PREFIX + result.number;
		const value = await redis.get(key);

		if (!value || value !== token)
			return res
				.status(httpCode.FORBIDDEN)
				.json({ message: `Token is not authorized to access this account`, details: value });

		req.body.number = result.number;
		req.body.id = result.id;

		next();
	} catch (error: any) {
		return res.status(httpCode.INTERNAL_SERVER_ERROR).json({
			message: error.message || 'Unknown Error Occurred',
			details: error,
		});
	}
};

export default authorize;
