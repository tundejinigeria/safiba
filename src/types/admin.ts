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
export type AlertCategory = 'suspicious' | 'theft' | 'assault' | 'fire' | 'accident' | 'other'

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
