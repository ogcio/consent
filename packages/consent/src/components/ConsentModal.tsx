"use client"

import {
  Alert,
  Button,
  Link,
  ModalBody,
  ModalTitle,
  ModalWrapper,
  Paragraph,
  Spinner,
  Stack,
  toaster,
} from "@ogcio/design-system-react"
import { useEffect, useId, useRef, useState } from "react"
import Markdown from "react-markdown"
import rehypeRaw from "rehype-raw"
import rehypeSanitize from "rehype-sanitize"
import remarkGfm from "remark-gfm"
import type { ConsentAction, ConsentStatementLanguages } from "@/types"
import { CONSENT_ACTIONS } from "@/types"
import { useConsent } from "./ConsentProvider"
import { LanguageSwitcher } from "./LanguageSwitcher"

export const ConsentModal = () => {
  const {
    isConsentModalOpen,
    setIsConsentModalOpen,
    config,
    userContext,
    events,
  } = useConsent()

  const [isLoading, setIsLoading] = useState({
    accept: false,
    decline: false,
  })
  const isGlobalLoading = isLoading.accept || isLoading.decline
  const [error, setError] = useState<string | null>(null)
  const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false)
  const [hasSetBottomRef, setHasBottomRef] = useState(false)
  const bottomRef = useRef<HTMLDivElement | null>(null)
  const titleId = useId()

  const { content, analyticsTracker, api } = config
  const preferredLanguage = config.userContext.getPreferredLanguage(userContext)

  // Extract current language from URL path
  const getCurrentLanguageFromUrl = (): ConsentStatementLanguages => {
    const currentPath = window.location.pathname
    const urlPattern = /\/(en|ga)\//
    const match = currentPath.match(urlPattern)
    return (match?.[1] as ConsentStatementLanguages) || "en"
  }

  const currentLanguage = getCurrentLanguageFromUrl()

  // Language switcher translations with fallback defaults
  const languageTranslations = config.languageSwitcher?.translations || {
    english: "English",
    irish: "Gaeilge",
  }

  // Set up intersection observer to track when user scrolls to bottom
  useEffect(() => {
    if (!hasSetBottomRef) {
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries
        if (entry.isIntersecting) {
          setHasScrolledToBottom(true)
          events?.onScrollToBottom?.()
        }
      },
      {
        threshold: 0.1, // Trigger when 10% of the element is visible
      },
    )
    if (bottomRef.current) {
      observer.observe(bottomRef.current)
    }

    return () => {
      if (bottomRef.current) {
        observer.unobserve(bottomRef.current)
      }
    }
  }, [events, hasSetBottomRef])

  // Scroll modal content to top on open to encourage users to review consent before acting.
  useEffect(() => {
    if (isConsentModalOpen) {
      const body = document.querySelector("#content-stack")?.parentElement
      if (body) {
        body.scrollTop = 0
      }
    }
  }, [isConsentModalOpen])

  if (!content) {
    return null
  }

  const doHandleConsent = async (accept: boolean) => {
    setError(null)
    setIsLoading({
      accept,
      decline: !accept,
    })

    const action: ConsentAction = accept
      ? CONSENT_ACTIONS.ACCEPT
      : CONSENT_ACTIONS.DECLINE

    // Track analytics if configured
    analyticsTracker?.trackConsentDecision(action)

    try {
      // The API function expects (version, consentStatementId) and returns an API instance
      const apiInstance = api(content.version, content.id)
      const result = await apiInstance.submitConsent({
        accept,
        subject: config.subject,
        preferredLanguage,
        versionId: content.version,
      })

      setIsLoading({
        accept: false,
        decline: false,
      })

      if (result?.error) {
        // Note: a toaster won't be visible behind the modal overlay
        setError(result.error.detail)

        analyticsTracker?.trackConsentError(action)
        events?.onConsentError?.(new Error(result.error.detail))
        return
      }

      analyticsTracker?.trackConsentSuccess(action)

      setIsConsentModalOpen(false)

      // Call custom event handler if provided
      events?.onConsentDecision?.(accept)

      // Show success toast if configured
      if (config.onConsentSuccess?.showToast !== false) {
        toaster.create({
          position: {
            x: "right",
            y: "top",
          },
          title: content.success.title,
          description: content.success.message,
          dismissible: true,
          variant: "success",
        })
      }
    } catch (error) {
      setIsLoading({
        accept: false,
        decline: false,
      })

      const errorMessage =
        error instanceof Error ? error.message : "An error occurred"
      setError(errorMessage)
      events?.onConsentError?.(
        error instanceof Error ? error : new Error(errorMessage),
      )
    }
  }

  const setBottomRef = (el: HTMLDivElement | null) => {
    bottomRef.current = el
    setHasBottomRef(true)
  }

  return (
    <ModalWrapper
      size='md'
      isOpen={isConsentModalOpen}
      closeOnClick={false}
      closeOnOverlayClick={false}
      aria-describedby={titleId}
      onClose={() => {
        setIsConsentModalOpen(false)
        events?.onModalClose?.()
      }}
    >
      <ModalTitle id={titleId}>{content.title}</ModalTitle>
      <ModalBody>
        {/* Note: if we put this in the stack it will loose full-width */}
        {error && (
          <div className='gi-mb-4'>
            <Alert variant='danger' title={content.error.title}>
              <Paragraph>{content.error.message}</Paragraph>
            </Alert>
          </div>
        )}
        <Stack direction='column' gap={4} id={`content-stack`}>
          {content.description && (
            <Paragraph>
              <Markdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeRaw, rehypeSanitize]}
              >
                {content.description}
              </Markdown>
            </Paragraph>
          )}

          {content.disclaimer && (
            <Alert title={content.disclaimer} variant='info' />
          )}

          {content.links && (
            <Stack direction='row' gap={4}>
              <Link
                key={`link-${content.links.privacyPolicy}`}
                href={content.links.privacyPolicy.url}
                target='_blank'
                rel='noopener noreferrer'
              >
                {content.links.privacyPolicy.text}
              </Link>
              <Link
                key={`link-${content.links.termsAndConditions}`}
                href={content.links.termsAndConditions.url}
                target='_blank'
                rel='noopener noreferrer'
              >
                {content.links.termsAndConditions.text}
              </Link>
            </Stack>
          )}
          {/* Invisible element to detect scroll to bottom */}
          <div ref={setBottomRef} style={{ height: "1px" }} />
        </Stack>
      </ModalBody>
      <div className='gi-modal-footer'>
        <Stack
          direction='row'
          gap={4}
          itemsDistribution='between'
          itemsAlignment='center'
        >
          <LanguageSwitcher
            currentLanguage={currentLanguage}
            translations={languageTranslations}
            forceModalParam={config.forceModalParam}
          />

          {/* Buttons on the right */}
          <Stack direction='row' gap={4} itemsDistribution='end'>
            <Button
              key='decline-button'
              variant='secondary'
              disabled={isGlobalLoading || !hasScrolledToBottom}
              onClick={() => doHandleConsent(false)}
              data-testid='consent-decline-button'
            >
              {content.buttons.decline}
              {isLoading.decline && <Spinner key='decline-spinner' />}
            </Button>
            <Button
              key='accept-button'
              variant='primary'
              disabled={isGlobalLoading || !hasScrolledToBottom}
              onClick={() => doHandleConsent(true)}
              data-testid='consent-accept-button'
            >
              {content.buttons.accept}
              {isLoading.accept && <Spinner key='accept-spinner' />}
            </Button>
          </Stack>
        </Stack>
      </div>
    </ModalWrapper>
  )
}
