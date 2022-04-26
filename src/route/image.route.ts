import { Router } from 'express';

import authorize from '../middleware/authorize.middleware';
import Image from '../controller/image.controller';
import upload from '../middleware/multer.middleware';

const router = Router();

router.post('', authorize, upload, Image.upload);

router.get('/:filename', authorize, Image.fetch);

router.put('/:filename', authorize, upload, Image.replace);

router.delete('/:filename', authorize, Image.delete);

export default router;
