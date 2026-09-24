import { BaseController } from './base.controller.js';
import { productRequestService } from '../services/productRequest.service.js';
import { ApiResponse, asyncHandler } from '../utils/index.js';
import { HTTP_STATUS } from '../constants/httpStatus.js';
import { validateCreateProductRequest } from '../validations/productRequest.validation.js';

/**
 * Controller handling Sourcing Product Requests for authenticated customers.
 */
export class ProductRequestController extends BaseController {
  /**
   * POST /api/v1/requests
   * Creates a new sourcing request for the authenticated customer.
   */
  createRequest = asyncHandler(async (req, res) => {
    validateCreateProductRequest(req.body);

    const userId = req.user.id || req.user._id;
    const request = await productRequestService.createRequest(userId, req.body);

    return res.status(HTTP_STATUS.CREATED).json(
      ApiResponse.created(request, 'Sourcing request created successfully')
    );
  });
}

export const productRequestController = new ProductRequestController();
export default productRequestController;
