// Server-safe constants that can be imported in both client and server code
// These don't depend on React or any client-side libraries

export const ConsentStatuses = {
  Pending: "pending",
  Undefined: "undefined",
  PreApproved: "pre-approved",
  OptedOut: "opted-out",
  OptedIn: "opted-in",
} as const

export type ConsentStatus =
  (typeof ConsentStatuses)[keyof typeof ConsentStatuses]

// URL parameter constants
export const FORCE_CONSENT_PARAM = "force-consent"

// Analytics constants
export const CONSENT_CATEGORY = "consent"

export const CONSENT_ACTIONS = {
  ACCEPT: "accept" as const,
  DECLINE: "decline" as const,
}

// Default consent subjects
export const DEFAULT_CONSENT_SUBJECT = "general"
export const MESSAGING_CONSENT_SUBJECT = "messaging"
