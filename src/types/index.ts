// Core domain types for the SCORE Football Academy platform.
// These mirror the Firestore collections defined in src/lib/collections.ts

export type UserRole = 'super_admin' | 'admin' | 'coach' | 'parent' | 'player'

export interface AppUser {
  uid: string
  email: string
  displayName: string
  role: UserRole
  phone?: string
  createdAt: number
  linkedPlayerIds?: string[] // for parent role — every child this parent supervises
  linkedTeamIds?: string[] // for coach role
}

export type SkillLevel = 'beginner' | 'developing' | 'good' | 'very_good' | 'excellent'

export interface PerformanceEvaluation {
  id: string
  playerId: string
  coachId: string
  date: number
  technical: {
    passing: SkillLevel
    dribbling: SkillLevel
    ballControl: SkillLevel
    shooting: SkillLevel
    firstTouch: SkillLevel
    defending: SkillLevel
  }
  physical: {
    speed: SkillLevel
    agility: SkillLevel
    stamina: SkillLevel
    strength: SkillLevel
  }
  mental: {
    discipline: SkillLevel
    confidence: SkillLevel
    teamwork: SkillLevel
    decisionMaking: SkillLevel
  }
  notes?: string
}

export interface Player {
  id: string
  fullName: string
  dateOfBirth: string
  gender: 'male' | 'female'
  nationality: string
  preferredPosition: string
  preferredFoot?: 'left' | 'right' | 'both'
  jerseyNumber?: number
  currentLevel: string
  photoUrl?: string
  teamId?: string
  joiningDate: number
  status: 'pending' | 'active' | 'archived'
  // A player may be supervised by more than one parent/guardian account.
  parentUserIds: string[]
  // The player's own login (see the "player" role) — optional because a
  // player can exist and be supervised by a parent before they've signed
  // up for their own account; an admin links the two via UID afterward,
  // the same pattern already used to link a coach's account to a Coach doc.
  playerUserId?: string
  previousClub?: string
  experience?: string
  medicalNotes?: string
  emergencyContact: {
    name: string
    phone: string
  }
}

export interface Coach {
  id: string
  userId: string
  fullName: string
  photoUrl?: string
  specialty?: string
  assignedTeamIds: string[]
}

export interface Team {
  id: string
  name: string
  ageGroup: string
  coachId?: string
  playerIds: string[]
}

export interface Program {
  id: string
  name: string
  ageRange: string
  description: string
  price?: string
  order: number
}

export type TrainingStatus = 'scheduled' | 'completed' | 'cancelled'

export interface TrainingSession {
  id: string
  teamId: string
  date: number
  time: string
  location: string
  coachId: string
  type: string
  status: TrainingStatus
}

export type AttendanceStatus = 'present' | 'late' | 'absent' | 'excused'

export interface AttendanceRecord {
  id: string
  sessionId: string
  playerId: string
  status: AttendanceStatus
  markedAt: number
  checkInTime?: number
  checkOutTime?: number
}

export interface Match {
  id: string
  teamId: string
  opponent: string
  date: number
  kickoffTime: string
  location: string
  isHome: boolean
  result?: {
    scoreFor: number
    scoreAgainst: number
  }
}

export interface Announcement {
  id: string
  title: string
  body: string
  category: 'news' | 'training' | 'match' | 'event' | 'notice'
  publishedAt: number
  published: boolean
  imageUrl?: string
}

export interface GalleryItem {
  id: string
  imageUrl: string
  caption?: string
  category: 'training' | 'match' | 'team' | 'event'
  uploadedAt: number
  // Players tagged in this photo, for the personal "My Football Journey"
  // gallery. Omitted/empty means it's a general academy photo shown only
  // on the public gallery, never surfaced in any player's personal view.
  playerIds?: string[]
}

export interface Registration {
  id: string
  player: Pick<Player, 'fullName' | 'dateOfBirth' | 'gender' | 'nationality' | 'preferredPosition' | 'currentLevel'>
  parentName: string
  parentPhone: string
  parentEmail: string
  relationship: string
  previousClub?: string
  experience?: string
  medicalNotes?: string
  emergencyContactName: string
  emergencyContactPhone: string
  submittedAt: number
  status: 'pending' | 'approved' | 'rejected'
}

// ---- Messaging ----
// One conversation per parent with "the coaching staff" (any coach or
// admin can read/reply — this mirrors a shared academy inbox rather
// than a specific 1:1 with a single named coach). The conversation
// document's id is always the parent's Firebase Auth uid, which keeps
// the security rule simple: a parent may only touch the conversation
// whose id equals their own uid.
export interface Conversation {
  id: string
  parentUserId: string
  parentName: string
  lastMessageText: string
  lastMessageAt: number
  lastSenderRole: 'parent' | 'staff' | null
  unreadByStaff: boolean
  unreadByParent: boolean
}

export interface ChatMessage {
  id: string
  senderId: string
  senderRole: 'parent' | 'staff'
  senderName: string
  text: string
  sentAt: number
}

// ---- Daily Tasks ----
// Assigned by a coach to one of their players; the player can only ever
// toggle `completed` on their own task, never edit its content — enforced
// in firestore.rules, not just in the UI.
export interface DailyTask {
  id: string
  playerId: string
  title: string
  date: number // local-midnight timestamp of the day this task is assigned for
  completed: boolean
  assignedBy: string // coachId
  createdAt: number
}

// ---- Match player statistics ----
// One document per (match, player) pair. Coaches/admins enter these after
// a match; players and their parents can only ever read them.
export interface MatchPlayerStat {
  id: string
  matchId: string
  playerId: string
  goals: number
  assists: number
  shots: number
  shotsOnTarget: number
  passes: number
  successfulPasses: number
  keyPasses: number
  tackles: number
  interceptions: number
  ballRecoveries: number
  clearances: number
  blocks: number
  minutesPlayed: number
}

