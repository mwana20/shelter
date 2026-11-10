import { SubscriptionService } from './subscription.service.js';
import { ApiResponse } from '../../utils/ApiResponse.js';
import { asyncHandler } from '../../utils/asyncHandler.js';

export class SubscriptionController {
  static getPlans = asyncHandler(async (_req, res) => {
    const plans = await SubscriptionService.getPlans();
    res.status(200).json(ApiResponse.success(plans, 'Subscription plans retrieved'));
  });

  static getQuote = asyncHandler(async (req, res) => {
    const quote = await SubscriptionService.getQuote(req.query.months);
    res.status(200).json(ApiResponse.success(quote, 'Subscription quote calculated'));
  });

  static getMine = asyncHandler(async (req, res) => {
    const subscription = await SubscriptionService.getMySubscription(req.user.id);
    res.status(200).json(ApiResponse.success(subscription, 'Subscription details retrieved'));
  });

  static selectPlan = asyncHandler(async (req, res) => {
    const result = await SubscriptionService.selectPlan(
      req.user.id,
      req.body.plan,
      req.body.durationMonths
    );
    res.status(200).json(ApiResponse.success(result, 'Subscription selection processed'));
  });

  static unlockMap = asyncHandler(async (req, res) => {
    const result = await SubscriptionService.unlockMap(req.user.id, req.body.propertyId);
    res.status(200).json(ApiResponse.success(result, 'Map access granted'));
  });
}
