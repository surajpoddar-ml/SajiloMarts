import { BaseController } from './base.controller.js';
import { productRequestService } from '../services/productRequest.service.js';
import { ApiResponse, asyncHandler } from '../utils/index.js';
import { HTTP_STATUS } from '../constants/httpStatus.js';
import { validateCreateProductRequest, validateListProductRequests } from '../validations/productRequest.validation.js';

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

  /**
   * GET /api/v1/requests
   * Retrieves paginated list of sourcing requests for authenticated customer.
   */
  getUserRequests = asyncHandler(async (req, res) => {
    const paginationOptions = validateListProductRequests(req.query);
    const userId = req.user.id || req.user._id;

    const result = await productRequestService.listUserRequests(userId, paginationOptions);

    return res.status(HTTP_STATUS.OK).json(
      ApiResponse.paginated(
        result.requests,
        result.pagination,
        'Customer sourcing requests retrieved successfully'
      )
    );
  });

  /**
   * GET /api/v1/requests/:requestId
   * Retrieves detail of an individual sourcing request with ownership isolation.
   */
  getRequestById = asyncHandler(async (req, res) => {
    const requestId = req.params.requestId || req.params.id;
    const userId = req.user.id || req.user._id;

    const request = await productRequestService.getRequestDetailsForCustomer(userId, requestId);

    return res.status(HTTP_STATUS.OK).json(
      ApiResponse.success(request, 'Sourcing request retrieved successfully')
    );
  });

  /**
   * POST /api/v1/requests/:requestId/cancel
   * Allows customer to cancel their own sourcing request.
   */
  cancelRequest = asyncHandler(async (req, res) => {
    const requestId = req.params.requestId || req.params.id;
    const userId = req.user.id || req.user._id;

    const request = await productRequestService.transitionRequestStatus(
      userId,
      requestId,
      'cancelled'
    );

    return res.status(HTTP_STATUS.OK).json(
      ApiResponse.success(request, 'Sourcing request cancelled successfully')
    );
  });

  /**
   * POST /api/v1/requests/:requestId/submit
   * Submits a draft sourcing request.
   */
  submitDraftRequest = asyncHandler(async (req, res) => {
    const requestId = req.params.requestId || req.params.id;
    const userId = req.user.id || req.user._id;

    const request = await productRequestService.transitionRequestStatus(
      userId,
      requestId,
      'submitted'
    );

    return res.status(HTTP_STATUS.OK).json(
      ApiResponse.success(request, 'Sourcing request submitted successfully')
    );
  });
}

export const productRequestController = new ProductRequestController();
export default productRequestController;
