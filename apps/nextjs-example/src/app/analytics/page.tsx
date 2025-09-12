"use client"

import {
  ConsentProvider,
  type ConsentStatuses,
  useConsent,
} from "@ogcio/consent"
import {
  Button,
  Caption,
  Card,
  CardAction,
  CardContainer,
  CardHeader,
  Paragraph,
  Stack,
  SummaryList,
  SummaryListRow,
  SummaryListValue,
  Table,
  TableBody,
  TableData,
  TableHead,
  TableHeader,
  TableRow,
  Tag,
} from "@ogcio/design-system-react"
import { useEffect, useState } from "react"
import { ApiCallsCard } from "@/components/ApiCallsCard"
import { ConsoleLogsCard } from "@/components/ConsoleLogsCard"
import type { ApiCall, ConsoleLog } from "@/components/types"
import {
  createAnalyticsConsentConfig,
  fetchConsentStatus,
  mockUser,
} from "@/lib/consent"
import {
  createApiCallTracker,
  createConsoleLogger,
  createMakeApiCall,
} from "@/utils/apiUtils"

interface AnalyticsEvent {
  id: string
  event: string
  category: string
  action: string
  value?: number
  timestamp: string
}

interface AnalyticsContentProps {
  analyticsEvents: AnalyticsEvent[]
  trackAnalyticsEvent: (event: AnalyticsEvent) => void
  consentStatus: string
  clearEvents: () => void
  consoleLogs: ConsoleLog[]
  clearLogs: () => void
  apiCalls: ApiCall[]
  clearApiCalls: () => void
  makeApiCall: (
    method: string,
    endpoint: string,
    body?: unknown,
  ) => Promise<Response>
}

