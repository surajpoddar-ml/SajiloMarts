import { Router } from 'express';
import { authenticate } from '../../middlewares/auth.middleware.js';
import { requireActiveAccount } from '../../middlewares/rbac.middleware.js';
import { productRequestController } from '../../controllers/productRequest.controller.js';

const router = Router();

router.use(authenticate);
router.use(requireActiveAccount);

// Sourcing Request CRUD & Action routes
router.post('/', productRequestController.createRequest);
router.get('/', productRequestController.getUserRequests);
router.get('/:requestId', productRequestController.getRequestById);
router.post('/:requestId/quote', productRequestController.generateQuote);
router.post('/:requestId/cancel', productRequestController.cancelRequest);
router.post('/:requestId/submit', productRequestController.submitDraftRequest);

export default router;

