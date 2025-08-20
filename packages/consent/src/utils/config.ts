import type {
  ConsentConfig,
  ConsentModalVisibilityParams,
  ConsentStatementContent,
  ConsentUserContext,
} from "@/types"
import { ConsentStatuses, FORCE_CONSENT_PARAM } from "@/types"

export interface ConsentConfigBuilder {
  subject: string
  content: ConsentStatementContent
  isConsentEnabled?: boolean
  forceModalParam?: string
  showToastOnSuccess?: boolean
}

/**
 * Creates a default consent configuration with sensible defaults
 */
export const createDefaultConsentConfig = ({
  subject,
  content,
  isConsentEnabled = true,
  forceModalParam = FORCE_CONSENT_PARAM,
  showToastOnSuccess = true,
}: ConsentConfigBuilder): ConsentConfig => {
  return {
    subject,
    content,

    userContext: {
      getPreferredLanguage: (user: ConsentUserContext) => {
        return user.preferredLanguage
      },
    },

    // Default modal visibility logic
    shouldShowModal: ({
      userContext,
      consentStatus,
      searchParams,
      userConsentVersion,
      latestConsentVersion,
    }: ConsentModalVisibilityParams) => {
      // 1. Feature flag check first
      if (!isConsentEnabled) return false

      // 2. User type check - don't show to public servants by default
      if (userContext.isPublicServant) return false

      // 3. Consent status check
      const hasValidConsent =
        consentStatus === ConsentStatuses.OptedIn ||
        consentStatus === ConsentStatuses.OptedOut

      const hasValidVersion = userConsentVersion === latestConsentVersion

      // 4. Force show parameter check
      const shouldForceShowModal = searchParams.get(forceModalParam) === "1"

      // 5. Final decision: show if no valid consent OR outdated version OR forced
      return !hasValidConsent || !hasValidVersion || shouldForceShowModal
    },

    // API integration - this needs to be provided by the consuming application
    api: () => {
      throw new Error(
        "API implementation must be provided by the consuming application",
      )
    },

    // Feature flags
    featureFlags: {
      isEnabled: () => isConsentEnabled,
    },

    // Success behavior
    onConsentSuccess: {
      showToast: showToastOnSuccess,
    },

    // URL parameters
    forceModalParam,
  }
}
