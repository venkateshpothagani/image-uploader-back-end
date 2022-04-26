import multer from 'multer';
import config from '../config/app.config';
import path from 'path';

const storage = multer.diskStorage({
	destination: (_req, file, cb) => {
		console.log(file);
		cb(null, path.join(__basedir, 'uploads'));
	},
	filename: (_req, file, cb) => {
		cb(null, Date.now() + '__' + +Math.round(Math.random() * 1000) + file.originalname);
	},
});

const upload = multer({
	storage: storage,
	limits: { fileSize: Number(config.app.MAX_FILE_SIZE) },
	fileFilter: (_req, file, callback) => {
		const acceptableExtensions = ['.png', '.jpg', '.jpeg'];
		if (!acceptableExtensions.includes(path.extname(file.originalname))) {
			return callback(new Error('Invalid file extension'));
		}
		callback(null, true);
	},
});

export default upload.single(config.app.FILE_FILED_NAME);
