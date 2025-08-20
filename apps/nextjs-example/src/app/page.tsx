"use client"

import { useConsent } from "@ogcio/consent"
import Link from "next/link"
import { useEffect, useState } from "react"
import { fetchConsentStatus } from "@/lib/consent"

export default function HomePage() {
  const { isOptedOut, config } = useConsent()
  const [consentInfo, setConsentInfo] = useState<{
    status: string
    version?: string
  } | null>(null)

  useEffect(() => {
    async function loadConsentInfo() {
      const { consentStatus, userConsentVersion } =
        await fetchConsentStatus("demo-app")
      setConsentInfo({
        status: consentStatus,
        version: userConsentVersion,
      })
    }
    loadConsentInfo()
  }, [])

  const getStatusBadgeClass = (status: string) => {
    const baseClass = "status-badge"
    switch (status) {
      case "opted-in":
        return `${baseClass} status-opted-in`
      case "opted-out":
        return `${baseClass} status-opted-out`
      case "pending":
        return `${baseClass} status-pending`
      case "pre-approved":
        return `${baseClass} status-pre-approved`
      default:
        return `${baseClass} status-undefined`
    }
  }

  return (
    <div className='min-h-screen bg-gray-50 py-8'>
      <div className='max-w-4xl mx-auto px-4 sm:px-6 lg:px-8'>
        {/* Hero Section */}
        <div className='text-center mb-12'>
          <h1 className='text-4xl font-bold text-gray-900 mb-4'>
            @ogcio/consent Demo Application
          </h1>
          <p className='text-xl text-gray-600 mb-8'>
            A comprehensive example showcasing consent management functionality
          </p>

          {/* Current Consent Status */}
          <div className='demo-card inline-block'>
            <h3 className='text-lg font-semibold mb-2'>
              Current Consent Status
            </h3>
            {consentInfo ? (
              <div className='space-y-2'>
                <div>
                  <span className='text-gray-600'>Status: </span>
                  <span className={getStatusBadgeClass(consentInfo.status)}>
                    {consentInfo.status}
                  </span>
                </div>
                {consentInfo.version && (
                  <div>
                    <span className='text-gray-600'>Version: </span>
                    <span className='font-mono text-sm bg-gray-100 px-2 py-1 rounded'>
                      {consentInfo.version}
                    </span>
                  </div>
                )}
              </div>
            ) : (
              <div className='animate-pulse'>Loading...</div>
            )}
          </div>
        </div>

        {/* Features Overview */}
        <div className='gi-grid gi-md:gi-grid-cols-2 gi-lg:gi-grid-cols-3 gi-gap-6 gi-mb-12'>
          <div className='demo-card'>
            <h3 className='text-lg font-semibold mb-3'>🎯 Smart Modal Logic</h3>
            <p className='text-gray-600 mb-4'>
              The consent modal appears automatically based on user status,
              consent version, and custom rules.
            </p>
            <Link
              href='/?show-consent=true'
              className='demo-button demo-button-primary'
            >
              Force Show Modal
            </Link>
          </div>

          <div className='demo-card'>
            <h3 className='text-lg font-semibold mb-3'>
              📊 Analytics Integration
            </h3>
            <p className='text-gray-600 mb-4'>
              Track user consent decisions and modal interactions with built-in
              analytics support.
            </p>
            <Link href='/analytics' className='demo-button demo-button-primary'>
              View Analytics
            </Link>
          </div>

          <div className='demo-card'>
            <h3 className='text-lg font-semibold mb-3'>
              🔧 Multiple Scenarios
            </h3>
            <p className='text-gray-600 mb-4'>
              Explore different consent scenarios and configurations in action.
            </p>
            <Link href='/scenarios' className='demo-button demo-button-primary'>
              View Scenarios
            </Link>
          </div>

          <div className='demo-card'>
            <h3 className='text-lg font-semibold mb-3'>⚙️ API Integration</h3>
            <p className='text-gray-600 mb-4'>
              See how to integrate with your backend API for consent storage and
              retrieval.
            </p>
            <Link
              href='/api-example'
              className='demo-button demo-button-primary'
            >
              API Examples
            </Link>
          </div>

          <div className='demo-card'>
            <h3 className='text-lg font-semibold mb-3'>🌍 Multi-language</h3>
            <p className='text-gray-600 mb-4'>
              Built-in support for internationalization with English and Irish
              languages.
            </p>
            <Link href='/i18n' className='demo-button demo-button-primary'>
              Language Demo
            </Link>
          </div>

          <div className='demo-card'>
            <h3 className='text-lg font-semibold mb-3'>♿ Accessibility</h3>
            <p className='text-gray-600 mb-4'>
              WCAG compliant modal with keyboard navigation and screen reader
              support.
            </p>
            <Link
              href='/accessibility'
              className='demo-button demo-button-primary'
            >
              A11y Features
            </Link>
          </div>
        </div>

        {/* Current Status Information */}
        {isOptedOut && (
          <div className='demo-card bg-yellow-50 border-yellow-200'>
            <h3 className='text-lg font-semibold text-yellow-800 mb-2'>
              ⚠️ Limited Functionality
            </h3>
            <p className='text-yellow-700'>
              You have declined consent, so some features in this demo may be
              disabled or limited. You can change your consent preferences at
              any time.
            </p>
          </div>
        )}

        {/* Quick Actions */}
        <div className='demo-card mt-8'>
          <h3 className='text-lg font-semibold mb-4'>Quick Actions</h3>
          <div className='flex flex-wrap gap-3'>
            <Link
              href='/?force-consent=true'
              className='demo-button demo-button-primary'
            >
              Show Consent Modal
            </Link>
            <Link
              href='/scenarios/force-pending'
              className='demo-button demo-button-warning'
            >
              Reset to Pending
            </Link>
            <Link
              href='/scenarios/public-servant'
              className='demo-button demo-button-secondary'
            >
              Public Servant View
            </Link>
            <Link
              href='https://github.com/ogcio/consent'
              target='_blank'
              rel='noopener noreferrer'
              className='demo-button demo-button-success'
            >
              View Source Code
            </Link>
          </div>
        </div>

        {/* Package Information */}
        <div className='demo-card mt-8 bg-blue-50 border-blue-200'>
          <h3 className='text-lg font-semibold text-blue-800 mb-3'>
            📦 About @ogcio/consent
          </h3>
          <p className='text-blue-700 mb-4'>
            A reusable consent management package for Next.js applications with
            modern, accessible design and comprehensive TypeScript support.
          </p>
          <div className='grid sm:grid-cols-2 gap-4 text-sm'>
            <div>
              <strong>Current Version:</strong> {config.content.version.id}
            </div>
            <div>
              <strong>Subject:</strong> {config.subject}
            </div>
            <div>
              <strong>Features:</strong> Analytics, I18n, A11y
            </div>
            <div>
              <strong>License:</strong> MIT
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
