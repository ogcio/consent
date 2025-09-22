import {
  type ConsentStatementContent,
  type ConsentStatus,
  createAnalyticsTracker,
  createDefaultConsentConfig,
} from "@ogcio/consent"

// Sample consent content for the demo application
export const demoConsentContent: ConsentStatementContent = {
  id: "550e8400-e29b-41d4-a716-446655440001", // UUID format as per API contract
  version: 1,
  publishDate: new Date("2024-01-15T10:00:00Z").toISOString(),
  isEnabled: true,
  title: "Welcome to Our Demo Application",
  description: `This demo application showcases the @ogcio/consent package functionality.

Before you start using our application, we need your consent for the following:

- To provide you with a personalized experience
- To analyze how you use our application to improve our services  
- To send you notifications about important updates
- To ensure the security and proper functioning of our application

You can withdraw your consent at any time through your account settings. Without your consent, some features may not be available.`,
  disclaimer:
    "By accepting, you agree to our Terms and Conditions and Privacy Policy.",
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
    privacyPolicy: {
      url: "/privacy-policy",
      text: "Privacy Policy",
    },
    termsAndConditions: {
      url: "/terms-and-conditions",
      text: "Terms and Conditions",
    },
  },
}

// Analytics consent content
export const analyticsConsentContent: ConsentStatementContent = {
  id: "550e8400-e29b-41d4-a716-446655440002",
  version: 1,
  publishDate: new Date("2024-01-10T10:00:00Z").toISOString(),
  isEnabled: true,
  title: "Analytics & Performance",
  description: `Help us improve our application by allowing us to collect anonymous usage data.

• Track page views and user interactions
• Monitor application performance
• Identify and fix issues
• Understand which features are most useful`,
  disclaimer:
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
    privacyPolicy: {
      url: "/privacy-policy",
      text: "Privacy Policy",
    },
    termsAndConditions: {
      url: "/terms-and-conditions",
      text: "Terms and Conditions",
    },
  },
}

// Create consent configuration for the demo app
export function createDemoConsentConfig(isEnabled: boolean = true) {
  const config = createDefaultConsentConfig({
    subject: "demo-app",
    content: demoConsentContent,
    isConsentEnabled: isEnabled,
    // Use default forceModalParam: "force-consent"
    showToastOnSuccess: true,
  })

  // Override API implementation with our demo endpoints
  config.api = (latestConsentVersion, consentStatementId) => ({
    consentStatementId,
    version: latestConsentVersion,
    submitConsent: async ({
      accept,
      subject,
      preferredLanguage,
      consentStatementId: requestConsentStatementId,
    }) => {
      // Use the consentStatementId from the API config, not the request parameter
      const finalConsentStatementId =
        consentStatementId || requestConsentStatementId
      console.log("Demo API submitConsent called with:", {
        accept,
        subject,
        preferredLanguage,
        consentStatementId: finalConsentStatementId,
        apiConfigStatementId: consentStatementId,
        requestStatementId: requestConsentStatementId,
      })

      const response = await fetch("/api/consent/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          accept,
          subject,
          preferredLanguage,
          consentStatementId: finalConsentStatementId,
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

  config.api = (latestConsentVersion, consentStatementId) => {
    console.log("Analytics API config called with:", {
      latestConsentVersion,
      consentStatementId,
    })
    return {
      consentStatementId,
      version: latestConsentVersion,
      submitConsent: async ({
        accept,
        subject,
        preferredLanguage,
        consentStatementId: requestConsentStatementId,
      }) => {
        // Use the consentStatementId from the API config, not the request parameter
        const finalConsentStatementId =
          consentStatementId || requestConsentStatementId
        console.log("Analytics API submitConsent called with:", {
          accept,
          subject,
          preferredLanguage,
          consentStatementId: finalConsentStatementId,
          apiConfigStatementId: consentStatementId,
          requestStatementId: requestConsentStatementId,
        })
        const response = await fetch("/api/consent/submit", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            accept,
            subject,
            preferredLanguage,
            consentStatementId: finalConsentStatementId,
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
    }
  }

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
  userConsentVersion?: number
  userConsentStatementId?: string
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
      userConsentStatementId: data.userConsentStatementId,
    }
  } catch (error) {
    console.warn("Error fetching consent status:", error)
    return { consentStatus: "undefined" }
  }
}
