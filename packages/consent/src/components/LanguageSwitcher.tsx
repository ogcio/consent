"use client"

import { Link } from "@ogcio/design-system-react"
import type { ConsentStatementLanguages } from "@/types"

interface LanguageSwitcherProps {
  currentLanguage: ConsentStatementLanguages
  translations: {
    english: string
    irish: string
  }
  forceModalParam?: string
}

export const LanguageSwitcher = ({
  currentLanguage,
  translations,
  forceModalParam,
}: LanguageSwitcherProps) => {
  const isEnglish = currentLanguage === "en"
  const targetLanguage: ConsentStatementLanguages = isEnglish ? "ga" : "en"
  const linkText = isEnglish ? translations.irish : translations.english

  const switchLanguage = () => {
    const currentUrl = window.location.href
    let newUrl: string

    // Check if URL already has a language prefix
    const urlPattern = /\/(en|ga)\//
    const hasLanguagePrefix = urlPattern.test(currentUrl)

    if (hasLanguagePrefix) {
      // Replace existing language prefix
      newUrl = currentUrl.replace(urlPattern, `/${targetLanguage}/`)
    } else {
      // Add language prefix to URL
      const url = new URL(currentUrl)
      const pathSegments = url.pathname
        .split("/")
        .filter((segment) => segment !== "")

      // Insert language as the first segment
      pathSegments.unshift(targetLanguage)
      url.pathname = `/${pathSegments.join("/")}`

      newUrl = url.toString()
    }

    // Add force consent query parameter if provided
    if (forceModalParam) {
      const url = new URL(newUrl)
      url.searchParams.set(forceModalParam, "1")
      newUrl = url.toString()
    }

    window.location.href = newUrl
  }

  return (
    <Link
      href='#'
      onClick={(e) => {
        e.preventDefault()
        switchLanguage()
      }}
    >
      <span data-testid={`language-switch-${targetLanguage}`}>{linkText}</span>
    </Link>
  )
}
