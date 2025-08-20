"use client"

import { ConsentStatuses, useConsent } from "@ogcio/consent"
import Link from "next/link"
import { useCallback, useEffect, useState } from "react"
import { fetchConsentStatus } from "@/lib/consent"

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

export default function HomePage() {
  const { isOptedOut, setIsConsentModalOpen } = useConsent()
  const [consentInfo, setConsentInfo] = useState<{
    status: string
    version?: string
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
      const globalUser = window.__mockUser
      if (globalUser) {
        setUserInfo({
          isPublicServant: globalUser.isPublicServant || false,
          preferredLanguage: globalUser.preferredLanguage || "en",
        })
      }
    }

    const handleUserContextChange = (event: CustomEvent) => {
      const { isPublicServant } = event.detail || {}
      if (typeof isPublicServant === "boolean") {
        setUserInfo((prev) => ({ ...prev, isPublicServant }))
      }
    }

    // Listen for custom events
    window.addEventListener("consentChanged", handleConsentChange)
    window.addEventListener(
      "userContextChanged",
      handleUserContextChange as EventListener,
    )

    // Initialize user info from global state
    handleConsentChange()

    return () => {
      window.removeEventListener("consentChanged", handleConsentChange)
      window.removeEventListener(
        "userContextChanged",
        handleUserContextChange as EventListener,
      )
    }
  }, [loadConsentInfo])

  const getStatusBadgeClass = (status: string) => {
    const baseClass = "status-badge"
    switch (status) {
      case ConsentStatuses.OptedIn:
        return `${baseClass} status-opted-in`
      case ConsentStatuses.OptedOut:
        return `${baseClass} status-opted-out`
      case ConsentStatuses.Pending:
        return `${baseClass} status-pending`
      case ConsentStatuses.PreApproved:
        return `${baseClass} status-pre-approved`
      default:
        return `${baseClass} status-undefined`
    }
  }

  return (
    <div className='min-h-screen bg-gray-50 py-8'>
      <div className='max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 gap-4'>
        {/* Hero Section */}
        <div className='text-center mb-12 flex flex-col items-center gap-2'>
          {/* Package Information */}
          <div className='demo-card bg-blue-50! border-blue-200!'>
            <h3 className='text-lg! font-semibold! text-blue-800 mb-3'>
              <Link
                href='https://github.com/ogcio/consent'
                target='_blank'
                rel='noopener noreferrer'
              >
                @ogcio/consent
              </Link>
            </h3>
            <p className='text-blue-700 mb-4'>
              A reusable consent management package for Next.js applications
            </p>
          </div>

          {/* Current Consent Status */}
          <div className='demo-card'>
            <div className='flex flex-col gap-2'>
              <div>
                <span className='text-gray-600'>Status: </span>
                {consentInfo && (
                  <span className={getStatusBadgeClass(consentInfo.status)}>
                    {consentInfo.status}
                  </span>
                )}
              </div>
              <div>
                <span className='text-gray-600'>User Type: </span>
                <span
                  className={`status-badge ${userInfo.isPublicServant ? "status-pre-approved" : "status-undefined"}`}
                >
                  {userInfo.isPublicServant ? "Public Servant" : "Regular User"}
                </span>
              </div>
              {consentInfo?.version && (
                <div>
                  <span className='text-gray-600'>Version: </span>
                  <span className='font-mono text-xs bg-gray-100 px-2 py-1 rounded'>
                    {consentInfo.version}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Current Status Information */}
        {isOptedOut && (
          <div className='demo-card bg-yellow-50 border-yellow-200'>
            <h3 className='text-lg! font-semibold! text-yellow-800 mb-2'>
              ⚠️ Limited Functionality
            </h3>
            <p className='text-yellow-700'>
              You have declined consent, so some features in this demo may be
              disabled or limited. You can change your consent preferences at
              any time.
            </p>
          </div>
        )}

        {/* Public Servant Information */}
        {userInfo.isPublicServant && (
          <div className='demo-card bg-blue-50 border-blue-200'>
            <h3 className='text-lg! font-semibold! text-blue-800 mb-2'>
              🏛️ Public Servant Mode
            </h3>
            <p className='text-blue-700'>
              You are currently experiencing the application as a public
              servant. Enhanced privacy protections and different consent rules
              may apply to government employees. This mode demonstrates how the
              consent package can adapt to different user contexts.
            </p>
          </div>
        )}

        {/* Features Overview */}
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12'>
          <div className='demo-card flex flex-col gap-2 justify-between'>
            <h3 className='text-lg! font-semibold! mb-3'>
              🎯 Smart Modal Logic
            </h3>
            <p className='text-gray-600 mb-4'>
              The consent modal appears automatically based on user status,
              consent version, and custom rules.
            </p>
            <button
              type='button'
              onClick={() => setIsConsentModalOpen(true)}
              className='demo-button demo-button-primary text-center'
            >
              Force Show Modal
            </button>
          </div>

          <div className='demo-card flex flex-col gap-2 justify-between'>
            <h3 className='text-lg! font-semibold! mb-3'>
              📊 Analytics Integration
            </h3>
            <p className='text-gray-600 mb-4'>
              Track user consent decisions and modal interactions with built-in
              analytics support.
            </p>
            <Link
              href='/analytics'
              className='demo-button demo-button-primary text-center'
            >
              View Analytics
            </Link>
          </div>

          <div className='demo-card flex flex-col gap-2 justify-between'>
            <h3 className='text-lg! font-semibold! mb-3'>
              🔧 Multiple Scenarios
            </h3>
            <p className='text-gray-600 mb-4'>
              Explore different consent scenarios and configurations in action.
            </p>
            <Link
              href='/scenarios'
              className='demo-button demo-button-primary text-center'
            >
              View Scenarios
            </Link>
          </div>

          <div className='demo-card flex flex-col gap-2 justify-between'>
            <h3 className='text-lg! font-semibold! mb-3'>⚙️ API Integration</h3>
            <p className='text-gray-600 mb-4'>
              See how to integrate with your backend API for consent storage and
              retrieval.
            </p>
            <Link
              href='/api-example'
              className='demo-button demo-button-primary text-center'
            >
              API Examples
            </Link>
          </div>

          <div className='demo-card flex flex-col gap-2 justify-between'>
            <h3 className='text-lg! font-semibold! mb-3'>🌍 Multi-language</h3>
            <p className='text-gray-600 mb-4'>
              Built-in support for internationalization with English and Irish
              languages.
            </p>
            <Link
              href='/i18n'
              className='demo-button demo-button-primary text-center'
            >
              Language Demo
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
