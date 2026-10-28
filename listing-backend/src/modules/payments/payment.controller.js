import { PaymentService } from './payment.service.js';
import { StripeService } from './stripe.service.js';
import { ApiResponse } from '../../utils/ApiResponse.js';
import { asyncHandler } from '../../utils/asyncHandler.js';

export class PaymentController {
  static createGatewaySession = asyncHandler(async (req, res) => {
    const { propertyId } = req.body;
    const session = await PaymentService.createGatewaySession(req.user.id, propertyId);
    res.status(200).json(ApiResponse.success(session, 'Payment gateway session created'));
  });

  static verifyGatewayPayment = asyncHandler(async (req, res) => {
    const { propertyId, sessionId } = req.body;
    const result = await PaymentService.verifyGatewayPayment(req.user.id, propertyId, sessionId);
    res.status(200).json(ApiResponse.success(result, 'Gateway payment confirmed'));
  });

  static submitMerchantTransaction = asyncHandler(async (req, res) => {
    const { propertyId, transactionId } = req.body;
    const result = await PaymentService.submitMerchantTransaction(req.user.id, propertyId, transactionId);
    res.status(200).json(ApiResponse.success(result, result.message));
  });

  static getPaymentStatus = asyncHandler(async (req, res) => {
    const status = await PaymentService.getPaymentStatus(req.params.id, req.user.id);
    res.status(200).json(ApiResponse.success(status, 'Payment status retrieved'));
  });

  static getMyPayments = asyncHandler(async (req, res) => {
    const result = await PaymentService.getMyPayments(req.user.id, req.query);
    res.status(200).json(ApiResponse.success(result, 'Payments history retrieved'));
  });

  static handleStripeWebhook = asyncHandler(async (req, res) => {
    const signature = req.headers['stripe-signature'];
    const result = await StripeService.handleWebhookEvent(req.body, signature);
    res.status(200).json(result);
  });
}
