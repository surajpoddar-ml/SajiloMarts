import { Router } from 'express';
import { getHealthStatus } from '../../controllers/index.js';

const router = Router();

router.get('/', getHealthStatus);

export default router;
