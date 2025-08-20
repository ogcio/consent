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

export default function ScenariosPage() {
  const { setIsConsentModalOpen, config } = useConsent()
  const [activeScenario, setActiveScenario] = useState<string | null>(null)

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
    {
      id: "mobile-view",
      title: "Mobile Experience",
      description:
        "See how the consent modal appears and functions on mobile devices.",
      action: "mobile",
      buttonText: "Mobile Demo",
      buttonClass: "demo-button-primary",
    },
  ]

  const handleScenarioAction = async (scenario: Scenario) => {
    setActiveScenario(scenario.id)

    switch (scenario.action) {
      case "show":
        setIsConsentModalOpen(true)
        break

      case "simulate":
        // In a real application, you would update the user context or reload data
        console.log(`Simulating scenario: ${scenario.id}`)
        alert(
          `Simulating ${scenario.title}. In a real app, this would update the user context.`,
        )
        break

      case "version-update":
        try {
          const response = await fetch("/api/consent/pending", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ subject: config.subject }),
          })

          if (response.ok) {
            alert(
              "Consent status set to pending. Refresh the page to see the modal.",
            )
          } else {
            alert("Failed to update consent status.")
          }
        } catch (error) {
          console.error("Error updating consent status:", error)
          alert("Error updating consent status.")
        }
        break

      case "public-servant":
        alert(
          "In a real app, this would switch the user context to public servant mode.",
        )
        break

      case "mobile":
        alert(
          "Try resizing your browser window or opening this on a mobile device to see the responsive design.",
        )
        break
    }

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

          <h1 className='text-3xl font-bold text-gray-900 mb-4'>
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
                <h3 className='text-lg font-semibold'>{scenario.title}</h3>
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

        {/* Advanced Scenarios */}
        <div className='demo-card'>
          <h2 className='text-xl font-semibold mb-4'>Advanced Scenarios</h2>
          <div className='space-y-4'>
            <div className='border-l-4 border-blue-500 pl-4'>
              <h4 className='font-semibold'>URL Parameters</h4>
              <p className='text-gray-600 mb-2'>
                Test different URL parameters to control modal behavior:
              </p>
              <div className='space-x-2'>
                <Link
                  href='/?force-consent=true'
                  className='demo-button demo-button-primary text-sm'
                >
                  ?force-consent=true
                </Link>
                <Link
                  href='/?show-consent=true'
                  className='demo-button demo-button-primary text-sm'
                >
                  ?show-consent=true
                </Link>
              </div>
            </div>

            <div className='border-l-4 border-green-500 pl-4'>
              <h4 className='font-semibold'>Different Consent Subjects</h4>
              <p className='text-gray-600 mb-2'>
                See how different consent subjects are handled:
              </p>
              <div className='space-x-2'>
                <Link
                  href='/analytics'
                  className='demo-button demo-button-success text-sm'
                >
                  Analytics Consent
                </Link>
                <Link
                  href='/api-example'
                  className='demo-button demo-button-success text-sm'
                >
                  API Integration
                </Link>
              </div>
            </div>

            <div className='border-l-4 border-purple-500 pl-4'>
              <h4 className='font-semibold'>Edge Cases</h4>
              <p className='text-gray-600 mb-2'>
                Test edge cases and error scenarios:
              </p>
              <div className='space-x-2'>
                <button
                  type='button'
                  onClick={() => {
                    // Simulate network error
                    alert(
                      "This would simulate a network error during consent submission.",
                    )
                  }}
                  className='demo-button demo-button-danger text-sm'
                >
                  Network Error
                </button>
                <button
                  type='button'
                  onClick={() => {
                    // Simulate slow response
                    alert("This would simulate a slow API response.")
                  }}
                  className='demo-button demo-button-warning text-sm'
                >
                  Slow Response
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Testing Instructions */}
        <div className='demo-card mt-8 bg-blue-50 border-blue-200'>
          <h3 className='text-lg font-semibold text-blue-800 mb-3'>
            🧪 Testing Instructions
          </h3>
          <div className='text-blue-700 space-y-2'>
            <p>
              <strong>1.</strong> Open your browser's Developer Tools (F12) to
              see console logs
            </p>
            <p>
              <strong>2.</strong> Try different scenarios to see how the consent
              system responds
            </p>
            <p>
              <strong>3.</strong> Check the Network tab to see API calls being
              made
            </p>
            <p>
              <strong>4.</strong> Test on different screen sizes and devices
            </p>
            <p>
              <strong>5.</strong> Use keyboard navigation (Tab, Enter, Escape)
              to test accessibility
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
