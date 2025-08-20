// All shared types and constants in one place
export {
  CONSENT_ACTIONS,
  CONSENT_CATEGORY,
  type ConsentStatus,
  ConsentStatuses,
  DEFAULT_CONSENT_SUBJECT,
  FORCE_CONSENT_PARAM,
  MESSAGING_CONSENT_SUBJECT,
} from "../constants"

import type { ConsentStatus } from "../constants"

// Backend API response structure
export type ConsentStatementTranslation = {
  id: string
  consentStatementId: string
  language: string
  title: string | null
  bodyTop: string[]
  bodyList: string[]
  bodyBottom: string[]
  bodySmall: string[]
  bodyFooter: string | null
  bodyLinks: Record<string, string> // Dynamic links from backend (tc, pp, etc.)
  createdAt: string
}

export type ConsentStatementLanguages = "en" | "ga"

export type ConsentStatementData = {
  id: string
  subject: string
  version: number
  createdAt: string
  translations: Record<ConsentStatementLanguages, ConsentStatementTranslation>
}

export type ConsentStatementResponse = {
  data: ConsentStatementData
}

// Frontend content structure (transformed from backend)
export type ConsentStatementContent = {
  // Version tracking for consent updates
  version: {
    id: string
    createdAt: string // ISO date string
    description?: string // Optional description of what changed
  }

  title: string
  bodyParagraphs: string[]
  listItems: string[]
  bodyBottom?: string[]
  infoAlert?: {
    title: string
    items: string[]
  }
  footerText: string
  buttons: {
    accept: string
    decline: string
  }
  success: {
    title: string
    message?: string
  }
  error: {
    title: string
    message: string
  }
  // Dynamic links from backend
  links: Record<string, string>
}

export type ConsentLinks = {
  privacyPolicy: string
  termsAndConditions: string
}

export type ConsentResult = {
  error?: {
    detail: string
  }
}

export type ConsentAPI = {
  readonly consentStatementId: string
  submitConsent(params: {
    accept: boolean
    subject: string
    preferredLanguage?: string
    versionId?: string
  }): Promise<ConsentResult>
  setConsentToPending(subject: string): Promise<ConsentResult>
}

// Analytics types
export type ConsentAnalyticsEvent = {
  event: {
    category: string
    action: string
    name: string
    value: number
  }
}

export type ConsentAnalytics = {
  trackEvent: (event: ConsentAnalyticsEvent) => void
  category?: string
}

export type ConsentAction = "accept" | "decline"

export type ConsentAnalyticsTracker = {
  trackConsentDecision: (action: ConsentAction) => void
  trackConsentError: (action: ConsentAction) => void
  trackConsentSuccess: (action: ConsentAction) => void
}

// User context and configuration types
export type ConsentUserContext = {
  isPublicServant: boolean
  preferredLanguage: string
  [key: string]: unknown
}

export type ConsentModalVisibilityParams = {
  userContext: ConsentUserContext
  consentStatus: ConsentStatus
  searchParams: URLSearchParams
  // Version tracking for checking if user needs to re-consent
  userConsentVersion?: string // Version ID the user previously consented to
  latestConsentVersion: string // Latest version ID from API
}

export type ConsentConfig = {
  subject: string

  // Content (from backend) - now includes links
  content: ConsentStatementContent

  // User context configuration
  userContext: {
    getPreferredLanguage: (user: ConsentUserContext) => string
  }

  // Composable modal visibility logic
  shouldShowModal: (params: ConsentModalVisibilityParams) => boolean

  // API integration
  api: (latestConsentVersion: string) => ConsentAPI

  // Analytics (optional)
  analytics?: ConsentAnalytics

  // Simplified analytics tracker (optional, preferred over analytics)
  analyticsTracker?: ConsentAnalyticsTracker

  // Feature flags
  featureFlags?: {
    isEnabled: () => boolean
  }

  // Routing behavior
  onConsentSuccess?: {
    redirectTo?:
      | string
      | ((accepted: boolean, preferredLanguage: string) => string)
    showToast?: boolean
  }

  // URL parameters
  forceModalParam?: string
}

export type ConsentEvents = {
  onConsentDecision?: (accepted: boolean) => void
  onConsentError?: (error: Error) => void
  onModalOpen?: () => void
  onModalClose?: () => void
  onScrollToBottom?: () => void
}

// Default content for fallback scenarios
export const DEFAULT_CONSENT_CONTENT = {
  title: "Consent Required",
  bodyParagraphs: [
    "This application requires your consent to proceed.",
    "Please review the information below and provide your consent.",
  ],
  listItems: [
    "We will process your data in accordance with our privacy policy",
    "You can withdraw your consent at any time",
  ],
  footerText:
    "By accepting, you agree to our terms and conditions and privacy policy.",
  buttons: {
    accept: "Accept",
    decline: "Decline",
  },
  success: {
    title: "Consent Updated",
    message: "Your consent preferences have been updated successfully.",
  },
  error: {
    title: "Error",
    message: "An error occurred while updating your consent. Please try again.",
  },
  links: {
    tc: "#",
    pp: "#",
  },
  version: {
    id: "default",
    createdAt: new Date().toISOString(),
  },
}

// Server-side types
export type ProfileClient = {
  submitConsent: (params: {
    status: string
    subject: string
    consentStatementId: string
  }) => Promise<{ error?: { detail: string } }>
  getLatestConsentStatement: (params: { subject: string }) => Promise<{
    error?: { detail: string }
    data?: { data: ConsentStatementData }
  }>
}

export type FeatureFlagsClient = {
  isFlagEnabled: (
    flagName: string,
    context: { userId: string },
  ) => Promise<boolean>
}

export type BuildingBlocksClients = {
  profileClient: ProfileClient
  featureFlagsClient: FeatureFlagsClient
}

export type Logger = {
  error: (context: object, message: string) => void
}
