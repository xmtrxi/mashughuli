export enum UserRole {
  requester = "requester",
  runner = "runner",
  admin = "admin",
}

export enum VerificationStatus {
  pending = "pending",
  verified = "verified",
  rejected = "rejected",
}

export enum UserStatus {
  active = "active",
  suspended = "suspended",
  inactive = "inactive",
}

export enum PriorityLevel {
  low = "low",
  medium = "medium",
  high = "high",
  urgent = "urgent",
}

export enum ErrandStatus {
  draft = "draft",
  open = "open",
  in_progress = "in_progress",
  completed = "completed",
  cancelled = "cancelled",
  disputed = "disputed",
}

export enum BidStatus {
  pending = "pending",
  accepted = "accepted",
  rejected = "rejected",
  expired = "expired",
}

export enum PointsTransactionType {
  earned = "earned",
  spent = "spent",
  expired = "expired",
  bonus = "bonus",
}

export enum PaymentMethodType {
  credit_card = "credit_card",
  debit_card = "debit_card",
  paypal = "paypal",
  bank_transfer = "bank_transfer",
  other = "other",
}

export enum PaymentStatus {
  pending = "pending",
  completed = "completed",
  failed = "failed",
  refunded = "refunded",
}

export enum NotificationType {
  new_bid = "new_bid",
  bid_accepted = "bid_accepted",
  errand_update = "errand_update",
  message = "message",
  payment = "payment",
  review = "review",
  system_alert = "system_alert",
  achievement = "achievement",
}

export enum DisputeStatus {
  open = "open",
  under_review = "under_review",
  resolved = "resolved",
  escalated = "escalated",
}

export enum ResolutionType {
  refund = "refund",
  partial_refund = "partial_refund",
  no_refund = "no_refund",
  other = "other",
}
export interface User {
  id: string;
  email: string;
  fullName: string;
  avatarUrl?: string;
  phoneNumber?: string;
  primaryRole: UserRole;
  status: UserStatus;
  createdAt: Date;
  updatedAt: Date;

  // Relations (simplified as arrays or nested types)
  addresses?: Address[];
  runnerVerifications?: RunnerVerification[];
  createdErrands?: Errand[];
  assignedErrands?: Errand[];
  bids?: Bid[];
  sentMessages?: Message[];
  receivedMessages?: Message[];
  givenReviews?: Review[];
  receivedReviews?: Review[];
  points?: Points;
  pointsTransactions?: PointsTransaction[];
  userBadges?: UserBadge[];
  paymentMethods?: PaymentMethod[];
  paidTransactions?: Transaction[];
  receivedTransactions?: Transaction[];
  notifications?: Notification[];
  notificationSettings?: NotificationSettings;
  filedDisputes?: Dispute[];
  requesterDisputes?: Dispute[];
  runnerDisputes?: Dispute[];
  resolvedDisputes?: Dispute[];
  activityLogs?: UserActivityLog[];
  uploadedFiles?: ErrandFile[];
}
export interface RunnerVerification {
  id: string;
  runnerId: string;
  identityDocumentUrl?: string;
  backgroundCheckStatus: VerificationStatus;
  identityVerifiedAt?: Date;
  verificationNotes?: string;
  createdAt: Date;
  updatedAt: Date;

  runner?: User;
}
export interface Address {
  id: string;
  userId: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  latitude?: number;
  longitude?: number;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;

  user?: User;
  errands?: Errand[];
}
export interface ErrandCategory {
  id: string;
  name: string;
  description?: string;
  iconName?: string;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
  errands?: Errand[];
}
export interface Errand {
  id: string;
  requesterId: string;
  runnerId?: string;
  categoryId: string;
  title: string;
  description: string;
  addressId?: string;
  customLocation?: string;
  latitude?: number;
  longitude?: number;
  startTime?: Date;
  endTime?: Date;
  deadline?: Date;
  budgetMin?: number;
  budgetMax?: number;
  finalPrice?: number;
  priority: PriorityLevel;
  status: ErrandStatus;
  visibility: boolean;
  createdAt: Date;
  updatedAt: Date;

