export type SubscriptionTier = 'free' | 'premium' | 'enterprise';

export interface TierLimits {
  maxVaults: number;
  maxContent: number;
  maxExecutors: number;
  allowedTriggerTypes: string[];
  videoUploads: boolean;
  customDomain: boolean;
  encryption: boolean;
}

export const TIER_LIMITS: Record<SubscriptionTier, TierLimits> = {
  free: {
    maxVaults: 3,
    maxContent: 25,
    maxExecutors: 3,
    allowedTriggerTypes: ['inactivity'],
    videoUploads: false,
    customDomain: false,
    encryption: false,
  },
  premium: {
    maxVaults: Infinity,
    maxContent: Infinity,
    maxExecutors: Infinity,
    allowedTriggerTypes: ['inactivity', 'scheduled', 'manual', 'death_certificate', 'executor_vote'],
    videoUploads: true,
    customDomain: true,
    encryption: true,
  },
  enterprise: {
    maxVaults: Infinity,
    maxContent: Infinity,
    maxExecutors: Infinity,
    allowedTriggerTypes: ['inactivity', 'scheduled', 'manual', 'death_certificate', 'executor_vote'],
    videoUploads: true,
    customDomain: true,
    encryption: true,
  },
};

export const getTierLimits = (tier: SubscriptionTier): TierLimits => {
  return TIER_LIMITS[tier];
};

export const checkTierLimit = (
  tier: SubscriptionTier,
  limit: keyof TierLimits,
  currentValue: number
): boolean => {
  const limits = getTierLimits(tier);
  const maxValue = limits[limit];

  if (typeof maxValue === 'number') {
    return maxValue === Infinity || currentValue < maxValue;
  }

  return true;
};

