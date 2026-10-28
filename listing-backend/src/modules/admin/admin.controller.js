import { AdminService } from './admin.service.js';
import { ApiResponse } from '../../utils/ApiResponse.js';
import { asyncHandler } from '../../utils/asyncHandler.js';

export class AdminController {
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
