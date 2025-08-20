/** biome-ignore-all lint/a11y/noLabelWithoutControl: <explanation> */
"use client"

import { ConsentProvider, createAnalyticsTracker } from "@ogcio/consent"
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

export default function AnalyticsPage() {
  const [analyticsEvents, setAnalyticsEvents] = useState<AnalyticsEvent[]>([])
  const [consentStatus, setConsentStatus] = useState<string>("undefined")
  const [isAnalyticsEnabled, setIsAnalyticsEnabled] = useState(false)

  // Load initial consent status for analytics
  useEffect(() => {
    async function loadAnalyticsConsent() {
      const { consentStatus: status } = await fetchConsentStatus("analytics")
      setConsentStatus(status)
      setIsAnalyticsEnabled(status === "opted-in")
    }
    loadAnalyticsConsent()
  }, [])

  // Create analytics consent configuration
  const analyticsConfig = createAnalyticsConsentConfig()

  // Enhanced analytics tracker that updates our local state
  analyticsConfig.analyticsTracker = createAnalyticsTracker((event) => {
    const analyticsEvent: AnalyticsEvent = {
      id: Date.now().toString(),
      event: event.event.name,
      category: event.event.category,
      action: event.event.action,
      value: event.event.value,
      timestamp: new Date().toISOString(),
    }

    setAnalyticsEvents((prev) => [analyticsEvent, ...prev.slice(0, 19)]) // Keep last 20 events

    // In a real application, you would send to your analytics service
    console.log("📊 Analytics Event Tracked:", analyticsEvent)
  })

  const events = {
    onConsentDecision: (accepted: boolean) => {
      setConsentStatus(accepted ? "opted-in" : "opted-out")
      setIsAnalyticsEnabled(accepted)

      if (accepted) {
        // Simulate tracking some initial events when analytics is enabled
        setTimeout(() => {
          trackCustomEvent("page_view", "analytics", "enabled")
          trackCustomEvent("feature_enabled", "analytics", "consent_granted")
        }, 1000)
      }
    },
    onConsentError: (error: Error) => {
      console.error("Analytics consent error:", error)
    },
  }

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

    setAnalyticsEvents((prev) => [analyticsEvent, ...prev.slice(0, 19)])
    console.log("📊 Custom Event Tracked:", analyticsEvent)
  }

  const clearEvents = () => {
    setAnalyticsEvents([])
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
    <ConsentProvider
      config={analyticsConfig}
      userContext={{
        isPublicServant: mockUser.isPublicServant,
        preferredLanguage: mockUser.preferredLanguage,
      }}
      consentStatus={consentStatus as any}
      events={events}
    >
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

            <h1 className='text-3xl font-bold text-gray-900 mb-4'>
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
                <h3 className='text-lg font-semibold mb-4'>Analytics Status</h3>

                <div className='space-y-4'>
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-1'>
                      Consent Status
                    </label>
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(consentStatus)}`}
                    >
                      {consentStatus}
                    </span>
                  </div>

                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-1'>
                      Analytics Enabled
                    </label>
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${isAnalyticsEnabled ? "text-green-600 bg-green-100" : "text-red-600 bg-red-100"}`}
                    >
                      {isAnalyticsEnabled ? "Yes" : "No"}
                    </span>
                  </div>

                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-1'>
                      Events Tracked
                    </label>
                    <span className='text-2xl font-bold text-blue-600'>
                      {analyticsEvents.length}
                    </span>
                  </div>
                </div>

                <div className='mt-6 space-y-3'>
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
                </div>
              </div>

              {/* Analytics Configuration */}
              <div className='demo-card mt-6'>
                <h3 className='text-lg font-semibold mb-4'>Configuration</h3>
                <div className='space-y-3 text-sm'>
                  <div>
                    <strong>Subject:</strong> analytics
                  </div>
                  <div>
                    <strong>Version:</strong> v1.0.0
                  </div>
                  <div>
                    <strong>Tracking:</strong> Console + State
                  </div>
                  <div>
                    <strong>Real Analytics:</strong>
                    <span className='text-red-600 ml-1'>Disabled (Demo)</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Events Timeline */}
            <div className='lg:col-span-2'>
              <div className='demo-card'>
                <div className='flex items-center justify-between mb-4'>
                  <h3 className='text-lg font-semibold'>Events Timeline</h3>
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

              {/* Integration Examples */}
              <div className='demo-card mt-6'>
                <h3 className='text-lg font-semibold mb-4'>
                  Integration Examples
                </h3>
                <div className='space-y-4'>
                  <div className='bg-gray-50 rounded-lg p-4'>
                    <h4 className='font-medium mb-2'>Google Analytics 4</h4>
                    <pre className='text-xs bg-gray-800 text-green-400 p-3 rounded overflow-x-auto'>
                      {`// In your analytics tracker
createAnalyticsTracker((event) => {
  gtag('event', event.event.name, {
    event_category: event.event.category,
    event_action: event.event.action,
    value: event.event.value,
  })
})`}
                    </pre>
                  </div>

                  <div className='bg-gray-50 rounded-lg p-4'>
                    <h4 className='font-medium mb-2'>Mixpanel</h4>
                    <pre className='text-xs bg-gray-800 text-green-400 p-3 rounded overflow-x-auto'>
                      {`// In your analytics tracker
createAnalyticsTracker((event) => {
  mixpanel.track(event.event.name, {
    category: event.event.category,
    action: event.event.action,
    value: event.event.value,
  })
})`}
                    </pre>
                  </div>

                  <div className='bg-gray-50 rounded-lg p-4'>
                    <h4 className='font-medium mb-2'>Custom Analytics</h4>
                    <pre className='text-xs bg-gray-800 text-green-400 p-3 rounded overflow-x-auto'>
                      {`// In your analytics tracker
createAnalyticsTracker((event) => {
  fetch('/api/analytics', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(event),
  })
})`}
                    </pre>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ConsentProvider>
  )
}
