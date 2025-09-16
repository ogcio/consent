// All shared types and constants in one place
export {
  CONSENT_ACTIONS,
  CONSENT_CATEGORY,
  type ConsentStatus,
  ConsentStatuses,
  DEFAULT_CONSENT_SUBJECT,
  FORCE_CONSENT_PARAM,
  MESSAGING_CONSENT_SUBJECT,
} from "@/constants"

import type { ConsentStatus } from "@/constants"

export type BuildingBlocksConsentStatus = NonNullable<
  Awaited<ReturnType<BuildingBlocksProfileClient["getLatestConsent"]>>["data"]
>["status"]
export type ConsentStatementLanguages = "en" | "ga"
export type BuildingBlocksConsentStatementData = NonNullable<
  Awaited<
    ReturnType<BuildingBlocksProfileClient["getCurrentConsentStatement"]>
  >["data"]
>[0]
export type BuildingBlocksConsentStatementTranslation =
  BuildingBlocksConsentStatementData["translations"][ConsentStatementLanguages]
export type ConsentStatementTranslation =
  BuildingBlocksConsentStatementTranslation
export type ConsentStatementData = {
  id: string
  subject: string
  version: number
  createdAt: string
  publishDate: string
  isEnabled: boolean
  createdBy: string
  translations: Record<ConsentStatementLanguages, ConsentStatementTranslation>
}

// Frontend content structure (transformed from backend)
export type ConsentStatementContent = {
  id: string // Consent statement ID
  version: number
  publishDate: string
  isEnabled: boolean
  title: string
  description: string | null
  disclaimer: string | null
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
  links?: ConsentLinks
}

export type ConsentLinks = {
  privacyPolicy: {
    url: string
    text: string
  }
  termsAndConditions: {
    url: string
    text: string
  }
}

export type ConsentResult = {
  error?: {
    detail: string
  }
}

export type ConsentAPI = {
  readonly consentStatementId: string
  readonly version: number
  submitConsent(params: {
    accept: boolean
    subject: string
    preferredLanguage?: string
    versionId?: number
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
  userConsentVersion?: number
  userConsentStatementId?: string
  latestConsentVersion: number
  latestConsentStatementId: string
}

export type ConsentConfig = {
  subject: string

  // Content
  content: ConsentStatementContent | undefined

  // User context configuration
  userContext: {
    getPreferredLanguage: (user: ConsentUserContext) => string
  }

  // Composable modal visibility logic
  shouldShowModal: (params: ConsentModalVisibilityParams) => boolean

  // API integration
  api: (latestConsentVersion: number, consentStatementId: string) => ConsentAPI

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

  // Language switcher configuration (optional)
  languageSwitcher?: {
    translations: {
      english: string
      irish: string
    }
  }
}

export type ConsentEvents = {
  onConsentDecision?: (accepted: boolean) => void
  onConsentError?: (error: Error) => void
  onModalOpen?: () => void
  onModalClose?: () => void
  onScrollToBottom?: () => void
}

export type BuildingBlocksError = NonNullable<
  Awaited<ReturnType<BuildingBlocksProfileClient["submitConsent"]>>["error"]
>

export type BuildingBlocksProfileClient = ReturnType<
  typeof import("@ogcio/building-blocks-sdk").getBuildingBlockSDK
>["profile"]["citizen"]

export type FeatureFlagsClient = ReturnType<
  typeof import("@ogcio/building-blocks-sdk").getBuildingBlockSDK
>["featureFlags"]

export type BuildingBlocksConsentResponse = Awaited<
  ReturnType<BuildingBlocksProfileClient["getLatestConsent"]>
>["data"]
export type BuildingBlocksConsentsListResponse = Awaited<
  ReturnType<BuildingBlocksProfileClient["listConsents"]>
>["data"]
export type BuildingBlocksConsentStatementResponse = Awaited<
  ReturnType<BuildingBlocksProfileClient["getCurrentConsentStatement"]>
>["data"]

export type BuildingBlocksClients = {
  profileClient: BuildingBlocksProfileClient
  featureFlagsClient: FeatureFlagsClient
}

export type StandardError = {
  error: { detail: string }
}

export type Logger = {
  error: (context: object, message: string) => void
}
