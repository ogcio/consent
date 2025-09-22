"use client"

// TODO: import the toast provider conditionally only if the consumers requires toasts
import { ToastProvider } from "@ogcio/design-system-react"
import { createContext, useContext, useEffect, useState } from "react"
import { ConsentStatuses } from "@/constants"
import { ConsentModal } from "./ConsentModal"
import type { ConsentContextValue, ConsentProviderProps } from "./types"

const ConsentContext = createContext<ConsentContextValue | undefined>(undefined)

export const ConsentProvider: React.FC<ConsentProviderProps> = ({
  config,
  userContext,
  consentStatus,
  userConsentVersion,
  userConsentStatementId,
  events,
  children,
}) => {
  const [isConsentModalOpen, setIsConsentModalOpen] = useState(false)
  const [isManuallyOpened, setIsManuallyOpened] = useState(false)

  // Check if user has opted out
  const isOptedOut = consentStatus === ConsentStatuses.OptedOut

  // Determine if modal should be shown
  useEffect(() => {
    const checkShouldShowModal = () => {
      const shouldShow = config.shouldShowModal({
        userContext,
        consentStatus,
        searchParams: new URLSearchParams(window.location.search),
        userConsentVersion,
        userConsentStatementId,
        latestConsentVersion: config.content?.version ?? 0,
        latestConsentStatementId: config.content?.id ?? "",
      })

      if (shouldShow && !isConsentModalOpen) {
        setIsConsentModalOpen(true)
        events?.onModalOpen?.()
      } else if (!shouldShow && isConsentModalOpen && !isManuallyOpened) {
        setIsConsentModalOpen(false)
        events?.onModalClose?.()
      }
    }

    checkShouldShowModal()
  }, [
    config,
    userContext,
    consentStatus,
    userConsentVersion,
    userConsentStatementId,
    events,
    isConsentModalOpen,
    isManuallyOpened,
  ])

  const contextValue: ConsentContextValue = {
    isConsentModalOpen,
    setIsConsentModalOpen: (open: boolean, manual = false) => {
      setIsConsentModalOpen(open)
      setIsManuallyOpened(manual && open)
    },
    config,
    userContext,
    events,
    isOptedOut,
  }

  // TODO: render the toast provider conditionally only if the consumers requires toasts
  return (
    <ConsentContext.Provider value={contextValue}>
      {children}
      <ToastProvider />
      <ConsentModal />
    </ConsentContext.Provider>
  )
}

export const useConsent = (): ConsentContextValue => {
  const context = useContext(ConsentContext)
  if (!context) {
    throw new Error("useConsent must be used within a ConsentProvider")
  }
  return context
}
