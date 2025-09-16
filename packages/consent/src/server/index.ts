// Server bundle - server actions and shared utilities

// Re-export shared types and utilities needed on server
export * from "../types"
export { transformBackendResponse } from "../utils/transformers"
export {
  getConsentStatement,
  getCurrentConsentStatement,
  getIsConsentEnabled,
  getLatestConsent,
  listConsents,
  setConsentToPending,
  submitConsent,
} from "./actions"
