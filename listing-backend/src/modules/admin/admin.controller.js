import { AdminService } from './admin.service.js';
import { ApiResponse } from '../../utils/ApiResponse.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
export class AdminController {

  static listPendingOwners = asyncHandler(async (req, res) => {
    const result = await AdminService.listPendingOwners(req.query);
    res.status(200).json(ApiResponse.success(result, 'Pending owners retrieved'));
  });

  static approveOwner = asyncHandler(async (req, res) => {
    const result = await AdminService.approveOwner(req.params.id, req.user, req);
    res.status(200).json(ApiResponse.success(result, result.message));
  });

  static rejectOwner = asyncHandler(async (req, res) => {
    const result = await AdminService.rejectOwner(req.params.id, req.body.reason, req.user, req);
    res.status(200).json(ApiResponse.success(result, result.message));
  });

  static listPendingProperties = asyncHandler(async (req, res) => {
    const result = await AdminService.listPendingProperties(req.query);
    res.status(200).json(ApiResponse.success(result, 'Pending properties retrieved'));
  });

  static approveProperty = asyncHandler(async (req, res) => {
    const result = await AdminService.approveProperty(req.params.id, req.user, req);
    res.status(200).json(ApiResponse.success(result, result.message));
  });

  static rejectProperty = asyncHandler(async (req, res) => {
    const result = await AdminService.rejectProperty(req.params.id, req.body?.notes, req.user, req);
    res.status(200).json(ApiResponse.success(result, result.message));
  });

  static requestPropertyCorrections = asyncHandler(async (req, res) => {
    const result = await AdminService.requestPropertyCorrections(req.params.id, req.body?.notes, req.user, req);
    res.status(200).json(ApiResponse.success(result, result.message));
  });

  static getSubscriptionConfig = asyncHandler(async (_req, res) => {
    const config = await AdminService.getSubscriptionConfig();
    res.status(200).json(ApiResponse.success(config, 'Subscription settings retrieved'));
  });

  static updateSubscriptionConfig = asyncHandler(async (req, res) => {
    const config = await AdminService.updateSubscriptionConfig(req.body, req.user, req);
    res.status(200).json(ApiResponse.success(config, 'Subscription settings updated'));
  });

  static listSubscriptions = asyncHandler(async (req, res) => {
    const result = await AdminService.listSubscriptions(req.query);
    res.status(200).json(ApiResponse.success(result, 'Subscriptions retrieved'));
  });

  static listSubscriptionUsers = asyncHandler(async (req, res) => {
    const result = await AdminService.listSubscriptionUsers(req.query);
    res.status(200).json(ApiResponse.success(result, 'Property owners and brokers retrieved'));
  });

  static grantSubscription = asyncHandler(async (req, res) => {
    const subscription = await AdminService.grantSubscription(req.params.id, req.body, req.user, req);
    res.status(201).json(ApiResponse.created(subscription, 'Subscription granted'));
  });

  static revokeSubscription = asyncHandler(async (req, res) => {
    const subscription = await AdminService.revokeSubscription(
      req.params.id,
      req.body.reason,
      req.user,
      req
    );
    res.status(200).json(ApiResponse.success(subscription, 'Subscription revoked'));
  });

  static getPaymentSettings = asyncHandler(async (req, res) => {
    const settings = await AdminService.getPaymentSettings();
    res.status(200).json(ApiResponse.success(settings, 'Location locking & payment settings retrieved'));
  });

  static updatePaymentSettings = asyncHandler(async (req, res) => {
    const updated = await AdminService.updatePaymentSettings(req.body, req.user, req);
    res.status(200).json(ApiResponse.success(updated, 'Settings updated successfully'));
  });

  static updatePropertyLockOverride = asyncHandler(async (req, res) => {
    const override = await AdminService.updatePropertyLockOverride(req.body, req.user, req);
    res.status(200).json(ApiResponse.success(override, 'Property lock override updated'));
  });

  static listAllPayments = asyncHandler(async (req, res) => {
    const result = await AdminService.listAllPayments(req.query);
    res.status(200).json(ApiResponse.success(result, 'Payments ledger retrieved'));
  });

  static reviewPayment = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { action, rejectionReason } = req.body;
    const result = await AdminService.reviewPayment(id, action, rejectionReason, req.user, req);
    res.status(200).json(ApiResponse.success(result, result.message));
  });

  static manualUnlock = asyncHandler(async (req, res) => {
    const result = await AdminService.manualUnlock(req.body, req.user, req);
    res.status(200).json(ApiResponse.success(result, result.message));
  });
}
