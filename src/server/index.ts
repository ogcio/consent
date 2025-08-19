// Server bundle - server actions and shared utilities

// Re-export shared types and utilities needed on server
export * from "../types"
export {
  createFallbackContent,
  transformBackendResponse,
} from "../utils/transformers"
export {
  getConsentStatementContent,
  getIsConsentEnabled,
  setConsentToPending,
  submitConsent,
} from "./actions"
