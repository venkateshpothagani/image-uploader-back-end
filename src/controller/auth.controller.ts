import { Response, Request } from 'express';

import User from '../interface/User.interface';
import httpCode from '../utility/httpcodes';
import UserModel from '../models/User.model';
import bycrypt from '../utility/bcrypt';
import jwt from '../utility/jwt';
import config from '../config/app.config';
import redis from '../utility/redis.db';
import logger from '../utility/logger';

class Authenticator {
	/**
	 * @param req express.Request
	 * @param res express.Response
	 * @description Register new user
	 */
	static register = async (req: Request, res: Response) => {
		logger.info('[User register method ran]');

		try {
			const body: User = { ...req.body, timestamp: Date.now() };

			const pattern = new RegExp(config.auth.PASSWORD_PATTERN);

			// Check password pattern
			if (!pattern.test(body.password))
				return res.status(httpCode.BAD_REQUEST).json({
					message: "Passwords doesn't requirements",
					details: {
						value: body.password,
						pattern: String(config.auth.PASSWORD_PATTERN),
					},
				});

			// Password comparison
			if (body.password !== body.confirmPassword)
				return res.status(httpCode.BAD_REQUEST).json({
					message: 'Passwords are not matched',
					details: { password: body.password, confirmPassword: body.confirmPassword },
				});

			// Password encryption
			const passwordHash = await bycrypt.encryptPassword(body.password);
			const user: User = { ...body, password: passwordHash };

			// Save new user in database
			const result: any = await UserModel.create(user);
			delete result.password;

			return res.status(httpCode.CREATED).json({ message: 'User data saved successfully', data: result });
		} catch (error: any) {
			return res.status(httpCode.INTERNAL_SERVER_ERROR).json({
				message: error.message || 'Unknown Error Occurred',
				details: error,
			});
		}
	};

	/**
	 * @param req express.Request
	 * @param res express.Response
	 * @description Authenticates user and returns jwttemp token for successful authentication
	 */
	static login = async (req: Request, res: Response) => {
		logger.info('[User login method ran]');
		try {
			const body: { number: string; password: string } = req.body;

			// Find user by number
			const response = await UserModel.findOne({ number: body.number });

			// Return if not found
			if (!response) return res.status(httpCode.NOT_FOUND).json({ message: 'User not found', details: null });

			// Compare passwords
			const result = await bycrypt.comparePassword(body.password, response.password);

			// Returns 401 response if password mismatches
			if (!result) return res.status(httpCode.UNAUTHORIZED).json({ message: 'Wrong password', details: null });

			// Creates access and refresh tokens
			const accessToken = jwt.getAccessToken(body.number, String(response._id));
			const refreshToken = jwt.getRefreshToken(body.number, String(response._id));

			// Adds prefix to make key unique
			const accessKey = config.db.REDIS_AT_PREFIX + response.number;
			const refreshKey = config.db.REDIS_RT_PREFIX + response.number;

			// Save Redis DB Cache
			await redis.setex(accessKey, parseInt(config.auth.JWT_EXPIRES_IN), accessToken);
			await redis.setex(refreshKey, parseInt(config.auth.JWT_REFRESH_EXPIRES_IN), refreshToken);

			return res.status(httpCode.OK).json({
				message: 'User logged in successfully',
				data: { accessToken, refreshToken, id: response._id, number: response.number },
			});
		} catch (error: any) {
			return res.status(httpCode.INTERNAL_SERVER_ERROR).json({
				message: error.message || 'Unknown Error Occurred',
				details: error,
			});
		}
	};

	/**
	 *
	 * @param req express.Request
	 * @param res express.Response
	 * @description Send refresh token to client if user is authorized
	 */
	static refresh = async (req: Request, res: Response) => {
		logger.info('[User refresh method ran]');
		try {
			const body: { refreshToken: string } = req.body;

			if (!body.refreshToken)
				return res.status(httpCode.FORBIDDEN).json({ message: 'No refresh token', details: null });

			const result = await jwt.verifyToken(body.refreshToken, config.auth.JWT_REFRESH_SECRET_KEY);

			const accessToken = jwt.getAccessToken(result.number, result.id);

			const accessKey = config.db.REDIS_AT_PREFIX + result.number;
			const refreshKey = config.db.REDIS_RT_PREFIX + result.number;

			const refreshToken = await redis.get(refreshKey);

			if (refreshToken !== body.refreshToken)
				return res.status(httpCode.FORBIDDEN).json({ message: 'Invalid refresh token', details: null });

			await redis.setex(accessKey, parseInt(config.auth.JWT_EXPIRES_IN), accessToken);

			return res.status(httpCode.OK).json({ accessToken });
		} catch (error: any) {
			return res.status(httpCode.INTERNAL_SERVER_ERROR).json({
				message: error.message || 'Unknown Error Occurred',
				details: error,
			});
		}
	};

	/**
	 *
	 * @param req express.Request
	 * @param res express.Response
	 * @description Logout user and deletes the refresh token from the database.
	 */
	static logout = async (req: Request, res: Response) => {
		logger.info('U[ser logout method ran]');
		try {
			const body: { number: string } = req.body;

			const accessKey = config.db.REDIS_AT_PREFIX + body.number;
			const refreshKey = config.db.REDIS_RT_PREFIX + body.number;

			await redis.del(accessKey);
			await redis.del(refreshKey);

			return res.status(httpCode.OK).json({ message: 'Successfully logout', data: null });
		} catch (error: any) {
			return res.status(httpCode.INTERNAL_SERVER_ERROR).json({
				message: error.message || 'Unknown Error Occurred',
				details: error,
			});
		}
	};
}

export default Authenticator;
