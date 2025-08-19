import { describe, expect, it, vi } from "vitest"
import {
  type ConsentStatementContent,
  type ConsentStatementData,
  type ConsentStatementLanguages,
  ConsentStatuses,
  DEFAULT_CONSENT_CONTENT,
} from "@/types"

// Type for testing with invalid locales
type TestLocale = ConsentStatementLanguages | "fr" | "es" | "de"

// Test-specific function signatures that accept invalid locales for error testing
type TestTransformBackendResponse = (
  data: ConsentStatementData,
  locale: TestLocale,
) => Promise<ConsentStatementContent>

type TestCreateFallbackContent = (locale: TestLocale) => ConsentStatementContent

import {
  createAnalyticsTracker,
  createConsentAnalyticsEvent,
  createNoOpAnalyticsTracker,
} from "@/utils/analytics"
import {
  createDefaultConsentConfig,
  createMessagingConsentConfig,
} from "@/utils/config"
import {
  createFallbackContent,
  transformBackendResponse,
} from "@/utils/transformers"

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

    it("shouldShowModal returns false for public servants", () => {
      const config = createDefaultConsentConfig({
        subject: "test-subject",
        content: DEFAULT_CONSENT_CONTENT,
      })

      const result = config.shouldShowModal({
        userContext: { isPublicServant: true, preferredLanguage: "en" },
        consentStatus: ConsentStatuses.Undefined,
        searchParams: new URLSearchParams(),
        latestConsentVersion: "latest",
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
        latestConsentVersion: "latest",
      })

      expect(result).toBe(true)
    })
  })

  describe("createMessagingConsentConfig", () => {
    it("creates a messaging-specific config", () => {
      const config = createMessagingConsentConfig({
        subject: "messaging",
        content: DEFAULT_CONSENT_CONTENT,
      })

      expect(config.subject).toBe("messaging")
      expect(config.forceModalParam).toBe("force-consent")
      expect(config.onConsentSuccess?.showToast).toBe(true)
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
        translations: {
          en: {
            id: "translation-id",
            consentStatementId: "test-id",
            language: "en",
            title: "Test Title",
            bodyTop: ["Paragraph 1", "Paragraph 2"],
            bodyList: ["Item 1", "Item 2"],
            bodyBottom: ["Bottom text"],
            bodySmall: ["Small item 1", "Small item 2"],
            bodyFooter: "Footer text with <tc>Terms</tc>",
            bodyLinks: { tc: "https://terms.com", pp: "https://privacy.com" },
            createdAt: "2023-01-01T00:00:00Z",
          },
          ga: {
            id: "ga-translation-id",
            consentStatementId: "test-id",
            language: "ga",
            title: "Test Title GA",
            bodyTop: ["Paragraph 1 GA", "Paragraph 2 GA"],
            bodyList: ["Item 1 GA", "Item 2 GA"],
            bodyBottom: ["Bottom text GA"],
            bodySmall: ["Small item 1 GA", "Small item 2 GA"],
            bodyFooter: "Footer text GA with <tc>Terms</tc>",
            bodyLinks: { tc: "https://terms.com", pp: "https://privacy.com" },
            createdAt: "2023-01-01T00:00:00Z",
          },
        },
      }

      const result = await transformBackendResponse(backendData, "en")

      expect(result.version.id).toBe("test-id")
      expect(result.title).toBe("Test Title")
      expect(result.bodyParagraphs).toEqual(["Paragraph 1", "Paragraph 2"])
      expect(result.listItems).toEqual(["Item 1", "Item 2"])
      expect(result.links).toEqual({
        tc: "https://terms.com",
        pp: "https://privacy.com",
      })
    })

    it("throws error for missing translation", async () => {
      const backendData = {
        id: "test-id",
        subject: "test-subject",
        version: 1,
        createdAt: "2023-01-01T00:00:00Z",
        translations: {
          en: {
            id: "en-translation",
            consentStatementId: "test-id",
            language: "en",
            title: "Test Title",
            bodyTop: ["Paragraph 1"],
            bodyList: ["Item 1"],
            bodyBottom: ["Bottom text"],
            bodySmall: ["Small item 1"],
            bodyFooter: "Footer text",
            bodyLinks: { tc: "https://terms.com", pp: "https://privacy.com" },
            createdAt: "2023-01-01T00:00:00Z",
          },
          ga: {
            id: "ga-translation",
            consentStatementId: "test-id",
            language: "ga",
            title: "Test Title GA",
            bodyTop: ["Paragraph 1 GA"],
            bodyList: ["Item 1 GA"],
            bodyBottom: ["Bottom text GA"],
            bodySmall: ["Small item 1 GA"],
            bodyFooter: "Footer text GA",
            bodyLinks: { tc: "https://terms.com", pp: "https://privacy.com" },
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

  describe("createFallbackContent", () => {
    it("creates fallback content for English", () => {
      const content = createFallbackContent("en")

      expect(content.title).toBe("Welcome to Our Service")
      expect(content.bodyParagraphs).toHaveLength(2)
      expect(content.listItems).toHaveLength(2)
      expect(content.links).toEqual({ tc: "#", pp: "#" })
    })

    it("creates fallback content for Irish", () => {
      const content = createFallbackContent("ga")

      expect(content.title).toBe("Fáilte go dtí ár Seirbhís")
      expect(content.bodyParagraphs).toHaveLength(2)
      expect(content.listItems).toHaveLength(2)
    })

    it("falls back to English for unknown locale", () => {
      const content = (createFallbackContent as TestCreateFallbackContent)("fr")

      expect(content.title).toBe("Welcome to Our Service")
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
