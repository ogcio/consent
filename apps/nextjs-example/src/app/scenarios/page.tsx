"use client"

import { useConsent } from "@ogcio/consent"
import {
  Button,
  Card,
  CardAction,
  CardContainer,
  CardHeader,
  CardTitle,
  Paragraph,
  Stack,
} from "@ogcio/design-system-react"
import { useState } from "react"
import { ApiCallsCard } from "@/components/ApiCallsCard"
import { ConsoleLogsCard } from "@/components/ConsoleLogsCard"
import type { ApiCall, ConsoleLog } from "@/components/types"
import {
  createApiCallTracker,
  createConsoleLogger,
  createMakeApiCall,
} from "@/utils/apiUtils"

interface Scenario {
  id: string
  title: string
  description: string
  action: string
  buttonText: string
  status?: string
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

  // Add console log using utility
  const addConsoleLog = createConsoleLogger(setConsoleLogs)

  const clearLogs = () => {
    setConsoleLogs([])
  }

  // API call tracking using utilities
  const trackApiCall = createApiCallTracker(setApiCalls, addConsoleLog)
  const makeApiCall = createMakeApiCall(trackApiCall)

  const clearApiCalls = () => {
    setApiCalls([])
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
        versionId: config.content?.version.toString(),
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
    },
    {
      id: "new-user",
      title: "New User Experience",
      description:
        "Simulate what a new user sees when they first visit the application.",
      action: "simulate",
      buttonText: "Simulate New User",
      status: "undefined",
    },
    {
      id: "version-update",
      title: "Version Update",
      description:
        "Simulate when consent version is updated and user needs to re-consent.",
      action: "version-update",
      buttonText: "Simulate Update",
      status: "pending",
    },
    {
      id: "opted-out",
      title: "Opted Out User",
      description:
        "See how the application behaves for users who have declined consent.",
      action: "simulate",
      buttonText: "Simulate Opt-out",
      status: "opted-out",
    },
    {
      id: "public-servant",
      title: "Public Servant",
      description:
        "Experience the application as a public servant (different consent rules may apply).",
      action: "public-servant",
      buttonText: "Switch to Public Servant",
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
    }

    addConsoleLog(`✨ Completed scenario: ${scenario.title}`)
    // Reset active scenario after a delay
    setTimeout(() => setActiveScenario(null), 1000)
  }

  return (
    <Stack gap={8}>
      <Paragraph>
        Explore different consent scenarios and see how the system responds to
        various user states and interactions.
      </Paragraph>

      <div className='grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8'>
        {scenarios.map((scenario) => (
          <Card type='horizontal' key={scenario.id}>
            <CardContainer>
              <CardHeader>
                <CardTitle>{scenario.title}</CardTitle>
                <Paragraph size='sm'>{scenario.description}</Paragraph>
              </CardHeader>

              <CardAction>
                <Button
                  type='button'
                  variant='secondary'
                  onClick={() => handleScenarioAction(scenario)}
                  disabled={activeScenario === scenario.id}
                  className={`gi-w-full gi-justify-center ${
                    activeScenario === scenario.id
                      ? "opacity-50 cursor-not-allowed"
                      : ""
                  }`}
                >
                  {activeScenario === scenario.id
                    ? "Processing..."
                    : scenario.buttonText}
                </Button>
              </CardAction>
            </CardContainer>
          </Card>
        ))}
      </div>

      <Stack gap={8}>
        <ConsoleLogsCard logs={consoleLogs} onClearLogs={clearLogs} />

        <ApiCallsCard apiCalls={apiCalls} onClearApiCalls={clearApiCalls} />
      </Stack>
    </Stack>
  )
}
