// ─────────────────────────────────────────────────────────────────────────────
// Admin Portal Types
// ─────────────────────────────────────────────────────────────────────────────

// ── Generic ──────────────────────────────────────────────────────────────────

export type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string }

export interface PaginatedParams {
  cursor?: string
  limit?: number
  filters?: Record<string, string>
}

export interface PaginatedResult<T> {
  items: T[]
  nextCursor: string | null
  count: number
}

// ── Trust Score ──────────────────────────────────────────────────────────────

export type TrustScoreLevel = 'low' | 'medium' | 'high'

// ── Users ────────────────────────────────────────────────────────────────────

export type UserStatus = 'active' | 'suspended' | 'banned'
export type UserRole = 'user' | 'community_leader' | 'admin'

export interface AdminUser {
  id: string
  name: string
  username: string
  email: string
  phone: string
  trustScore: number
  role: UserRole
  status: UserStatus
  createdAt: string
  profilePhoto?: string
}

// ── Alerts ───────────────────────────────────────────────────────────────────

export type AlertSeverity = 'low' | 'medium' | 'high' | 'critical'
export type AlertStatus = 'unverified' | 'community_confirmed' | 'official_confirmed' | 'false_report' | 'resolved'
export type AlertCategory = 'suspicious' | 'theft' | 'assault' | 'kidnapping' | 'fire' | 'accident' | 'other'

export interface Alert {
  id: string
  category: AlertCategory | string
  severity: AlertSeverity
  status: AlertStatus
  description: string
  location: {
    latitude: number
    longitude: number
    name?: string
  }
  photos?: string[]
  creatorId: string
  creatorName?: string
  confirmationCount: number
  falseReportCount: number
  createdAt: string
}

// ── Communities ──────────────────────────────────────────────────────────────

export type CommunityType = 'street' | 'estate' | 'school' | 'organisation' | 'public_place' | 'family'

export interface Community {
  id: string
  name: string
  description: string
  type: CommunityType | string
  locationArea?: string
  memberCount: number
  verified: boolean
  isPrivate: boolean
  createdAt: string
  creatorId: string
}

export interface CommunityMember {
  id: string
  userId: string
  name: string
  username: string
  role: string
  joinedAt: string
}

// ── Missing Persons ──────────────────────────────────────────────────────────

export type MissingPersonStatus = 'active' | 'found_safe' | 'found_deceased' | 'closed'

export interface MissingPerson {
  id: string
  caseId: string
  name: string
  age?: number
  gender?: string
  description: string
  photos?: string[]
  lastSeenLocation: {
    latitude: number
    longitude: number
    name?: string
  }
  lastSeenDate: string
  status: MissingPersonStatus
  reporterId: string
  contactNumber: string
  createdAt: string
}

// ── SOS Events ───────────────────────────────────────────────────────────────

export interface SOSEvent {
  id: string
  userId: string
  userName?: string
  status: 'active' | 'cancelled' | 'resolved'
  location?: {
    latitude: number
    longitude: number
    address?: string
  }
  contactsNotified: number
  triggeredAt: string
  resolvedAt?: string
  cancelledAt?: string
}

// ── Moderation ───────────────────────────────────────────────────────────────

export type ModerationItemType = 'alert' | 'user' | 'community'

export interface ModerationItem {
  type: ModerationItemType
  id: string
  title: string
  reason: string
  createdAt: string
}

// ── Dashboard ────────────────────────────────────────────────────────────────

export interface DashboardStats {
  totalUsers: number
  activeAlerts: number
  totalCommunities: number
  activeMissingCases: number
  sosEventsToday: number
  userGrowth: { date: string; count: number }[]
  alertTrends: { date: string; category: string; count: number }[]
  topAreas: { name: string; incidentCount: number }[]
}

// ── Member Reports ───────────────────────────────────────────────────────────

export type ReportCategory = 'harassment' | 'spam' | 'threats' | 'inappropriate_behavior' | 'impersonation' | 'scam' | 'other'
export type ReportStatus = 'pending' | 'under_review' | 'resolved' | 'dismissed'
export type EnforcementActionType = 'warn' | 'suspend' | 'ban'

export interface MemberReport {
  id: string
  reporter_user_id: string
  reported_user_id: string
  community_id: string
  category: ReportCategory
  description: string
  evidence_urls: string[]
  status: ReportStatus
  created_at: string
  updated_at: string
}

export interface EnforcementAction {
  id: string
  report_id: string
  action_type: EnforcementActionType | 'dismiss'
  admin_id: string
  notes: string | null
  duration_days: number | null
  created_at: string
}

export interface AdminReport extends MemberReport {
  reported_user_name: string
  reporter_user_name: string
  community_name: string
  report_count_against_user: number
}

export interface AdminReportDetail extends AdminReport {
  previous_actions: EnforcementAction[]
  reporter_profile: { full_name: string; username: string }
  reported_profile: { full_name: string; username: string }
}

export interface EnforcementActionInput {
  action_type: EnforcementActionType
  notes?: string
  duration_days?: number
}

export interface ReportHistorySummary {
  total_reports: number
  resolved_count: number
  pending_count: number
  previous_actions: EnforcementAction[]
}
