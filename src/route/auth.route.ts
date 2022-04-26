import { Router } from 'express';

import auth from '../controller/auth.controller';
import authorize from '../middleware/authorize.middleware';

const router = Router();

router.post('/register', auth.register);

router.post('/login', auth.login);

router.post('/logout', authorize, auth.logout);

router.post('/refresh', auth.refresh);

export default router;
