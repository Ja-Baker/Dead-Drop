export const APP_NAME = 'Dead Drop';
export const APP_EMOJI = '🪦';

export const SUBSCRIPTION_TIERS = {
  FREE: 'free',
  PREMIUM: 'premium',
  ENTERPRISE: 'enterprise',
} as const;

export const TRIGGER_TYPES = {
  INACTIVITY: 'inactivity',
  SCHEDULED: 'scheduled',
  MANUAL: 'manual',
  DEATH_CERTIFICATE: 'death_certificate',
  EXECUTOR_VOTE: 'executor_vote',
} as const;

export const CONTENT_TYPES = {
  IMAGE: 'image',
  VIDEO: 'video',
  AUDIO: 'audio',
  TEXT: 'text',
  URL: 'url',
} as const;

export const EXECUTOR_ACCESS_LEVELS = {
  PRIMARY: 'primary',
  CURATOR: 'curator',
  VIEWER: 'viewer',
} as const;

export const INACTIVITY_THRESHOLDS = {
  SOFT: 90, // days
  PROBABLE: 180,
  DEFINITE: 365,
} as const;

export const CANCELLATION_WINDOW_HOURS = 72;

