"use client"

import { useConsent } from "@ogcio/consent"
import Link from "next/link"
import { useState } from "react"

interface Scenario {
  id: string
  title: string
  description: string
  action: string
  buttonText: string
  buttonClass: string
  status?: string
}

interface ConsoleLog {
  id: string
  message: string
  type: "info" | "error" | "warning"
  timestamp: string
}

interface ApiCall {
  id: string
  timestamp: string
  method: string
  endpoint: string
  status: number
  data: unknown
  duration: number
}

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

export default function ScenariosPage() {
  const { setIsConsentModalOpen, config } = useConsent()
  const [activeScenario, setActiveScenario] = useState<string | null>(null)
  const [consoleLogs, setConsoleLogs] = useState<ConsoleLog[]>([])
  const [apiCalls, setApiCalls] = useState<ApiCall[]>([])

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

  const clearLogs = () => {
    setConsoleLogs([])
  }

  // Add API call tracking
  const trackApiCall = (
    method: string,
    endpoint: string,
    status: number,
    data: unknown,
    duration: number,
  ) => {
    const apiCall: ApiCall = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      method,
      endpoint,
      status,
      data,
      duration,
    }
    setApiCalls((prev) => [apiCall, ...prev.slice(0, 19)]) // Keep last 20 calls
    addConsoleLog(`🌐 API ${method} ${endpoint} - ${status} (${duration}ms)`)
  }

  const clearApiCalls = () => {
    setApiCalls([])
  }

  // Enhanced fetch wrapper that tracks API calls
  const makeApiCall = async (
    method: string,
    endpoint: string,
    body?: unknown,
  ): Promise<Response> => {
    const startTime = Date.now()

    try {
      const response = await fetch(endpoint, {
        method,
        headers: body ? { "Content-Type": "application/json" } : {},
        body: body ? JSON.stringify(body) : undefined,
      })

      const responseData = await response.json()
      const duration = Date.now() - startTime

      trackApiCall(method, endpoint, response.status, responseData, duration)

      return new Response(JSON.stringify(responseData), {
        status: response.status,
        statusText: response.statusText,
        headers: response.headers,
      })
    } catch (error) {
      const duration = Date.now() - startTime
      const errorData = {
        error: error instanceof Error ? error.message : "Network error",
      }

      trackApiCall(method, endpoint, 0, errorData, duration)
      throw error
    }
  }

  const getStatusColor = (status: number) => {
    if (status >= 200 && status < 300) return "text-green-600 bg-green-100"
    if (status >= 400 && status < 500) return "text-red-600 bg-red-100"
    if (status >= 500) return "text-red-600 bg-red-200"
    return "text-gray-600 bg-gray-100"
  }

  // Simulate version update that requires re-consent
  const simulateVersionUpdate = async () => {
    try {
      addConsoleLog("📋 Starting consent version update simulation...")

      // Step 1: Set consent to pending (simulates a new version requiring re-consent)
      addConsoleLog("⏫ Setting consent to pending due to version update...")
      const pendingResponse = await makeApiCall(
        "POST",
        "/api/consent/pending",
        {
          subject: config.subject,
        },
      )

      if (!pendingResponse.ok) {
        addConsoleLog("❌ Failed to set consent to pending", "error")
        alert("Failed to update consent status.")
        return
      }

      addConsoleLog("✅ Consent status set to pending successfully")

      // Step 2: Trigger consent status reload in other components
      addConsoleLog("🔄 Notifying application of consent status change...")

      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("consentChanged"))
      }

      // Step 3: Wait a moment then automatically show the consent modal
      setTimeout(() => {
        addConsoleLog("🆕 New consent version detected - showing modal...")
        setIsConsentModalOpen(true)
        addConsoleLog("🎉 Version update simulation complete!")
        alert(
          "Version update simulation complete! The consent modal is now showing because a new version requires your consent. No page refresh needed!",
        )
      }, 1000)
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error"
      addConsoleLog(
        `🚨 Error during version update simulation: ${errorMessage}`,
        "error",
      )
      alert(
        "Error during version update simulation. Check the console for details.",
      )
    }
  }

  // Simulate public servant mode toggle
  const simulatePublicServant = async () => {
    try {
      addConsoleLog("👨‍💼 Starting public servant mode simulation...")

      // Get current public servant status from mockUser
      const currentStatus = window.__mockUser?.isPublicServant || false
      const newStatus = !currentStatus

      addConsoleLog(
        `🔄 Switching from ${currentStatus ? "Public Servant" : "Regular User"} to ${newStatus ? "Public Servant" : "Regular User"}`,
      )

      // Update global mock user state
      if (typeof window !== "undefined") {
        window.__mockUser = {
          ...(window.__mockUser || {
            id: "user-123",
            preferredLanguage: "en",
            isAuthenticated: true,
          }),
          isPublicServant: newStatus,
        }
      }

      addConsoleLog("✅ User context updated successfully")
      addConsoleLog("🔄 Triggering consent provider refresh...")

      // Dispatch custom event to trigger consent context refresh
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("consentChanged"))
        window.dispatchEvent(
          new CustomEvent("userContextChanged", {
            detail: { isPublicServant: newStatus },
          }),
        )
      }

      setTimeout(() => {
        if (newStatus) {
          addConsoleLog("🏛️ Public servant mode activated")
          addConsoleLog("⚖️ Different consent rules may now apply")
          addConsoleLog("🎯 Enhanced privacy protections enabled")
        } else {
          addConsoleLog("👤 Regular user mode activated")
          addConsoleLog("📋 Standard consent rules now apply")
        }
        addConsoleLog("🎉 Public servant simulation complete!")
        alert(
          `Successfully switched to ${newStatus ? "Public Servant" : "Regular User"} mode! ${newStatus ? "Enhanced privacy protections are now active for government employees." : "Standard consent rules now apply."} Check the console logs and home page to see the changes.`,
        )
      }, 1000)
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error"
      addConsoleLog(
        `🚨 Error during public servant simulation: ${errorMessage}`,
        "error",
      )
      alert(
        "Error during public servant simulation. Check the console for details.",
      )
    }
  }

  // Simulate opted-out user experience
  const simulateOptedOutUser = async () => {
    try {
      addConsoleLog("🚫 Starting opted-out user simulation...")

      // Step 1: Reset user context to regular user (for clean opt-out simulation)
      addConsoleLog("👤 Resetting user context to regular user...")
      if (typeof window !== "undefined") {
        window.__mockUser = {
          id: "user-123",
          preferredLanguage: "en",
          isAuthenticated: true,
          isPublicServant: false, // Opted-out simulation uses regular user
        }
      }

      // Step 2: Submit a declined consent decision
      addConsoleLog("❌ Submitting declined consent decision...")
      const declineResponse = await makeApiCall("POST", "/api/consent/submit", {
        accept: false,
        subject: config.subject,
        preferredLanguage: "en",
        versionId: config.content.version.id,
      })

      if (!declineResponse.ok) {
        addConsoleLog("❌ Failed to submit declined consent", "error")
        alert("Failed to simulate opted-out user.")
        return
      }

      addConsoleLog("✅ Declined consent decision recorded successfully")

      // Step 3: Trigger consent status reload and user context update
      addConsoleLog("🔄 Updating application state for opted-out user...")

      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("consentChanged"))
        window.dispatchEvent(
          new CustomEvent("userContextChanged", {
            detail: { isPublicServant: false },
          }),
        )
      }

      // Step 4: Show the opted-out experience
      setTimeout(() => {
        addConsoleLog("⚠️ User is now opted-out - limited functionality active")
        addConsoleLog("🛡️ Privacy-respecting mode enabled")
        addConsoleLog("🎉 Opted-out user simulation complete!")
        alert(
          "Opted-out simulation complete! You are now experiencing the application as a regular user who declined consent. Check the home page to see the limited functionality warning and how the app respects your privacy choice.",
        )
      }, 1000)
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error"
      addConsoleLog(
        `🚨 Error during opted-out user simulation: ${errorMessage}`,
        "error",
      )
      alert(
        "Error during opted-out user simulation. Check the console for details.",
      )
    }
  }

  // Simulate new user experience
  const simulateNewUser = async () => {
    try {
      addConsoleLog("👶 Starting new user simulation...")

      // Step 1: Clear existing consent data
      addConsoleLog("🧹 Clearing existing consent data...")
      const resetResponse = await makeApiCall("POST", "/api/consent/reset", {
        subject: config.subject,
        userId: "user-123",
      })

      if (!resetResponse.ok) {
        addConsoleLog("❌ Failed to clear consent data", "error")
        alert("Failed to reset consent data for new user simulation.")
        return
      }

      addConsoleLog("✅ Consent data cleared successfully")

      // Step 2: Reset user context to regular user (new users aren't public servants)
      addConsoleLog("👤 Resetting user context to regular user...")
      if (typeof window !== "undefined") {
        window.__mockUser = {
          id: "user-123",
          preferredLanguage: "en",
          isAuthenticated: true,
          isPublicServant: false, // New users start as regular users
        }
      }

      // Step 3: Simulate page refresh by triggering consent status reload
      addConsoleLog("🔄 Simulating page refresh and consent status check...")

      // Dispatch custom events to trigger reloads in other components
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("consentChanged"))
        window.dispatchEvent(
          new CustomEvent("userContextChanged", {
            detail: { isPublicServant: false },
          }),
        )
      }

      // Step 4: Wait a moment then trigger the consent modal
      setTimeout(() => {
        addConsoleLog("📋 New user detected - showing consent modal...")
        setIsConsentModalOpen(true)
        addConsoleLog("🎉 New user experience simulation complete!")
        alert(
          "New user simulation complete! The consent modal should now appear as if you're a first-time visitor. Your previous consent decisions have been cleared and you're now a regular user.",
        )
      }, 1000)
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error"
      addConsoleLog(
        `🚨 Error during new user simulation: ${errorMessage}`,
        "error",
      )
      alert("Error during new user simulation. Check the console for details.")
    }
  }

  const scenarios: Scenario[] = [
    {
      id: "force-modal",
      title: "Force Show Modal",
      description:
        "Manually trigger the consent modal to appear, regardless of current consent status.",
      action: "show",
      buttonText: "Show Modal",
      buttonClass: "demo-button-primary",
    },
    {
      id: "new-user",
      title: "New User Experience",
      description:
        "Simulate what a new user sees when they first visit the application.",
      action: "simulate",
      buttonText: "Simulate New User",
      buttonClass: "demo-button-success",
      status: "undefined",
    },
    {
      id: "version-update",
      title: "Version Update",
      description:
        "Simulate when consent version is updated and user needs to re-consent.",
      action: "version-update",
      buttonText: "Simulate Update",
      buttonClass: "demo-button-warning",
      status: "pending",
    },
    {
      id: "opted-out",
      title: "Opted Out User",
      description:
        "See how the application behaves for users who have declined consent.",
      action: "simulate",
      buttonText: "Simulate Opt-out",
      buttonClass: "demo-button-danger",
      status: "opted-out",
    },
    {
      id: "public-servant",
      title: "Public Servant",
      description:
        "Experience the application as a public servant (different consent rules may apply).",
      action: "public-servant",
      buttonText: "Switch to Public Servant",
      buttonClass: "demo-button-secondary",
    },
  ]

  const handleScenarioAction = async (scenario: Scenario) => {
    setActiveScenario(scenario.id)
    addConsoleLog(`🎬 Starting scenario: ${scenario.title}`)

    switch (scenario.action) {
      case "show":
        addConsoleLog("📖 Opening consent modal manually")
        setIsConsentModalOpen(true)
        break

      case "simulate":
        // Handle different simulation scenarios
        if (scenario.id === "new-user") {
          await simulateNewUser()
        } else if (scenario.id === "opted-out") {
          await simulateOptedOutUser()
        } else {
          // Generic simulation for other scenarios
          addConsoleLog(`🎭 Simulating scenario: ${scenario.id}`)
          alert(
            `Simulating ${scenario.title}. In a real app, this would update the user context.`,
          )
        }
        break

      case "version-update":
        await simulateVersionUpdate()
        break

      case "public-servant":
        await simulatePublicServant()
        break

      case "mobile":
        addConsoleLog("📱 Showing mobile responsiveness info")
        alert(
          "Try resizing your browser window or opening this on a mobile device to see the responsive design.",
        )
        break
    }

    addConsoleLog(`✨ Completed scenario: ${scenario.title}`)
    // Reset active scenario after a delay
    setTimeout(() => setActiveScenario(null), 1000)
  }

  return (
    <div className='min-h-screen bg-gray-50 py-8'>
      <div className='max-w-4xl mx-auto px-4 sm:px-6 lg:px-8'>
        {/* Header */}
        <div className='mb-8'>
          <nav className='text-sm breadcrumbs mb-4'>
            <Link href='/' className='text-blue-600 hover:text-blue-800'>
              Home
            </Link>
            <span className='mx-2 text-gray-500'>›</span>
            <span className='text-gray-700'>Scenarios</span>
          </nav>

          <h1 className='text-2xl! font-bold! text-gray-900 mb-4'>
            Consent Scenarios
          </h1>
          <p className='text-lg text-gray-600'>
            Explore different consent scenarios and see how the system responds
            to various user states and interactions.
          </p>
        </div>

        {/* Scenarios Grid */}
        <div className='grid md:grid-cols-2 gap-6 mb-8'>
          {scenarios.map((scenario) => (
            <div key={scenario.id} className='demo-card'>
              <div className='flex items-start justify-between mb-3'>
                <h3 className='text-lg! font-semibold!'>{scenario.title}</h3>
                {scenario.status && (
                  <span className={`status-badge status-${scenario.status}`}>
                    {scenario.status}
                  </span>
                )}
              </div>

              <p className='text-gray-600 mb-4'>{scenario.description}</p>

              <button
                type='button'
                onClick={() => handleScenarioAction(scenario)}
                disabled={activeScenario === scenario.id}
                className={`demo-button ${scenario.buttonClass} ${
                  activeScenario === scenario.id
                    ? "opacity-50 cursor-not-allowed"
                    : ""
                }`}
              >
                {activeScenario === scenario.id
                  ? "Processing..."
                  : scenario.buttonText}
              </button>
            </div>
          ))}
        </div>

        {/* Console Logs */}
        <div className='demo-card mt-8'>
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
                Try different scenarios to see logs appear here.
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

        {/* API Calls Log */}
        <div className='demo-card mt-8'>
          <div className='flex items-center justify-between mb-4'>
            <h3 className='text-lg! font-semibold!'>API Calls</h3>
            <div className='flex gap-2'>
              <span className='text-sm text-gray-500'>
                {apiCalls.length} calls made
              </span>
              <button
                type='button'
                onClick={clearApiCalls}
                className='text-xs demo-button demo-button-warning px-2 py-1'
              >
                Clear API Calls
              </button>
            </div>
          </div>

          {apiCalls.length === 0 ? (
            <div className='text-center py-6 text-gray-500'>
              <div className='text-2xl mb-2'>🔗</div>
              <p>No API calls made yet.</p>
              <p className='text-sm'>
                Try scenarios that make API calls to see them appear here.
              </p>
            </div>
          ) : (
            <div className='space-y-3 max-h-64 overflow-y-auto'>
              {apiCalls.map((call) => (
                <div
                  key={call.id}
                  className='border border-gray-200 rounded-lg p-3 bg-white'
                >
                  <div className='flex items-center justify-between mb-2'>
                    <div className='flex items-center space-x-2'>
                      <span className='font-mono text-sm font-medium px-2 py-1 bg-blue-100 text-blue-800 rounded'>
                        {call.method}
                      </span>
                      <span
                        className={`text-xs px-2 py-1 rounded-full font-medium ${getStatusColor(call.status)}`}
                      >
                        {call.status || "ERR"}
                      </span>
                    </div>
                    <div className='text-xs text-gray-500'>
                      {call.duration}ms
                    </div>
                  </div>

                  <div className='text-sm text-gray-700 mb-2 font-mono'>
                    {call.endpoint}
                  </div>

                  <div className='text-xs text-gray-500 mb-2'>
                    {new Date(call.timestamp).toLocaleString()}
                  </div>

                  <details className='text-xs'>
                    <summary className='cursor-pointer text-blue-600 hover:text-blue-800'>
                      View Response
                    </summary>
                    <pre className='mt-2 p-2 bg-gray-50 rounded overflow-x-auto'>
                      {JSON.stringify(call.data, null, 2)}
                    </pre>
                  </details>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
