import type {
  ConsentConfig,
  ConsentLinks,
  ConsentModalVisibilityParams,
  ConsentStatementContent,
  ConsentUserContext,
} from "@/types"
import { ConsentStatuses, FORCE_CONSENT_PARAM } from "@/types"

export interface ConsentConfigBuilder {
  subject: string
  content: ConsentStatementContent | undefined
  isConsentEnabled?: boolean
  forceModalParam?: string
  showToastOnSuccess?: boolean
  links?: ConsentLinks
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
  links,
}: ConsentConfigBuilder): ConsentConfig => {
  return {
    subject,
    content: content && links ? { ...content, links } : content,

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
      userConsentStatementId,
      latestConsentVersion,
      latestConsentStatementId,
    }: ConsentModalVisibilityParams) => {
      // 1. Feature flag check first
      if (!isConsentEnabled) return false

      // 2. User type check - don't show to public servants by default
      if (userContext.isPublicServant) return false

      // 3. Consent status check
      const hasValidConsent =
        consentStatus === ConsentStatuses.OptedIn ||
        consentStatus === ConsentStatuses.OptedOut

      // biome-ignore lint/correctness/noUnusedVariables: TODO: might be needed in the future
      const hasValidVersion = userConsentVersion === latestConsentVersion
      const hasCurrentStatement =
        userConsentStatementId === latestConsentStatementId

      // 4. Force show parameter check
      const shouldForceShowModal = searchParams.get(forceModalParam) === "1"

      // 5. Final decision: show if no valid consent OR outdated version OR forced
      const result =
        !hasValidConsent || !hasCurrentStatement || shouldForceShowModal

      return result
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
