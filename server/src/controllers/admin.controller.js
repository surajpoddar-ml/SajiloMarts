import { asyncHandler, ApiResponse, toSafeUser } from '../utils/index.js';
import { HTTP_STATUS } from '../constants/httpStatus.js';
import { adminService } from '../services/admin.service.js';
import { validateAdminUpdateUser } from '../validations/admin.validation.js';

/**
 * Administrative Controller
 * Handles audited admin operations.
 */
export const getAdminStatus = asyncHandler(async (req, res) => {
  return res.status(HTTP_STATUS.OK).json(
    new ApiResponse(
      HTTP_STATUS.OK,
      { authorized: true, role: req.user.role, user: req.user },
      'Administrative access authorized'
    )
  );
});

export const getCustomers = asyncHandler(async (req, res) => {
  const result = await adminService.getCustomers(req.query);
  return res.status(HTTP_STATUS.OK).json(
    new ApiResponse(HTTP_STATUS.OK, result, 'Customers retrieved successfully')
  );
});

export const getCustomerById = asyncHandler(async (req, res) => {
  const customer = await adminService.getCustomerById(req.params.id);
  return res.status(HTTP_STATUS.OK).json(
    new ApiResponse(HTTP_STATUS.OK, customer, 'Customer details retrieved successfully')
  );
});

export const updateCustomer = asyncHandler(async (req, res) => {
  const validatedInput = validateAdminUpdateUser(req.body);
  const updatedCustomer = await adminService.updateCustomerAccount(
    req.user?.id || req.userId,
    req.params.id,
    validatedInput
  );
  return res.status(HTTP_STATUS.OK).json(
    new ApiResponse(HTTP_STATUS.OK, updatedCustomer, 'Customer account updated successfully')
  );
});

export const getSourcingRequests = asyncHandler(async (req, res) => {
  const result = await adminService.getSourcingRequests(req.query);
  return res.status(HTTP_STATUS.OK).json(
    new ApiResponse(HTTP_STATUS.OK, result, 'Sourcing requests retrieved successfully')
  );
});

export const getPaymentSubmissions = asyncHandler(async (req, res) => {
  const result = await adminService.getPaymentSubmissions(req.query);
  return res.status(HTTP_STATUS.OK).json(
    new ApiResponse(HTTP_STATUS.OK, result, 'Payment submissions retrieved successfully')
  );
});

export default {
  getAdminStatus,
  getCustomers,
  getCustomerById,
  updateCustomer,
  getSourcingRequests,
  getPaymentSubmissions,
};

