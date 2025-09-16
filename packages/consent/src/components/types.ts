import type {
  ConsentConfig,
  ConsentEvents,
  ConsentStatus,
  ConsentUserContext,
} from "@/types"

export type ConsentContextValue = {
  isConsentModalOpen: boolean
  setIsConsentModalOpen: (open: boolean) => void
  config: ConsentConfig
  userContext: ConsentUserContext
  events?: ConsentEvents
  isOptedOut: boolean
}

export type ConsentProviderProps = {
  config: ConsentConfig
  userContext: ConsentUserContext
  consentStatus: ConsentStatus
  userConsentVersion?: number
  userConsentStatementId?: string
  events?: ConsentEvents
  children: React.ReactNode
}