  requester?: User;
  runner?: User;
  category?: ErrandCategory;
  address?: Address;
  bids?: Bid[];
  messages?: Message[];
  reviews?: Review[];
  files?: ErrandFile[];
  transactions?: Transaction[];
  disputes?: Dispute[];
  pointsTransactions?: PointsTransaction[];
}
export interface ErrandFile {
  id: string;
  errandId: string;
  fileUrl: string;
  fileType: string;
  fileName: string;
  uploadedBy: string;
  createdAt: Date;

  errand?: Errand;
  uploader?: User;
}
export interface Bid {
  id: string;
  errandId: string;
  runnerId: string;
  price: number;
  estimatedCompletionTime?: Date;
  notes?: string;
  experienceDetails?: string;
  status: BidStatus;
  createdAt: Date;
  updatedAt: Date;

  errand?: Errand;
  runner?: User;
}
export interface Message {
  id: string;
  errandId: string;
  senderId: string;
  recipientId: string;
  message: string;
  read: boolean;
  createdAt: Date;

  errand?: Errand;
  sender?: User;
  recipient?: User;
}
export interface Review {
  id: string;
  errandId: string;
  reviewerId: string;
  revieweeId: string;
  rating: number;
  comment?: string;
  createdAt: Date;

  errand?: Errand;
  reviewer?: User;
  reviewee?: User;
}
export interface Points {
  id: string;
  userId: string;
  pointsEarned: number;
  pointsSpent: number;
  createdAt: Date;
  updatedAt: Date;

  user?: User;
}
export interface PointsTransaction {
  id: string;
  userId: string;
  errandId?: string;
  transactionType: PointsTransactionType;
  pointsAmount: number;
  description?: string;
  createdAt: Date;

  user?: User;
  errand?: Errand;
}
export interface Badge {
  id: string;
  name: string;
  description: string;
  iconUrl: string;
  pointsValue: number;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
  userBadges?: UserBadge[];
}
export interface UserBadge {
  id: string;
  userId: string;
  badgeId: string;
  awardedAt: Date;

  user?: User;
  badge?: Badge;
}
export interface PaymentMethod {
  id: string;
  userId: string;
  methodType: PaymentMethodType;
  isDefault: boolean;
  lastFour?: string;
  paymentToken?: string;
  providerId?: string;
  expiresAt?: Date;
  createdAt: Date;
  updatedAt: Date;

  user?: User;
  transactions?: Transaction[];
}
export interface Transaction {
  id: string;
  errandId: string;
  payerId: string;
  payeeId: string;
  paymentMethodId?: string;
  amount: number;
  platformFee: number;
  status: PaymentStatus;
  transactionReference?: string;
  createdAt: Date;
  updatedAt: Date;

  errand?: Errand;
  payer?: User;
  payee?: User;
  paymentMethod?: PaymentMethod;
}
export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  relatedId?: string;
  read: boolean;
  createdAt: Date;

  user?: User;
}
export interface NotificationSettings {
  id: string;
  userId: string;
  emailNotifications: boolean;
  pushNotifications: boolean;
  newBidAlert: boolean;
  messageAlert: boolean;
  errandUpdateAlert: boolean;
  paymentAlert: boolean;
  reviewAlert: boolean;
  marketingCommunications: boolean;
  createdAt: Date;
  updatedAt: Date;

  user?: User;
}
export interface Dispute {
  id: string;
  errandId: string;
  requesterId: string;
  runnerId: string;
  filedBy: string;
  reason: string;
  details: string;
  status: DisputeStatus;
  resolutionType?: ResolutionType;
  resolutionNotes?: string;
  resolvedAt?: Date;
  resolvedBy?: string;
  createdAt: Date;
  updatedAt: Date;

  errand?: Errand;
  requester?: User;
  runner?: User;
  filedByUser?: User;
  resolver?: User;
}
export interface UserActivityLog {
  id: string;
  userId: string;
  action: string;
  ipAddress?: string;
  userAgent?: string;
  createdAt: Date;

  user?: User;
}
export interface SystemSetting {
  id: string;
  settingKey: string;
  settingValue?: string;
  settingDescription?: string;
  createdAt: Date;
  updatedAt: Date;
}
