import jwt from 'jsonwebtoken';
import config from '../config/app.config';

class JWT {
	/**
	 *
	 * @param number string
	 * @returns string
	 * @description Function generates JWT token for user
	 */
	static getAccessToken(number: string, id: string) {
		return jwt.sign({ number, id }, config.auth.JWT_SECRET_KEY, { expiresIn: config.auth.JWT_EXPIRES_IN });
	}

	/**
	 *
	 * @param number string
	 * @returns data string
	 * @description Function generates JWT refresh token for user
	 */
	static getRefreshToken(number: string, id: string) {
		return jwt.sign({ number }, config.auth.JWT_REFRESH_SECRET_KEY, {
			expiresIn: config.auth.JWT_REFRESH_EXPIRES_IN,
		});
	}

	/**
	 *
	 * @param token string
	 * @param secret string
	 * @returns  Promise< CustomJwtPayload >
	 * @description	Function verifies JWT token
	 */
	static verifyToken = (token: string, secret: string) => {
		return new Promise<any>((resolve, reject) => {
			jwt.verify(token, secret, (error: jwt.VerifyErrors | null, decoded: any) => {
				if (error) {
					return reject(error);
				}
				return resolve(decoded);
			});
		});
	};
}

export default JWT;
