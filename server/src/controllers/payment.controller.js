import { BaseController } from './base.controller.js';
import { paymentService } from '../services/payment.service.js';
import { ApiResponse, asyncHandler } from '../utils/index.js';
import { HTTP_STATUS } from '../constants/httpStatus.js';
import { USER_ROLES } from '../models/user.model.js';

/**
 * Controller handling payment workflows, proof submission, and protected proof access.
 */
export class PaymentController extends BaseController {
  /**
   * POST /api/v1/payments/initialize
   * Initiates payment submission with server-authoritative calculations.
   */
  createPaymentSubmission = asyncHandler(async (req, res) => {
    const userId = req.user.id || req.user._id;
    const { requestId, paymentMode, paymentMethod } = req.body;

    const submission = await paymentService.createPaymentSubmission(userId, requestId, {
      paymentMode,
      paymentMethod,
    });

    return res.status(HTTP_STATUS.CREATED).json(
      ApiResponse.created(submission, 'Payment initialized successfully')
    );
  });

  /**
   * POST /api/v1/payments/:paymentId/proof
   * Submits transaction code and/or uploaded payment proof screenshot.
   */
  submitPaymentProof = asyncHandler(async (req, res) => {
    const userId = req.user.id || req.user._id;
    const { paymentId } = req.params;
    const { transactionCode } = req.body;

    let paymentProofPath = req.body.paymentProof;
    if (req.file) {
      paymentProofPath = req.file.path || req.file.filename;
    }

    const updatedPayment = await paymentService.submitPaymentProof(userId, paymentId, {
      transactionCode,
      paymentProof: paymentProofPath,
    });

    return res.status(HTTP_STATUS.OK).json(
      ApiResponse.success(updatedPayment, 'Payment proof submitted for manual verification')
    );
  });

  /**
   * GET /api/v1/payments/:paymentId/proof
   * Retrieves payment proof securely for the owning customer or authorized administrator.
   */
  getPaymentProof = asyncHandler(async (req, res) => {
    const userId = req.user.id || req.user._id;
    const isAdmin = req.user.role === USER_ROLES.ADMIN;
    const { paymentId } = req.params;

    const proofData = await paymentService.getPaymentProofAccess(userId, paymentId, isAdmin);

    return res.status(HTTP_STATUS.OK).json(
      ApiResponse.success(proofData, 'Payment proof retrieved successfully')
    );
  });

  /**
   * GET /api/v1/payments/:paymentId
   * Retrieves payment submission details for the owner or admin.
   */
  getPaymentDetails = asyncHandler(async (req, res) => {
    const userId = req.user.id || req.user._id;
    const { paymentId } = req.params;

    const payment = await paymentService.getPaymentDetailsForCustomer(userId, paymentId);

    return res.status(HTTP_STATUS.OK).json(
      ApiResponse.success(payment, 'Payment details retrieved successfully')
    );
  });
}

export const paymentController = new PaymentController();
export default paymentController;
