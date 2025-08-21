import type {
  ConsentAction,
  ConsentAnalyticsEvent,
  ConsentAnalyticsTracker,
} from "@/types"
import { CONSENT_CATEGORY } from "@/types"

/**
 * Creates a consent analytics event
 */
export const createConsentAnalyticsEvent = ({
  name,
  action,
}: {
  name: string
  action: string
}): ConsentAnalyticsEvent => ({
  event: {
    category: CONSENT_CATEGORY,
    action,
    name,
    value: 1,
  },
})

/**
 * Creates a default analytics tracker that can be used with any analytics system
 */
export const createAnalyticsTracker = (
  trackEvent: (event: ConsentAnalyticsEvent) => void,
): ConsentAnalyticsTracker => {
  return {
    trackConsentDecision: (action: ConsentAction) => {
      trackEvent(
        createConsentAnalyticsEvent({
          name: "consent",
          action,
        }),
      )
    },
    trackConsentError: (action: ConsentAction) => {
      trackEvent(
        createConsentAnalyticsEvent({
          name: "consent-error",
          action,
        }),
      )
    },
    trackConsentSuccess: (action: ConsentAction) => {
      trackEvent(
        createConsentAnalyticsEvent({
          name: "consent-success",
          action,
        }),
      )
    },
  }
}

/**
 * Creates a no-op analytics tracker for when analytics is not needed
 */
export const createNoOpAnalyticsTracker = (): ConsentAnalyticsTracker => {
  return {
    trackConsentDecision: () => {},
    trackConsentError: () => {},
    trackConsentSuccess: () => {},
  }
}
