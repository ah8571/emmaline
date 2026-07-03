import {
  addUserPrepaidSeconds,
  getUserBillingProfile,
  getUserConsumedCallSeconds
} from './databaseService.js';
import { getRevenueCatProStatus } from './revenueCatService.js';

const DEFAULT_FREE_TRIAL_SECONDS = Number(process.env.DEFAULT_FREE_TRIAL_SECONDS || 300);

const normalizeWholeSeconds = (value) => Math.max(0, Math.round(Number(value || 0)));

export const getUserVoiceBillingStatus = async (userId) => {
  const [billingProfile, consumedCallSeconds, revenueCatStatus] = await Promise.all([
    getUserBillingProfile(userId),
    getUserConsumedCallSeconds(userId),
    getRevenueCatProStatus(userId)
  ]);

  const freeTrialSecondsGranted = normalizeWholeSeconds(
    billingProfile?.free_trial_seconds_granted ?? DEFAULT_FREE_TRIAL_SECONDS
  );
  const prepaidSecondsBalance = normalizeWholeSeconds(billingProfile?.prepaid_seconds_balance || 0);
  const usedCallSeconds = normalizeWholeSeconds(consumedCallSeconds);
  const remainingFreeTrialSeconds = Math.max(0, freeTrialSecondsGranted - usedCallSeconds);
  const availableVoiceSeconds = remainingFreeTrialSeconds + prepaidSecondsBalance;
  const hasRevenueCatProAccess = Boolean(revenueCatStatus?.isProActive);
  const hasMeteredVoiceAccess = availableVoiceSeconds > 0;
  const hasVoiceAccess = hasRevenueCatProAccess || hasMeteredVoiceAccess;

  return {
    billingState: hasRevenueCatProAccess ? 'pro' : billingProfile?.billing_state || 'trial',
    freeTrialSecondsGranted,
    prepaidSecondsBalance,
    usedCallSeconds,
    remainingFreeTrialSeconds,
    availableVoiceSeconds,
    availableVoiceMinutes: Number((availableVoiceSeconds / 60).toFixed(2)),
    autoRechargeEnabled: Boolean(billingProfile?.auto_recharge_enabled),
    autoRechargeThresholdSeconds: normalizeWholeSeconds(billingProfile?.auto_recharge_threshold_seconds || 60),
    autoRechargeAmountSeconds: normalizeWholeSeconds(billingProfile?.auto_recharge_amount_seconds || 300),
    hasVoiceAccess,
    voiceAccessSource: hasRevenueCatProAccess ? 'subscription' : hasMeteredVoiceAccess ? 'metered' : 'none',
    paywallTriggered: !hasVoiceAccess,
    paywallReason: hasVoiceAccess ? null : 'free_trial_exhausted',
    revenueCat: {
      configured: Boolean(revenueCatStatus?.configured),
      status: revenueCatStatus?.status || 'not_configured',
      source: revenueCatStatus?.source || null,
      isProActive: hasRevenueCatProAccess,
      expiresAt: revenueCatStatus?.expiresAt || null,
      error: revenueCatStatus?.error || null
    }
  };
};

export const assertUserCanStartVoiceSession = async (userId) => {
  const billingStatus = await getUserVoiceBillingStatus(userId);

  if (!billingStatus.hasVoiceAccess) {
    const error = new Error('Voice access requires additional minutes');
    error.code = 'VOICE_PAYWALL_REQUIRED';
    error.statusCode = 402;
    error.billingStatus = billingStatus;
    throw error;
  }

  return billingStatus;
};

export const grantUserPrepaidVoiceSeconds = async (userId, secondsToAdd) => {
  const updatedProfile = await addUserPrepaidSeconds(userId, secondsToAdd);

  return {
    updatedProfile,
    billingStatus: await getUserVoiceBillingStatus(userId)
  };
};

export default {
  getUserVoiceBillingStatus,
  assertUserCanStartVoiceSession,
  grantUserPrepaidVoiceSeconds
};