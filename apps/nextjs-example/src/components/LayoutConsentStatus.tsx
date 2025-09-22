"use client"

import { useConsent } from "@ogcio/consent"
import { Alert } from "@ogcio/design-system-react"
import { useCallback, useEffect, useState } from "react"
import { fetchConsentStatus } from "@/lib/consent"
import ConsentStatusCard from "./ConsentStatusCard"

interface MockUser {
  id: string
  isPublicServant: boolean
  preferredLanguage: string
  isAuthenticated: boolean
}

declare global {
  interface Window {
    __mockUser?: MockUser
  }
}

export default function LayoutConsentStatus() {
  const { isOptedOut } = useConsent()
  const [consentInfo, setConsentInfo] = useState<{
    status: string
    version?: number
  } | null>(null)
  const [userInfo, setUserInfo] = useState<{
    isPublicServant: boolean
    preferredLanguage: string
  }>({ isPublicServant: false, preferredLanguage: "en" })

  const loadConsentInfo = useCallback(async () => {
    const { consentStatus, userConsentVersion } =
      await fetchConsentStatus("demo-app")
    setConsentInfo({
      status: consentStatus,
      version: userConsentVersion,
    })
  }, [])

  useEffect(() => {
    loadConsentInfo()
  }, [loadConsentInfo])

  // Listen for consent changes to refresh status
  useEffect(() => {
    const handleConsentChange = () => {
      loadConsentInfo()
      // Also sync user info from global state
      if (typeof window !== "undefined") {
        const globalUser = window.__mockUser
        if (globalUser) {
          setUserInfo({
            isPublicServant: globalUser.isPublicServant || false,
            preferredLanguage: globalUser.preferredLanguage || "en",
          })
        }
      }
    }

    const handleUserContextChange = (event: CustomEvent) => {
      const { isPublicServant } = event.detail || {}
      if (typeof isPublicServant === "boolean") {
        setUserInfo((prev) => ({ ...prev, isPublicServant }))
      }
    }

    // Listen for custom events
    if (typeof window !== "undefined") {
      window.addEventListener("consentChanged", handleConsentChange)
      window.addEventListener(
        "userContextChanged",
        handleUserContextChange as EventListener,
      )

      // Initialize user info from global state
      handleConsentChange()
    }

    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener("consentChanged", handleConsentChange)
        window.removeEventListener(
          "userContextChanged",
          handleUserContextChange as EventListener,
        )
      }
    }
  }, [loadConsentInfo])

  return (
    <>
      <ConsentStatusCard consentInfo={consentInfo} userInfo={userInfo} />

      {isOptedOut && (
        <Alert variant='warning' title='Limited Functionality'>
          You have declined consent, so some features in this demo may be
          disabled or limited. You can change your consent preferences at any
          time.
        </Alert>
      )}

      {userInfo.isPublicServant && (
        <Alert variant='info' title='Public Servant Mode'>
          You are currently experiencing the application as a public servant.
          Enhanced privacy protections and different consent rules may apply to
          government employees. This mode demonstrates how the consent package
          can adapt to different user contexts.
        </Alert>
      )}
    </>
  )
}
