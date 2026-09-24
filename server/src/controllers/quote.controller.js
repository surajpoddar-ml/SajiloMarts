import { BaseController } from './base.controller.js';
import { quoteService } from '../services/quote.service.js';
import { ApiResponse, asyncHandler } from '../utils/index.js';
import { HTTP_STATUS } from '../constants/httpStatus.js';
import { validateQuoteCalculationRequest } from '../validations/productRequest.validation.js';

/**
 * Controller providing pure server-authoritative quote calculation endpoints.
 * Completely immune to client-side financial manipulation.
 */
export class QuoteController extends BaseController {
  /**
   * POST /api/v1/quotes/calculate
   * Standalone pricing preview endpoint for frontend quotes before saving a request.
   */
  calculateQuote = asyncHandler(async (req, res) => {
    validateQuoteCalculationRequest(req.body);

    const safeQuote = quoteService.generateSafeQuote(req.body);

    return res.status(HTTP_STATUS.OK).json(
      ApiResponse.success(safeQuote, 'Authoritative quote calculated successfully')
    );
  });
}

export const quoteController = new QuoteController();
export default quoteController;
