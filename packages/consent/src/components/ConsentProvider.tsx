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
  const [hasUserClosedModal, setHasUserClosedModal] = useState(false)

  // Check if user has opted out
  const isOptedOut = consentStatus === ConsentStatuses.OptedOut

  // Determine if modal should be shown
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search)
    const modalParams = {
      userContext,
      consentStatus,
      searchParams,
      userConsentVersion,
      userConsentStatementId,
      latestConsentVersion: config.content?.version ?? 0,
      latestConsentStatementId: config.content?.id ?? "",
    }

    const shouldShow = config.shouldShowModal(modalParams)
    const isForceParam =
      searchParams.get(config.forceModalParam || "force-consent") === "1"

    // Don't reopen modal if user has already closed it
    if (hasUserClosedModal && isForceParam) {
      return
    }

    if (shouldShow && !isConsentModalOpen) {
      setIsConsentModalOpen(true)
      events?.onModalOpen?.()
    } else if (!shouldShow && isConsentModalOpen) {
      setIsConsentModalOpen(false)
      events?.onModalClose?.()
    }
  }, [
    config,
    userContext,
    consentStatus,
    userConsentVersion,
    userConsentStatementId,
    events,
    isConsentModalOpen,
    hasUserClosedModal,
  ])

  // Custom modal close handler that tracks when user closes modal
  const handleModalClose = (value: boolean) => {
    setIsConsentModalOpen(value)
    if (!value) {
      setHasUserClosedModal(true)
    }
  }

  const contextValue: ConsentContextValue = {
    isConsentModalOpen,
    setIsConsentModalOpen: handleModalClose,
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
