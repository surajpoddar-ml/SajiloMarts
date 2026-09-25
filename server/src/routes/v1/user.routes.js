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

// Customer Delivery Address CRUD & Default Management
router.get('/addresses', asyncHandler(async (req, res) => {
  const userId = req.user?.id || req.userId;
  const addresses = await addressService.getUserAddresses(userId);
  return res.status(HTTP_STATUS.OK).json(
    new ApiResponse(HTTP_STATUS.OK, addresses, 'Addresses retrieved successfully')
  );
}));

router.post('/addresses', asyncHandler(async (req, res) => {
  const userId = req.user?.id || req.userId;
  const newAddress = await addressService.createAddress(userId, req.body);
  return res.status(HTTP_STATUS.CREATED).json(
    new ApiResponse(HTTP_STATUS.CREATED, newAddress, 'Address created successfully')
  );
}));

router.put('/addresses/:addressId', asyncHandler(async (req, res) => {
  const userId = req.user?.id || req.userId;
  const { addressId } = req.params;
  const updatedAddress = await addressService.updateAddress(userId, addressId, req.body);
  return res.status(HTTP_STATUS.OK).json(
    new ApiResponse(HTTP_STATUS.OK, updatedAddress, 'Address updated successfully')
  );
}));

router.delete('/addresses/:addressId', asyncHandler(async (req, res) => {
  const userId = req.user?.id || req.userId;
  const { addressId } = req.params;
  await addressService.deactivateAddress(userId, addressId);
  return res.status(HTTP_STATUS.OK).json(
    new ApiResponse(HTTP_STATUS.OK, null, 'Address deleted successfully')
  );
}));

router.patch('/addresses/:addressId/default', asyncHandler(async (req, res) => {
  const userId = req.user?.id || req.userId;
  const { addressId } = req.params;
  const defaultAddress = await addressService.setDefaultShippingAddress(userId, addressId);
  return res.status(HTTP_STATUS.OK).json(
    new ApiResponse(HTTP_STATUS.OK, defaultAddress, 'Default shipping address set successfully')
  );
}));

export default router;
