import { render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { ConsentProvider, useConsent } from "@/components/ConsentProvider"
import { ConsentStatuses, type ConsentUserContext } from "@/types"

// Mock the ConsentModal component
vi.mock("@/components/ConsentModal", () => ({
  ConsentModal: () => <div data-testid='consent-modal'>Consent Modal</div>,
}))

const mockConfig = {
  subject: "test-subject",
  content: undefined,
  userContext: {
    getPreferredLanguage: (user: ConsentUserContext) => user.preferredLanguage,
  },
  shouldShowModal: vi.fn(() => false),
  api: vi.fn(() => ({
    consentStatementId: "test-id",
    version: 1,
    submitConsent: vi.fn(),
    setConsentToPending: vi.fn(),
  })),
  featureFlags: {
    isEnabled: () => true,
  },
  onConsentSuccess: {
    showToast: true,
  },
  forceModalParam: "force-consent",
}

const mockUserContext = {
  isPublicServant: false,
  preferredLanguage: "en",
}

describe("ConsentProvider", () => {
  it("renders children when consent modal should not be shown", () => {
    render(
      <ConsentProvider
        config={mockConfig}
        userContext={mockUserContext}
        consentStatus={ConsentStatuses.OptedIn}
      >
        <div data-testid='child-content'>Child Content</div>
      </ConsentProvider>,
    )

    expect(screen.getByTestId("child-content")).toBeInTheDocument()
    expect(screen.getByTestId("consent-modal")).toBeInTheDocument()
  })

  it("renders children when consent modal should be shown", () => {
    const configWithModal = {
      ...mockConfig,
      shouldShowModal: vi.fn(() => true),
    }

    render(
      <ConsentProvider
        config={configWithModal}
        userContext={mockUserContext}
        consentStatus={ConsentStatuses.Undefined}
      >
        <div data-testid='child-content'>Child Content</div>
      </ConsentProvider>,
    )

    expect(screen.getByTestId("child-content")).toBeInTheDocument()
    expect(screen.getByTestId("consent-modal")).toBeInTheDocument()
  })

  it("provides correct context values", () => {
    const TestComponent = () => {
      const { isOptedOut, config, userContext } = useConsent()
      return (
        <div>
          <span data-testid='is-opted-out'>{isOptedOut.toString()}</span>
          <span data-testid='subject'>{config.subject}</span>
          <span data-testid='user-language'>
            {userContext.preferredLanguage}
          </span>
        </div>
      )
    }

    render(
      <ConsentProvider
        config={mockConfig}
        userContext={mockUserContext}
        consentStatus={ConsentStatuses.OptedOut}
      >
        <TestComponent />
      </ConsentProvider>,
    )

    expect(screen.getByTestId("is-opted-out")).toHaveTextContent("true")
    expect(screen.getByTestId("subject")).toHaveTextContent("test-subject")
    expect(screen.getByTestId("user-language")).toHaveTextContent("en")
  })
})
