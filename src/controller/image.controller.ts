import { Response, Request } from 'express';
import httpCode from '../utility/httpcodes';
import logger from '../utility/logger';
import path from 'path';
import fs from 'fs';

class Image {
	private static getPath = (filename: string) => {
		const currentPath = __dirname.split(path.sep);
		currentPath.pop();
		currentPath.push('uploads');
		return path.join(...currentPath, filename);
	};

	static fetch = async (req: Request, res: Response) => {
		logger.info('[Image get]');

		try {
			const filename: string = req.params.filename;
			if (filename) {
				const downloadPath = Image.getPath(filename);
				if (fs.existsSync(downloadPath)) {
					return res.status(200).download(downloadPath);
				}
				return res.status(httpCode.BAD_REQUEST).json({ message: 'File name not found', details: null });
			}
			return res
				.status(httpCode.BAD_REQUEST)
				.json({ message: 'File name not found in request body', details: null });
		} catch (error: any) {
			return res
				.status(httpCode.INTERNAL_SERVER_ERROR)
				.json({ message: error.message || 'Unknown Error Occurred', details: error });
		}
	};

	static upload = async (req: Request, res: Response) => {
		logger.info('[Image upload]');

		try {
			if (!req.file) {
				return res
					.status(httpCode.UNSUPPORTED_MEDIA_TYPE)
					.json({ message: 'Failed to upload file', details: null });
			}

			return res.status(httpCode.CREATED).json({
				message: 'File uploaded successfully',
				details: { filename: req.file.filename, size: req.file.size },
			});
		} catch (error: any) {
			return res
				.status(httpCode.INTERNAL_SERVER_ERROR)
				.json({ message: error.message || 'Unknown Error Occurred', details: error });
		}
	};

	static replace = async (req: Request, res: Response) => {
		logger.info('[Image update]');

		if (req.file) {
			const filename: string = req.params.filename;
			if (filename) {
				const deletePath = Image.getPath(filename);
				if (fs.existsSync(deletePath)) {
					fs.unlinkSync(deletePath);
					return res.status(httpCode.OK).json({
						message: 'File updated successfully',
						details: { filename: req.file.filename, size: req.file.size },
					});
				}
				return res.status(httpCode.NOT_FOUND).json({ message: 'File name not found.', details: null });
			}

			return res
				.status(httpCode.BAD_REQUEST)
				.json({ message: 'File name not found in request body.', details: null });
		}
		return res.status(httpCode.BAD_REQUEST).json({ message: 'Failed to update file.', details: null });
	};

	static delete = async (req: Request, res: Response) => {
		logger.info('[Image delete]');

		const filename: string = req.params.filename;
		if (filename) {
			const deletePath = Image.getPath(filename);
			if (fs.existsSync(deletePath)) {
				fs.unlinkSync(deletePath);
				return res.status(httpCode.OK).json({ message: 'File deleted successfully', details: null });
			}
			return res.status(httpCode.NOT_FOUND).json({ message: 'File name not found.', details: null });
		}
		return res
			.status(httpCode.BAD_REQUEST)
			.json({ message: 'File name not found in request body.', details: null });
	};
}

export default Image;
