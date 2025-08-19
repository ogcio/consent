// Client bundle - components and shared utilities
// Server actions are in @ogcio/consent/server

export { ConsentModal } from "./components/ConsentModal"
export { ConsentProvider, useConsent } from "./components/ConsentProvider"
export * from "./types"
export {
  createAnalyticsTracker,
  createNoOpAnalyticsTracker,
} from "./utils/analytics"
export type { ConsentConfigBuilder } from "./utils/config"
export {
  createDefaultConsentConfig,
  createMessagingConsentConfig,
} from "./utils/config"
