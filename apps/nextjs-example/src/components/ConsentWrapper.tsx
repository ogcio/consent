"use client"

import { ConsentProvider, ConsentStatuses } from "@ogcio/consent"
import { useEffect, useState } from "react"
import {
  createDemoConsentConfig,
  fetchConsentStatus,
  mockUser,
} from "@/lib/consent"

interface ConsentWrapperProps {
  children: React.ReactNode
  isConsentEnabled?: boolean
}

export function ConsentWrapper({
  children,
  isConsentEnabled = true,
}: ConsentWrapperProps) {
  const [consentStatus, setConsentStatus] = useState<
    (typeof ConsentStatuses)[keyof typeof ConsentStatuses]
  >(ConsentStatuses.Undefined)
  const [userConsentVersion, setUserConsentVersion] = useState<
    string | undefined
  >()
  const [isLoading, setIsLoading] = useState(true)

  // Fetch initial consent status
  useEffect(() => {
    async function loadConsentStatus() {
      try {
        const { consentStatus: status, userConsentVersion: version } =
          await fetchConsentStatus("demo-app")
        setConsentStatus(status)
        setUserConsentVersion(version)
      } catch (error) {
        console.error("Failed to load consent status:", error)
        // Use default values on error
      } finally {
        setIsLoading(false)
      }
    }

    loadConsentStatus()
  }, [])

  // Create consent configuration
  const consentConfig = createDemoConsentConfig(isConsentEnabled)

  // Event handlers
  const events = {
    onConsentDecision: (accepted: boolean) => {
      console.log(`🔒 User ${accepted ? "accepted" : "declined"} consent`)

      // Update local state
      setConsentStatus(accepted ? "opted-in" : "opted-out")
      if (accepted) {
        setUserConsentVersion(consentConfig.content.version.id)
      } else {
        setUserConsentVersion(undefined)
      }

      // In a real application, you might:
      // - Refresh the page to apply new permissions
      // - Enable/disable features based on consent
      // - Update user preferences
      // - Trigger analytics events
    },
    onConsentError: (error: Error) => {
      console.error("🚨 Consent error:", error)
      // In a real application, you might show a user-friendly error message
      // or retry the operation
    },
    onModalOpen: () => {
      console.log("📖 Consent modal opened")
    },
    onModalClose: () => {
      console.log("📖 Consent modal closed")
    },
    onScrollToBottom: () => {
      console.log("📜 User scrolled to bottom of consent modal")
    },
  }

  // Show loading state while fetching consent status
  if (isLoading) {
    return (
      <div className='min-h-screen flex items-center justify-center'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4'></div>
          <p className='text-gray-600'>Loading consent preferences...</p>
        </div>
      </div>
    )
  }

  return (
    <ConsentProvider
      config={consentConfig}
      userContext={{
        isPublicServant: mockUser.isPublicServant,
        preferredLanguage: mockUser.preferredLanguage,
      }}
      consentStatus={consentStatus}
      userConsentVersion={userConsentVersion}
      events={events}
    >
      {children}
    </ConsentProvider>
  )
}
