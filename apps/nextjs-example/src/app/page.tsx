"use client"

import {
  Alert,
  Button,
  Card,
  CardAction,
  CardContainer,
  CardHeader,
  CardTitle,
  Heading,
  Link,
  Paragraph,
} from "@govie-ds/react"
import { ConsentStatuses, useConsent } from "@ogcio/consent"
import { useCallback, useEffect, useState } from "react"
import { fetchConsentStatus } from "@/lib/consent"

interface MockUser {
  id: string
  isPublicServant: boolean
  preferredLanguage: string
  isAuthenticated: boolean
}

declare global {
  interface Window {
    __mockUser?: MockUser
  }
}

export default function HomePage() {
  const { isOptedOut, setIsConsentModalOpen } = useConsent()
  const [consentInfo, setConsentInfo] = useState<{
    status: string
    version?: string
  } | null>(null)
  const [userInfo, setUserInfo] = useState<{
    isPublicServant: boolean
    preferredLanguage: string
  }>({ isPublicServant: false, preferredLanguage: "en" })
  const loadConsentInfo = useCallback(async () => {
    const { consentStatus, userConsentVersion } =
      await fetchConsentStatus("demo-app")
    setConsentInfo({
      status: consentStatus,
      version: userConsentVersion,
    })
  }, [])

  useEffect(() => {
    loadConsentInfo()
  }, [loadConsentInfo])

  // Listen for consent changes to refresh status
  useEffect(() => {
    const handleConsentChange = () => {
      loadConsentInfo()
      // Also sync user info from global state
      const globalUser = window.__mockUser
      if (globalUser) {
        setUserInfo({
          isPublicServant: globalUser.isPublicServant || false,
          preferredLanguage: globalUser.preferredLanguage || "en",
        })
      }
    }

    const handleUserContextChange = (event: CustomEvent) => {
      const { isPublicServant } = event.detail || {}
      if (typeof isPublicServant === "boolean") {
        setUserInfo((prev) => ({ ...prev, isPublicServant }))
      }
    }

    // Listen for custom events
    window.addEventListener("consentChanged", handleConsentChange)
    window.addEventListener(
      "userContextChanged",
      handleUserContextChange as EventListener,
    )

    // Initialize user info from global state
    handleConsentChange()

    return () => {
      window.removeEventListener("consentChanged", handleConsentChange)
      window.removeEventListener(
        "userContextChanged",
        handleUserContextChange as EventListener,
      )
    }
  }, [loadConsentInfo])

  const getStatusBadgeClass = (status: string) => {
    const baseClass = "status-badge"
    switch (status) {
      case ConsentStatuses.OptedIn:
        return `${baseClass} status-opted-in`
      case ConsentStatuses.OptedOut:
        return `${baseClass} status-opted-out`
      case ConsentStatuses.Pending:
        return `${baseClass} status-pending`
      case ConsentStatuses.PreApproved:
        return `${baseClass} status-pre-approved`
      default:
        return `${baseClass} status-undefined`
    }
  }

  return (
    <>
      <Paragraph>
        A reusable consent management package for Next.js applications
      </Paragraph>

      <div className='demo-card p-2! w-fit'>
        <div className='flex flex-col gap-1'>
          <div>
            <span className='text-gray-600'>Status: </span>
            {consentInfo && (
              <span className={getStatusBadgeClass(consentInfo.status)}>
                {consentInfo.status}
              </span>
            )}
          </div>
          <div>
            <span className='text-gray-600'>User Type: </span>
            <span
              className={`status-badge ${userInfo.isPublicServant ? "status-pre-approved" : "status-undefined"}`}
            >
              {userInfo.isPublicServant ? "Public Servant" : "Regular User"}
            </span>
          </div>
          {consentInfo?.version && (
            <div>
              <span className='text-gray-600'>Version: </span>
              <span className='font-mono text-xs bg-gray-100 px-2 py-1 rounded'>
                {consentInfo.version}
              </span>
            </div>
          )}
        </div>
      </div>

      {isOptedOut && (
        <Alert variant='warning' title='Limited Functionality'>
          You have declined consent, so some features in this demo may be
          disabled or limited. You can change your consent preferences at any
          time.
        </Alert>
      )}

      {userInfo.isPublicServant && (
        <Alert variant='info' title='Public Servant Mode'>
          You are currently experiencing the application as a public servant.
          Enhanced privacy protections and different consent rules may apply to
          government employees. This mode demonstrates how the consent package
          can adapt to different user contexts.
        </Alert>
      )}

      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-12'>
        <Card type='horizontal'>
          <CardContainer>
            <CardHeader>
              <CardTitle>
                <Heading level={3} size='sm'>
                  Smart Modal Logic
                </Heading>
              </CardTitle>
              <Paragraph size='sm'>
                The consent modal appears automatically based on user status,
                consent version, and custom rules.
              </Paragraph>
            </CardHeader>
            <CardAction>
              <Button
                type='button'
                variant='secondary'
                onClick={() => setIsConsentModalOpen(true)}
                className='gi-w-full gi-justify-center'
              >
                Force Show Modal
              </Button>
            </CardAction>
          </CardContainer>
        </Card>

        <Card type='horizontal'>
          <CardContainer>
            <CardHeader>
              <CardTitle>
                <Heading level={3} size='sm'>
                  Analytics Integration
                </Heading>
              </CardTitle>
              <Paragraph size='sm'>
                Track user consent decisions and modal interactions with
                built-in analytics support.
              </Paragraph>
            </CardHeader>

            <CardAction>
              <Link
                href='/analytics'
                asButton={{
                  variant: "secondary",
                  appearance: "default",
                }}
                className='gi-w-full gi-justify-center'
              >
                View Analytics
              </Link>
            </CardAction>
          </CardContainer>
        </Card>

        <Card type='horizontal'>
          <CardContainer>
            <CardHeader>
              <CardTitle>
                <Heading level={3} size='sm'>
                  Multiple Scenarios
                </Heading>
              </CardTitle>
              <Paragraph size='sm'>
                Explore different consent scenarios and configurations in
                action.
              </Paragraph>
            </CardHeader>
            <CardAction>
              <Link
                href='/scenarios'
                asButton={{
                  variant: "secondary",
                }}
                className='gi-w-full gi-justify-center'
              >
                View Scenarios
              </Link>
            </CardAction>
          </CardContainer>
        </Card>

        <Card type='horizontal'>
          <CardContainer>
            <CardHeader>
              <CardTitle>
                <Heading level={3} size='sm'>
                  API Integration
                </Heading>
              </CardTitle>
              <Paragraph size='sm'>
                See how to integrate with your backend API for consent storage
                and retrieval.
              </Paragraph>
            </CardHeader>
            <CardAction>
              <Link
                asButton={{
                  variant: "secondary",
                }}
                href='/api-example'
                className='gi-w-full gi-justify-center'
              >
                API Examples
              </Link>
            </CardAction>
          </CardContainer>
        </Card>

        <Card type='horizontal'>
          <CardContainer>
            <CardHeader>
              <CardTitle>
                <Heading level={3} size='sm'>
                  Multi-language
                </Heading>
              </CardTitle>
              <Paragraph size='sm'>
                Built-in support for internationalization with English and Irish
                languages.
              </Paragraph>
            </CardHeader>
            <CardAction>
              <Link
                href='/i18n'
                asButton={{
                  variant: "secondary",
                }}
                className='gi-w-full gi-justify-center'
              >
                Language Demo
              </Link>
            </CardAction>
          </CardContainer>
        </Card>
      </div>
    </>
  )
}
