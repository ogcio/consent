import { fireEvent, render, screen } from "@testing-library/react"
import { beforeEach, describe, expect, it } from "vitest"
import { LanguageSwitcher } from "../components/LanguageSwitcher"

// Mock window.location
const mockLocation = {
  href: "https://example.com/en/consent",
}

Object.defineProperty(window, "location", {
  value: mockLocation,
  writable: true,
})

describe("LanguageSwitcher", () => {
  const translations = {
    english: "English",
    irish: "Gaeilge",
  }

  beforeEach(() => {
    mockLocation.href = "https://example.com/en/consent"
  })

  it("renders the correct link text for English to Irish switch", () => {
    render(
      <LanguageSwitcher currentLanguage='en' translations={translations} />,
    )

    expect(screen.getByText("Gaeilge")).toBeInTheDocument()
  })

  it("renders the correct link text for Irish to English switch", () => {
    render(
      <LanguageSwitcher currentLanguage='ga' translations={translations} />,
    )

    expect(screen.getByText("English")).toBeInTheDocument()
  })

  it("replaces existing language prefix in URL", () => {
    render(
      <LanguageSwitcher currentLanguage='en' translations={translations} />,
    )

    const link = screen.getByText("Gaeilge")
    fireEvent.click(link)

    expect(mockLocation.href).toBe("https://example.com/ga/consent")
  })

  it("adds language prefix to URL without existing language", () => {
    mockLocation.href = "https://example.com/consent"

    render(
      <LanguageSwitcher currentLanguage='en' translations={translations} />,
    )

    const link = screen.getByText("Gaeilge")
    fireEvent.click(link)

    expect(mockLocation.href).toBe("https://example.com/ga/consent")
  })

  it("has correct test id for language switch", () => {
    render(
      <LanguageSwitcher currentLanguage='en' translations={translations} />,
    )

    const link = screen.getByTestId("language-switch-ga")
    expect(link).toBeInTheDocument()
  })

  it("appends force consent query parameter when provided", () => {
    mockLocation.href = "https://example.com/en/consent"

    render(
      <LanguageSwitcher
        currentLanguage='en'
        translations={translations}
        forceModalParam='force-consent'
      />,
    )

    const link = screen.getByText("Gaeilge")
    fireEvent.click(link)

    expect(mockLocation.href).toBe(
      "https://example.com/ga/consent?force-consent=1",
    )
  })
})
