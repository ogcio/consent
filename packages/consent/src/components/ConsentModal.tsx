"use client"

import {
  Alert,
  Button,
  Link,
  List,
  ModalBody,
  ModalFooter,
  ModalTitle,
  ModalWrapper,
  Paragraph,
  Spinner,
  Stack,
  toaster,
} from "@ogcio/design-system-react"
import { useEffect, useId, useRef, useState } from "react"
import type { ConsentAction } from "@/types"
import { CONSENT_ACTIONS } from "@/types"
import { useConsent } from "./ConsentProvider"

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

  const { content, analyticsTracker, api } = config
  const preferredLanguage = config.userContext.getPreferredLanguage(userContext)

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
      const apiInstance = api(config.content.version.id)
      const result = await apiInstance.submitConsent({
        accept,
        subject: config.subject,
        preferredLanguage,
        versionId: config.content.version.id,
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

  const renderTextWithLinks = (text: string) => {
    // Replace <tc>...</tc> and <pp>...</pp> with actual links
    let processedText = text

    // Replace link placeholders with actual links
    Object.entries(content.links).forEach(([key, url]) => {
      // Use regex to match the tag and extract the actual content between tags
      const tagRegex = new RegExp(`<${key}>(.*?)</${key}>`, "g")

      processedText = processedText.replace(tagRegex, (_match, linkText) => {
        return `<a href="${url}" target="_blank" rel="noopener noreferrer">${linkText}</a>`
      })
    })

    // Split by HTML tags and render
    const parts = processedText.split(/(<a[^>]*>.*?<\/a>)/g)
    return parts.map((part, partIndex) => {
      const linkMatch = part.match(/<a href="([^"]*)"[^>]*>(.*?)<\/a>/)

      if (linkMatch) {
        return (
          <Link
            key={`link-${partIndex}-${linkMatch[1]}`}
            href={linkMatch[1]}
            target='_blank'
            rel='noopener noreferrer'
          >
            {linkMatch[2]}
          </Link>
        )
      }
      return <span key={`text-${partIndex}-${part}`}>{part}</span>
    })
  }

  const setBottomRef = (el: HTMLDivElement | null) => {
    bottomRef.current = el
    setHasBottomRef(true)
  }

  // Force the modal content to scroll to top on open so that the actively have to read through any consent before taking action
  useEffect(() => {
    if (isConsentModalOpen) {
      const body = document.querySelector("#content-stack")?.parentElement
      if (body) {
        body.scrollTop = 0
      }
    }
  }, [isConsentModalOpen])

  const titleId = useId()
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
          {content.bodyParagraphs.map(
            (paragraph: string, paragraphIndex: number) => (
              <Paragraph
                key={`paragraph-${paragraphIndex}-${paragraph.substring(0, 20)}`}
              >
                {paragraph}
              </Paragraph>
            ),
          )}
          {content.listItems.length > 0 && (
            <List
              type='bullet'
              items={content.listItems}
              data-testid='consent-list'
            />
          )}

          {content.bodyBottom && content.bodyBottom.length > 0 && (
            <Paragraph>{content.bodyBottom.join(" ")}</Paragraph>
          )}

          {content.infoAlert && (
            <Alert variant='info' title={content.infoAlert.title}>
              <List
                className='gi-text-sm'
                items={content.infoAlert.items}
                data-testid='info-alert-list'
              />
            </Alert>
          )}
          <Paragraph style={{ maxWidth: "unset" }} size='sm'>
            {renderTextWithLinks(content.footerText)}
          </Paragraph>
          {/* Invisible element to detect scroll to bottom */}
          <div ref={setBottomRef} style={{ height: "1px" }} />
        </Stack>
      </ModalBody>
      <ModalFooter>
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
      </ModalFooter>
    </ModalWrapper>
  )
}
