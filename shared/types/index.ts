export type SubscriptionTier = 'free' | 'premium' | 'enterprise';

export type TriggerType = 'inactivity' | 'scheduled' | 'manual' | 'death_certificate' | 'executor_vote';

export type ContentType = 'image' | 'video' | 'audio' | 'text' | 'url';

export type ExecutorAccessLevel = 'primary' | 'curator' | 'viewer';

export type ExecutorStatus = 'pending' | 'accepted' | 'declined' | 'removed';

export type TriggerStatus = 'pending' | 'active' | 'triggered' | 'cancelled' | 'expired';

export interface User {
  id: string;
  email: string;
  subscriptionTier: SubscriptionTier;
  subscriptionStatus: 'active' | 'cancelled' | 'expired';
  twoFactorEnabled: boolean;
  createdAt: Date;
  lastActivityAt: Date;
}

export interface Vault {
  id: string;
  userId: string;
  name: string;
  icon?: string;
  description?: string;
  triggerType: TriggerType;
  triggerConfig?: Record<string, any>;
  isEncrypted: boolean;
  isPublic: boolean;
  customSlug?: string;
  contentCount?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Content {
  id: string;
  vaultId: string;
  type: ContentType;
  filePath?: string;
  encryptedData?: string;
  metadata?: Record<string, any>;
  displayOrder: number;
  createdAt: Date;
}

export interface Executor {
  id: string;
  userId: string;
  email: string;
  phone?: string;
  accessLevel: ExecutorAccessLevel;
  status: ExecutorStatus;
  vaultCount?: number;
  invitedAt: Date;
  acceptedAt?: Date;
}

export interface Trigger {
  id: string;
  vaultId: string;
  triggerType: TriggerType;
  status: TriggerStatus;
  scheduledDate?: Date;
  inactivityDays?: number;
  cancellationDeadline?: Date;
  triggeredAt?: Date;
  createdAt: Date;
}

export interface ProofOfLife {
  id: string;
  userId: string;
  checkInDate: Date;
  streakCount: number;
  createdAt: Date;
}

export interface MemorialReaction {
  id: string;
  vaultId: string;
  userId?: string;
  executorId?: string;
  reaction: '💀' | '😭' | '🕊️' | '😂';
  createdAt: Date;
}

export interface MemorialComment {
  id: string;
  vaultId: string;
  userId?: string;
  executorId?: string;
  content: string;
  parentCommentId?: string;
  createdAt: Date;
  updatedAt: Date;
}

