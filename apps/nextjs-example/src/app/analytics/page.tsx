"use client"

import {
  ConsentProvider,
  type ConsentStatuses,
  useConsent,
} from "@ogcio/consent"
import Link from "next/link"
import { useEffect, useState } from "react"
import {
  createAnalyticsConsentConfig,
  fetchConsentStatus,
  mockUser,
} from "@/lib/consent"

interface AnalyticsEvent {
  id: string
  event: string
  category: string
  action: string
  value?: number
  timestamp: string
}

interface ConsoleLog {
  id: string
  message: string
  type: "info" | "error" | "warning"
  timestamp: string
}

interface AnalyticsContentProps {
  analyticsEvents: AnalyticsEvent[]
  trackAnalyticsEvent: (event: AnalyticsEvent) => void
  consentStatus: string
  clearEvents: () => void
  consoleLogs: ConsoleLog[]
  clearLogs: () => void
}

function AnalyticsContent({
  analyticsEvents,
  trackAnalyticsEvent,
  consentStatus,
  clearEvents,
  consoleLogs,
  clearLogs,
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case "opted-in":
        return "text-green-600 bg-green-100"
      case "opted-out":
        return "text-red-600 bg-red-100"
      case "pending":
        return "text-yellow-600 bg-yellow-100"
      default:
        return "text-gray-600 bg-gray-100"
    }
  }

  return (
    <div className='min-h-screen bg-gray-50 py-8'>
      <div className='max-w-6xl mx-auto px-4 sm:px-6 lg:px-8'>
        {/* Header */}
        <div className='mb-8'>
          <nav className='text-sm breadcrumbs mb-4'>
            <Link href='/' className='text-blue-600 hover:text-blue-800'>
              Home
            </Link>
            <span className='mx-2 text-gray-500'>›</span>
            <span className='text-gray-700'>Analytics</span>
          </nav>

          <h1 className='text-3xl! font-bold! text-gray-900 mb-4'>
            Analytics Integration
          </h1>
          <p className='text-lg text-gray-600'>
            Demonstrate how the consent package integrates with analytics
            tracking systems.
          </p>
        </div>

        <div className='grid lg:grid-cols-3 gap-8'>
          {/* Analytics Status Panel */}
          <div className='lg:col-span-1'>
            <div className='demo-card'>
              <h3 className='text-lg! font-semibold! mb-4'>Analytics Status</h3>

              <div className='space-y-4'>
                <div>
                  <div className='block text-sm font-medium text-gray-700 mb-1'>
                    Consent Status
                  </div>
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(consentStatus)}`}
                  >
                    {consentStatus}
                  </span>
                </div>

                <div>
                  <div className='block text-sm font-medium text-gray-700 mb-1'>
                    Analytics Enabled
                  </div>
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${isAnalyticsEnabled ? "text-green-600 bg-green-100" : "text-red-600 bg-red-100"}`}
                  >
                    {isAnalyticsEnabled ? "Yes" : "No"}
                  </span>
                </div>

                <div>
                  <div className='block text-sm font-medium text-gray-700 mb-1'>
                    Events Tracked
                  </div>
                  <span className='text-2xl font-bold text-blue-600'>
                    {analyticsEvents.length}
                  </span>
                </div>
              </div>

              <div className='mt-6 space-y-3 flex flex-col gap-2'>
                <button
                  onClick={() =>
                    trackCustomEvent("button_click", "demo", "test_tracking")
                  }
                  type='button'
                  disabled={!isAnalyticsEnabled}
                  className={`w-full demo-button ${isAnalyticsEnabled ? "demo-button-primary" : "demo-button-secondary opacity-50"}`}
                >
                  Track Test Event
                </button>

                <button
                  onClick={() =>
                    trackCustomEvent(
                      "page_view",
                      "analytics",
                      "manual_trigger",
                      1,
                    )
                  }
                  type='button'
                  disabled={!isAnalyticsEnabled}
                  className={`w-full demo-button ${isAnalyticsEnabled ? "demo-button-success" : "demo-button-secondary opacity-50"}`}
                >
                  Track Page View
                </button>

                <button
                  type='button'
                  onClick={clearEvents}
                  className='w-full demo-button demo-button-warning'
                >
                  Clear Events
                </button>

                <button
                  type='button'
                  onClick={() => setIsConsentModalOpen(true)}
                  className='w-full demo-button demo-button-secondary'
                >
                  Show Consent Modal
                </button>
              </div>
            </div>
          </div>

          {/* Events Timeline */}
          <div className='lg:col-span-2'>
            <div className='demo-card'>
              <div className='flex items-center justify-between mb-4'>
                <h3 className='text-lg! font-semibold!'>Events Timeline</h3>
                <span className='text-sm text-gray-500'>
                  {analyticsEvents.length} events tracked
                </span>
              </div>

              {analyticsEvents.length === 0 ? (
                <div className='text-center py-8 text-gray-500'>
                  <div className='text-4xl mb-2'>📊</div>
                  <p>No analytics events tracked yet.</p>
                  <p className='text-sm'>
                    {isAnalyticsEnabled
                      ? "Click the buttons above to generate some events."
                      : "Enable analytics consent to start tracking events."}
                  </p>
                </div>
              ) : (
                <div className='space-y-3 max-h-96 overflow-y-auto'>
                  {analyticsEvents.map((event) => (
                    <div
                      key={event.id}
                      className='border border-gray-200 rounded-lg p-3 bg-white'
                    >
                      <div className='flex items-center justify-between mb-2'>
                        <h4 className='font-medium text-gray-900'>
                          {event.event}
                        </h4>
                        <span className='text-xs text-gray-500'>
                          {new Date(event.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                      <div className='grid grid-cols-2 gap-4 text-sm text-gray-600'>
                        <div>
                          <strong>Category:</strong> {event.category}
                        </div>
                        <div>
                          <strong>Action:</strong> {event.action}
                        </div>
                        {event.value !== undefined && (
                          <div className='col-span-2'>
                            <strong>Value:</strong> {event.value}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Console Logs */}
            <div className='demo-card mt-6'>
              <div className='flex items-center justify-between mb-4'>
                <h3 className='text-lg! font-semibold!'>Console Logs</h3>
                <div className='flex gap-2'>
                  <span className='text-sm text-gray-500'>
                    {consoleLogs.length} logs
                  </span>
                  <button
                    type='button'
                    onClick={clearLogs}
                    className='text-xs demo-button demo-button-warning px-2 py-1'
                  >
                    Clear Logs
                  </button>
                </div>
              </div>

              {consoleLogs.length === 0 ? (
                <div className='text-center py-6 text-gray-500'>
                  <div className='text-2xl mb-2'>📝</div>
                  <p>No console logs yet.</p>
                  <p className='text-sm'>
                    Interact with the consent modal to see logs appear here.
                  </p>
                </div>
              ) : (
                <div className='space-y-2 max-h-64 overflow-y-auto bg-gray-900 rounded-lg p-3 font-mono text-sm'>
                  {consoleLogs.map((log) => (
                    <div
                      key={log.id}
                      className={`flex items-start gap-2 ${
                        log.type === "error"
                          ? "text-red-400"
                          : log.type === "warning"
                            ? "text-yellow-400"
                            : "text-green-400"
                      }`}
                    >
                      <span className='text-gray-500 text-xs flex-shrink-0 mt-0.5'>
                        {new Date(log.timestamp).toLocaleTimeString()}
                      </span>
                      <span className='flex-1 break-words'>{log.message}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function AnalyticsPage() {
  const [consentStatus, setConsentStatus] = useState<string>("undefined")
  const [userConsentVersion, setUserConsentVersion] = useState<
    string | undefined
  >()
  const [analyticsEvents, setAnalyticsEvents] = useState<AnalyticsEvent[]>([])
  const [consoleLogs, setConsoleLogs] = useState<ConsoleLog[]>([])

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

  // Add console log
  const addConsoleLog = (
    message: string,
    type: "info" | "error" | "warning" = "info",
  ) => {
    const log: ConsoleLog = {
      id: Date.now().toString(),
      message,
      type,
      timestamp: new Date().toISOString(),
    }
    setConsoleLogs((prev) => [log, ...prev.slice(0, 49)]) // Keep last 50 logs
    console.log(message) // Also log to browser console
  }

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
      />
    </ConsentProvider>
  )
}
