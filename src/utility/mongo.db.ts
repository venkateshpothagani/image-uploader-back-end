import mongoose from 'mongoose';

import logger from './logger';

const mongo = (URI: string) => {
	return (() => {
		mongoose
			.connect(URI)
			.then((response) => {
				logger.info(`[Connected to Mongo DB. Database Name: "${response.connection.name}"]`);
			})
			.catch((error) => {
				logger.error('[Failed to connect DB]');
				logger.error(error);
			});
	})();
};

export default mongo;
