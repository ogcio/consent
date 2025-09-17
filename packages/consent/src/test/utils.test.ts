import { describe, expect, it, vi } from "vitest"
import {
  type ConsentStatementContent,
  type ConsentStatementData,
  type ConsentStatementLanguages,
  ConsentStatuses,
} from "@/types"

// Type for testing with invalid locales
type TestLocale = ConsentStatementLanguages | "fr" | "es" | "de"

// Test-specific function signatures that accept invalid locales for error testing
type TestTransformBackendResponse = (
  data: ConsentStatementData,
  locale: TestLocale,
) => Promise<ConsentStatementContent>

import {
  createAnalyticsTracker,
  createConsentAnalyticsEvent,
  createNoOpAnalyticsTracker,
} from "@/utils/analytics"
import { createDefaultConsentConfig } from "@/utils/config"
import { transformBackendResponse } from "@/utils/transformers"

// Mock default consent content for testing
const DEFAULT_CONSENT_CONTENT: ConsentStatementContent = {
  id: "test-id",
  version: 1,
  publishDate: "2023-01-01T00:00:00Z",
  isEnabled: true,
  title: "Test Consent",
  description: "Test description",
  disclaimer: "Test disclaimer",
  buttons: {
    accept: "Accept",
    decline: "Decline",
  },
  success: {
    title: "Success",
    message: "Success message",
  },
  error: {
    title: "Error",
    message: "Error message",
  },
}

describe("Config Utils", () => {
  describe("createDefaultConsentConfig", () => {
    it("creates a config with default values", () => {
      const config = createDefaultConsentConfig({
        subject: "test-subject",
        content: DEFAULT_CONSENT_CONTENT,
      })

      expect(config.subject).toBe("test-subject")
      expect(config.content).toBe(DEFAULT_CONSENT_CONTENT)
      expect(config.featureFlags?.isEnabled()).toBe(true)
      expect(config.onConsentSuccess?.showToast).toBe(true)
      expect(config.forceModalParam).toBe("force-consent")
    })

    it("creates a config with custom values", () => {
      const config = createDefaultConsentConfig({
        subject: "custom-subject",
        content: DEFAULT_CONSENT_CONTENT,
        isConsentEnabled: false,
        forceModalParam: "custom-param",
        showToastOnSuccess: false,
      })

      expect(config.subject).toBe("custom-subject")
      expect(config.featureFlags?.isEnabled()).toBe(false)
      expect(config.onConsentSuccess?.showToast).toBe(false)
      expect(config.forceModalParam).toBe("custom-param")
    })

    it("creates a config with custom links", () => {
      const customLinks = {
        termsAndConditions: {
          url: "https://example.com/terms",
          text: "Terms and Conditions",
        },
        privacyPolicy: {
          url: "https://example.com/privacy",
          text: "Privacy Policy",
        },
      }

      const config = createDefaultConsentConfig({
        subject: "test-subject",
        content: DEFAULT_CONSENT_CONTENT,
        links: customLinks,
      })

      expect(config.content?.links).toEqual(customLinks)
    })

    it("shouldShowModal returns false for public servants", () => {
      const config = createDefaultConsentConfig({
        subject: "test-subject",
        content: DEFAULT_CONSENT_CONTENT,
      })

      const result = config.shouldShowModal({
        userContext: { isPublicServant: true, preferredLanguage: "en" },
        consentStatus: ConsentStatuses.Undefined,
        searchParams: new URLSearchParams(),
        latestConsentVersion: 1,
        latestConsentStatementId: "test-id",
      })

      expect(result).toBe(false)
    })

    it("shouldShowModal returns true for users without valid consent", () => {
      const config = createDefaultConsentConfig({
        subject: "test-subject",
        content: DEFAULT_CONSENT_CONTENT,
      })

      const result = config.shouldShowModal({
        userContext: { isPublicServant: false, preferredLanguage: "en" },
        consentStatus: ConsentStatuses.Undefined,
        searchParams: new URLSearchParams(),
        latestConsentVersion: 1,
        latestConsentStatementId: "test-id",
      })

      expect(result).toBe(true)
    })
  })
})

