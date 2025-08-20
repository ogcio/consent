// Example: How to integrate the consent package with the messaging application

import {
  ConsentProvider,
  type ConsentStatementContent,
  type ConsentStatus,
  createAnalyticsTracker,
  createDefaultConsentConfig,
} from "../src"
import { useAnalytics } from "@ogcio/nextjs-analytics"
import type { ReactNode } from "react"
// biome-ignore lint/correctness/noUnusedImports: Expected as this file is an example
import React from "react"

// Example integration with the messaging app
export function MessagingConsentIntegration({
  children,
  user,
  profile,
  consentStatus,
  userConsentVersion,
  consentContent,
  isConsentEnabled,
}: {
  children: ReactNode
  user: { id: string; isPublicServant: boolean }
  profile: { preferredLanguage: string }
  consentStatus: ConsentStatus
  userConsentVersion?: string
  consentContent: ConsentStatementContent
  isConsentEnabled: boolean
}) {
  const analytics = useAnalytics()

  // Create messaging-specific consent configuration
  const consentConfig = createDefaultConsentConfig({
    subject: "messaging",
    content: consentContent,
    isConsentEnabled,
    forceModalParam: "force-consent",
    showToastOnSuccess: true,
  })

  // Override API implementation with messaging-specific logic
  consentConfig.api = (latestConsentVersion) => ({
    consentStatementId: latestConsentVersion,
    submitConsent: async ({
      accept,
      subject,
      preferredLanguage,
      versionId,
    }) => {
      // Call the messaging app's server action
      const response = await fetch("/api/consent/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          accept,
          subject,
          preferredLanguage,
          versionId,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        return { error: { detail: error.message } }
      }

      return {}
    },
    setConsentToPending: async (subject) => {
      const response = await fetch("/api/consent/pending", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject }),
      })

      if (!response.ok) {
        const error = await response.json()
        return { error: { detail: error.message } }
      }

      return {}
    },
  })

  // Add analytics tracking
  consentConfig.analyticsTracker = createAnalyticsTracker((event) => {
    analytics.trackEvent(event)
  })

  // Add custom event handlers
  const events = {
    onConsentDecision: (accepted: boolean) => {
      console.log(`User ${accepted ? "accepted" : "declined"} consent`)
      // Additional messaging-specific logic here
    },
    onConsentError: (error: Error) => {
      console.error("Consent error:", error)
      // Handle consent errors in messaging app
    },
  }

  return (
    <ConsentProvider
      config={consentConfig}
      userContext={{
        isPublicServant: user.isPublicServant,
        preferredLanguage: profile.preferredLanguage,
      }}
      consentStatus={consentStatus}
      userConsentVersion={userConsentVersion}
      events={events}
    >
      {children}
    </ConsentProvider>
  )
}

// Example usage in a Next.js app
export function AppLayout({ children }: { children: ReactNode }) {
  // This would be your actual data fetching logic
  const user = { id: "123", isPublicServant: false }
  const profile = { preferredLanguage: "en" }
  const consentStatus = "undefined"
  const consentContent = {
    title: "Welcome to MessagingIE",
    bodyParagraphs: [
      "MessagingIE provides you with a safe and secure access to letters, documents, and messages from Public Sector Bodies (PSBs).",
      "Before you start using MessagingIE, we need your consent for the following:",
    ],
    listItems: [
      "To allow Public Sector Bodies to send messages to you where they are required or permitted to give information to you in writing",
      "To notify you of new messages sent to you through MessagingIE",
    ],
    footerText:
      "Please read our <tc>Terms and Conditions</tc> and <pp>Privacy Notice</pp>.",
    buttons: {
      accept: "Accept",
      decline: "Decline",
    },
    success: {
      title: "Consent Updated",
      message: "Your consent preferences have been updated successfully.",
    },
    error: {
      title: "Error",
      message:
        "An error occurred while updating your consent. Please try again.",
    },
    links: {
      tc: "https://www.gov.ie/en/privacy-and-data-protection/privacy-notices/privacy-notice-for-messagingie/",
      pp: "https://www.gov.ie/en/privacy-and-data-protection/privacy-notices/privacy-notice-for-messagingie/",
    },
    version: {
      id: "v1.0.0",
      createdAt: new Date().toISOString(),
    },
  }
  const isConsentEnabled = true

  return (
    <MessagingConsentIntegration
      user={user}
      profile={profile}
      consentStatus={consentStatus}
      consentContent={consentContent}
      isConsentEnabled={isConsentEnabled}
    >
      {children}
    </MessagingConsentIntegration>
  )
}
