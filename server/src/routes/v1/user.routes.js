import { Router } from 'express';
import { requireAuth } from '../../middlewares/auth.middleware.js';
import { getMe, updateProfile } from '../../controllers/auth.controller.js';
import { validateBody } from '../../middlewares/validation.middleware.js';
import { validateUpdateProfileInput } from '../../validations/auth.validation.js';
import { addressService } from '../../services/address.service.js';
import { asyncHandler, ApiResponse } from '../../utils/index.js';
import { HTTP_STATUS } from '../../constants/httpStatus.js';

const router = Router();

// Require authentication for all user self-service routes
router.use(requireAuth);

router.get('/profile', getMe);
router.patch('/profile', validateBody(validateUpdateProfileInput), updateProfile);

router.get('/addresses', asyncHandler(async (req, res) => {
  const addresses = await addressService.getUserAddresses(req.user?.id || req.userId);
  return res.status(HTTP_STATUS.OK).json(
    new ApiResponse(HTTP_STATUS.OK, addresses, 'Addresses retrieved successfully')
  );
}));

export default router;