describe("Transformers", () => {
  describe("transformBackendResponse", () => {
    it("transforms backend response to frontend content", async () => {
      const backendData = {
        id: "test-id",
        subject: "test-subject",
        version: 1,
        createdAt: "2023-01-01T00:00:00Z",
        publishDate: "2023-01-01T00:00:00Z",
        isEnabled: true,
        createdBy: "test-user",
        translations: {
          en: {
            id: "translation-id",
            consentStatementId: "test-id",
            language: "en" as const,
            title: "Test Title",
            description: "Test description content",
            disclaimer: "Test disclaimer with <tc>Terms</tc>",
            createdAt: "2023-01-01T00:00:00Z",
          },
          ga: {
            id: "ga-translation-id",
            consentStatementId: "test-id",
            language: "ga" as const,
            title: "Test Title GA",
            description: "Test description content GA",
            disclaimer: "Test disclaimer GA with <tc>Terms</tc>",
            createdAt: "2023-01-01T00:00:00Z",
          },
        },
      }

      const result = await transformBackendResponse(backendData, "en")

      expect(result.id).toBe("test-id")
      expect(result.version).toBe(1)
      expect(result.title).toBe("Test Title")
      expect(result.description).toBe("Test description content")
      expect(result.disclaimer).toBe("Test disclaimer with <tc>Terms</tc>")
      expect(result.links).toBeUndefined()
    })

    it("throws error for missing translation", async () => {
      const backendData = {
        id: "test-id",
        subject: "test-subject",
        version: 1,
        createdAt: "2023-01-01T00:00:00Z",
        publishDate: "2023-01-01T00:00:00Z",
        isEnabled: true,
        createdBy: "test-user",
        translations: {
          en: {
            id: "en-translation",
            consentStatementId: "test-id",
            language: "en" as const,
            title: "Test Title",
            description: "Test description",
            disclaimer: "Test disclaimer",
            createdAt: "2023-01-01T00:00:00Z",
          },
          ga: {
            id: "ga-translation",
            consentStatementId: "test-id",
            language: "ga" as const,
            title: "Test Title GA",
            description: "Test description GA",
            disclaimer: "Test disclaimer GA",
            createdAt: "2023-01-01T00:00:00Z",
          },
        },
      }

      await expect(
        (transformBackendResponse as TestTransformBackendResponse)(
          backendData,
          "fr",
        ),
      ).rejects.toThrow("Translation not found for locale: fr")
    })
  })
})

describe("Analytics Utils", () => {
  describe("createConsentAnalyticsEvent", () => {
    it("creates analytics event with correct structure", () => {
      const event = createConsentAnalyticsEvent({
        name: "test-event",
        action: "test-action",
      })

      expect(event.event.category).toBe("consent")
      expect(event.event.name).toBe("test-event")
      expect(event.event.action).toBe("test-action")
      expect(event.event.value).toBe(1)
    })
  })

  describe("createAnalyticsTracker", () => {
    it("creates analytics tracker with tracking functions", () => {
      const mockTrackEvent = vi.fn()
      const tracker = createAnalyticsTracker(mockTrackEvent)

      tracker.trackConsentDecision("accept")
      tracker.trackConsentError("decline")
      tracker.trackConsentSuccess("accept")

      expect(mockTrackEvent).toHaveBeenCalledTimes(3)
    })
  })

  describe("createNoOpAnalyticsTracker", () => {
    it("creates no-op analytics tracker", () => {
      const tracker = createNoOpAnalyticsTracker()

      // These should not throw errors
      expect(() => tracker.trackConsentDecision("accept")).not.toThrow()
      expect(() => tracker.trackConsentError("decline")).not.toThrow()
      expect(() => tracker.trackConsentSuccess("accept")).not.toThrow()
    })
  })
})