function AnalyticsContent({
  analyticsEvents,
  trackAnalyticsEvent,
  consentStatus,
  clearEvents,
  consoleLogs,
  clearLogs,
  apiCalls,
  clearApiCalls,
  makeApiCall,
}: AnalyticsContentProps) {
  const [isAnalyticsEnabled, setIsAnalyticsEnabled] = useState(false)
  const { setIsConsentModalOpen } = useConsent()

  // Update analytics enabled state when consent status changes
  useEffect(() => {
    setIsAnalyticsEnabled(consentStatus === "opted-in")
  }, [consentStatus])

  // Store modal close function globally for use in parent events
  useEffect(() => {
    ;(
      window as unknown as { __analyticsModalClose?: () => void }
    ).__analyticsModalClose = () => setIsConsentModalOpen(false)
    return () => {
      delete (window as unknown as { __analyticsModalClose?: () => void })
        .__analyticsModalClose
    }
  }, [setIsConsentModalOpen])

  const trackCustomEvent = (
    event: string,
    category: string,
    action: string,
    value?: number,
  ) => {
    if (!isAnalyticsEnabled) {
      alert(
        "Analytics tracking is disabled. Please enable analytics consent first.",
      )
      return
    }

    const analyticsEvent: AnalyticsEvent = {
      id: Date.now().toString(),
      event,
      category,
      action,
      value,
      timestamp: new Date().toISOString(),
    }

    trackAnalyticsEvent(analyticsEvent)
  }

  return (
    <Stack gap={8}>
      <Paragraph>
        Demonstrate how the consent package integrates with analytics tracking
        systems.
      </Paragraph>

      <div className='grid lg:grid-cols-3 gap-8'>
        <div className='lg:col-span-1'>
          <Card type='horizontal'>
            <CardContainer>
              <CardHeader>
                <SummaryList>
                  <SummaryListRow label='Consent Status' withBorder>
                    <SummaryListValue>
                      <Tag
                        text={consentStatus}
                        type={
                          consentStatus === "opted-in"
                            ? "success"
                            : consentStatus === "opted-out"
                              ? "error"
                              : "default"
                        }
                      />
                    </SummaryListValue>
                  </SummaryListRow>

                  <SummaryListRow label='Analytics Enabled' withBorder>
                    <SummaryListValue>
                      <Tag
                        text={isAnalyticsEnabled ? "Yes" : "No"}
                        type={isAnalyticsEnabled ? "success" : "error"}
                      />
                    </SummaryListValue>
                  </SummaryListRow>

                  <SummaryListRow label='Events Tracked' withBorder>
                    <SummaryListValue>
                      <Tag
                        text={analyticsEvents.length.toString()}
                        type='info'
                      />
                    </SummaryListValue>
                  </SummaryListRow>
                </SummaryList>
              </CardHeader>
              <CardAction>
                <div className='mt-6 space-y-3 flex flex-col gap-2'>
                  <Button
                    onClick={() =>
                      trackCustomEvent("button_click", "demo", "test_tracking")
                    }
                    variant='secondary'
                    type='button'
                    disabled={!isAnalyticsEnabled}
                    className='w-full gi-justify-center'
                  >
                    Track Test Event
                  </Button>

                  <Button
                    onClick={() =>
                      trackCustomEvent(
                        "page_view",
                        "analytics",
                        "manual_trigger",
                        1,
                      )
                    }
                    type='button'
                    variant='secondary'
                    disabled={!isAnalyticsEnabled}
                    className='w-full gi-justify-center'
                  >
                    Track Page View
                  </Button>

                  <Button
                    type='button'
                    variant='secondary'
                    onClick={clearEvents}
                    className='w-full gi-justify-center'
                  >
                    Clear Events
                  </Button>

                  <Button
                    type='button'
                    variant='secondary'
                    onClick={() => setIsConsentModalOpen(true)}
                    className='w-full gi-justify-center'
                  >
                    Show Consent Modal
                  </Button>

                  <Button
                    type='button'
                    variant='secondary'
                    onClick={() =>
                      makeApiCall(
                        "GET",
                        "/api/consent/status?subject=analytics&userId=user-123",
                      )
                    }
                    className='w-full gi-justify-center'
                  >
                    Check Analytics Status
                  </Button>

                  <Button
                    type='button'
                    variant='secondary'
                    onClick={() =>
                      makeApiCall("POST", "/api/consent/submit", {
                        accept: true,
                        subject: "analytics",
                        preferredLanguage: "en",
                        versionId: "v1.2.0",
                      })
                    }
                    className='w-full gi-justify-center'
                  >
                    Submit Analytics Consent
                  </Button>
                </div>
              </CardAction>
            </CardContainer>
          </Card>
        </div>

        {/* Events Timeline */}
        <div className='lg:col-span-2'>
          <Card type='horizontal'>
            <CardContainer>
              <Table>
                <Caption>Events Timeline</Caption>
                <TableHead>
                  <TableRow>
                    <TableHeader>Event</TableHeader>
                    <TableHeader>Category</TableHeader>
                    <TableHeader>Action</TableHeader>
                    <TableHeader>Value</TableHeader>
                    <TableHeader>Timestamp</TableHeader>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {analyticsEvents.map((event) => (
                    <TableRow key={event.id}>
                      <TableData>{event.event}</TableData>
                      <TableData>{event.category}</TableData>
                      <TableData>{event.action}</TableData>
                      <TableData>{event.value}</TableData>
                      <TableData>
                        {new Date(event.timestamp).toLocaleTimeString()}
                      </TableData>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContainer>
          </Card>
        </div>

        <div className='lg:col-span-3'>
          <div className='flex flex-col gap-8'>
            <ConsoleLogsCard logs={consoleLogs} onClearLogs={clearLogs} />

            <ApiCallsCard apiCalls={apiCalls} onClearApiCalls={clearApiCalls} />
          </div>
        </div>
      </div>
    </Stack>
  )
}

export default function AnalyticsPage() {
  const [consentStatus, setConsentStatus] = useState<string>("undefined")
  const [userConsentVersion, setUserConsentVersion] = useState<
    string | undefined
  >()
  const [analyticsEvents, setAnalyticsEvents] = useState<AnalyticsEvent[]>([])
  const [consoleLogs, setConsoleLogs] = useState<ConsoleLog[]>([])
  const [apiCalls, setApiCalls] = useState<ApiCall[]>([])

  // Load initial consent status for analytics
  useEffect(() => {
    async function loadAnalyticsConsent() {
      const { consentStatus: status, userConsentVersion: version } =
        await fetchConsentStatus("analytics")
      setConsentStatus(status)
      setUserConsentVersion(version)
    }
    loadAnalyticsConsent()
  }, [])

  // Create analytics consent configuration
  const analyticsConfig = createAnalyticsConsentConfig()

  // Utility functions for logging and API tracking
  const addConsoleLog = createConsoleLogger(setConsoleLogs)
  const trackApiCall = createApiCallTracker(setApiCalls, addConsoleLog)
  const makeApiCall = createMakeApiCall(trackApiCall)

  // Track analytics events
  const trackAnalyticsEvent = (event: AnalyticsEvent) => {
    setAnalyticsEvents((prev) => [event, ...prev.slice(0, 19)]) // Keep last 20 events
    addConsoleLog(
      `📊 Analytics Event Tracked: ${event.event} (${event.action})`,
    )
  }

  const clearEvents = () => {
    setAnalyticsEvents([])
  }

  const clearLogs = () => {
    setConsoleLogs([])
  }

  const clearApiCalls = () => {
    setApiCalls([])
  }

  const events = {
    onConsentDecision: (accepted: boolean) => {
      addConsoleLog(
        `🔒 User ${accepted ? "accepted" : "declined"} analytics consent`,
      )

      setConsentStatus(accepted ? "opted-in" : "opted-out")
      // Always set the version that was consented to (accept or decline)
      setUserConsentVersion(analyticsConfig.content.version.id)

      // Close modal using global function
      if (typeof window !== "undefined") {
        const windowWithClose = window as unknown as {
          __analyticsModalClose?: () => void
        }
        if (windowWithClose.__analyticsModalClose) {
          windowWithClose.__analyticsModalClose()
          addConsoleLog("📖 Analytics consent modal closed")
        }
      }

      // Track consent decision event (for both accept and decline)
      setTimeout(() => {
        trackAnalyticsEvent({
          id: Date.now().toString(),
          event: accepted ? "consent_granted" : "consent_declined",
          category: "analytics",
          action: accepted ? "accept" : "decline",
          timestamp: new Date().toISOString(),
        })

        if (accepted) {
          trackAnalyticsEvent({
            id: (Date.now() + 1).toString(),
            event: "feature_enabled",
            category: "analytics",
            action: "consent_granted",
            timestamp: new Date().toISOString(),
          })
        }
      }, 100)
    },
    onConsentError: (error: Error) => {
      addConsoleLog(`🚨 Analytics consent error: ${error.message}`, "error")
    },
    onModalOpen: () => {
      addConsoleLog("📖 Analytics consent modal opened")
    },
    onModalClose: () => {
      addConsoleLog("📖 Analytics consent modal closed")
    },
  }

  return (
    <ConsentProvider
      config={analyticsConfig}
      userContext={{
        isPublicServant: mockUser.isPublicServant,
        preferredLanguage: mockUser.preferredLanguage,
      }}
      consentStatus={
        consentStatus as (typeof ConsentStatuses)[keyof typeof ConsentStatuses]
      }
      userConsentVersion={userConsentVersion}
      events={events}
    >
      <AnalyticsContent
        analyticsEvents={analyticsEvents}
        trackAnalyticsEvent={trackAnalyticsEvent}
        consentStatus={consentStatus}
        clearEvents={clearEvents}
        consoleLogs={consoleLogs}
        clearLogs={clearLogs}
        apiCalls={apiCalls}
        clearApiCalls={clearApiCalls}
        makeApiCall={makeApiCall}
      />
    </ConsentProvider>
  )
}
