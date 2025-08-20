import {
  createDefaultConsentConfig,
  createAnalyticsTracker,
  type ConsentStatementContent,
  type ConsentStatus,
} from "@ogcio/consent"

// Sample consent content for the demo application
export const demoConsentContent: ConsentStatementContent = {
  title: "Welcome to Our Demo Application",
  bodyParagraphs: [
    "This demo application showcases the @ogcio/consent package functionality.",
    "Before you start using our application, we need your consent for the following:",
  ],
  listItems: [
    "To provide you with a personalized experience",
    "To analyze how you use our application to improve our services",
    "To send you notifications about important updates",
    "To ensure the security and proper functioning of our application",
  ],
  bodyBottom: [
    "You can withdraw your consent at any time through your account settings.",
    "Without your consent, some features may not be available.",
  ],
  infoAlert: {
    title: "What this means for you:",
    items: [
      "Your data will be processed securely and in accordance with GDPR",
      "You maintain full control over your privacy settings",
      "We will never sell your data to third parties",
      "You can request deletion of your data at any time",
    ],
  },
  footerText:
    "By accepting, you agree to our <tc>Terms and Conditions</tc> and <pp>Privacy Policy</pp>.",
  buttons: {
    accept: "Accept All",
    decline: "Decline",
  },
  success: {
    title: "Consent Updated Successfully",
    message: "Your consent preferences have been saved. Thank you!",
  },
  error: {
    title: "Something went wrong",
    message:
      "We encountered an error while saving your consent preferences. Please try again.",
  },
  links: {
    tc: "/terms-and-conditions",
    pp: "/privacy-policy",
  },
  version: {
    id: "v1.2.0",
    createdAt: new Date("2024-01-15T10:00:00Z").toISOString(),
  },
}

// Analytics consent content
export const analyticsConsentContent: ConsentStatementContent = {
  title: "Analytics & Performance",
  bodyParagraphs: [
    "Help us improve our application by allowing us to collect anonymous usage data.",
  ],
  listItems: [
    "Track page views and user interactions",
    "Monitor application performance",
    "Identify and fix issues",
    "Understand which features are most useful",
  ],
  footerText:
    "This data is completely anonymous and helps us make the application better for everyone.",
  buttons: {
    accept: "Allow Analytics",
    decline: "No Thanks",
  },
  success: {
    title: "Analytics Preferences Updated",
    message: "Your analytics preferences have been saved.",
  },
  error: {
    title: "Error",
    message: "Unable to save your analytics preferences. Please try again.",
  },
  links: {
    tc: "/terms-and-conditions",
    pp: "/privacy-policy",
  },
  version: {
    id: "v1.0.0",
    createdAt: new Date("2024-01-10T10:00:00Z").toISOString(),
  },
}

// Create consent configuration for the demo app
export function createDemoConsentConfig(isEnabled: boolean = true) {
  const config = createDefaultConsentConfig({
    subject: "demo-app",
    content: demoConsentContent,
    isConsentEnabled: isEnabled,
    forceModalParam: "show-consent",
    showToastOnSuccess: true,
  })

  // Override API implementation with our demo endpoints
  config.api = (latestConsentVersion) => ({
    consentStatementId: latestConsentVersion,
    submitConsent: async ({
      accept,
      subject,
      preferredLanguage,
      versionId,
    }) => {
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
        return {
          error: { detail: error.message || "Failed to submit consent" },
        }
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
        return {
          error: {
            detail: error.message || "Failed to set consent to pending",
          },
        }
      }

      return {}
    },
  })

  // Add analytics tracking (for demonstration)
  config.analyticsTracker = createAnalyticsTracker((event) => {
    console.log("📊 Analytics Event:", {
      event: event.event.name,
      category: event.event.category,
      action: event.event.action,
      value: event.event.value,
      timestamp: new Date().toISOString(),
    })

    // In a real application, you would send this to your analytics service
    // Example: Google Analytics 4
    // gtag('event', event.event.name, {
    //   event_category: event.event.category,
    //   event_action: event.event.action,
    //   value: event.event.value,
    // })
  })

  return config
}

// Create analytics-specific consent configuration
export function createAnalyticsConsentConfig() {
  const config = createDefaultConsentConfig({
    subject: "analytics",
    content: analyticsConsentContent,
    isConsentEnabled: true,
    showToastOnSuccess: true,
  })

  config.api = (latestConsentVersion) => ({
    consentStatementId: latestConsentVersion,
    submitConsent: async ({
      accept,
      subject,
      preferredLanguage,
      versionId,
    }) => {
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
        return {
          error: { detail: error.message || "Failed to submit consent" },
        }
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
        return {
          error: {
            detail: error.message || "Failed to set consent to pending",
          },
        }
      }

      return {}
    },
  })

  return config
}

// Simulate user data (in a real app, this would come from authentication)
export const mockUser = {
  id: "user-123",
  isPublicServant: false,
  preferredLanguage: "en",
  isAuthenticated: true,
}

// Simulate fetching consent status (in a real app, this would be server-side)
export async function fetchConsentStatus(subject: string): Promise<{
  consentStatus: ConsentStatus
  userConsentVersion?: string
}> {
  try {
    const response = await fetch(
      `/api/consent/status?subject=${subject}&userId=${mockUser.id}`,
    )

    if (!response.ok) {
      console.warn("Failed to fetch consent status, using default")
      return { consentStatus: "undefined" }
    }

    const data = await response.json()
    return {
      consentStatus: data.consentStatus as ConsentStatus,
      userConsentVersion: data.userConsentVersion,
    }
  } catch (error) {
    console.warn("Error fetching consent status:", error)
    return { consentStatus: "undefined" }
  }
}
