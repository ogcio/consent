"use client"

import Link from "next/link"
import { useState } from "react"

interface ApiResponse {
  timestamp: string
  method: string
  endpoint: string
  status: number
  data: unknown
  duration: number
}

export default function ApiExamplePage() {
  const [apiCalls, setApiCalls] = useState<ApiResponse[]>([])
  const [isLoading, setIsLoading] = useState<string | null>(null)

  const makeApiCall = async (
    method: string,
    endpoint: string,
    body?: unknown,
  ) => {
    const callId = `${method}-${endpoint}-${Date.now()}`
    setIsLoading(callId)

    const startTime = Date.now()

    try {
      const response = await fetch(endpoint, {
        method,
        headers: body ? { "Content-Type": "application/json" } : {},
        body: body ? JSON.stringify(body) : undefined,
      })

      const data = await response.json()
      const duration = Date.now() - startTime

      const apiResponse: ApiResponse = {
        timestamp: new Date().toISOString(),
        method,
        endpoint,
        status: response.status,
        data,
        duration,
      }

      setApiCalls((prev) => [apiResponse, ...prev.slice(0, 9)]) // Keep last 10 calls
    } catch (error) {
      const duration = Date.now() - startTime
      const apiResponse: ApiResponse = {
        timestamp: new Date().toISOString(),
        method,
        endpoint,
        status: 0,
        data: {
          error: error instanceof Error ? error.message : "Network error",
        },
        duration,
      }

      setApiCalls((prev) => [apiResponse, ...prev.slice(0, 9)])
    } finally {
      setIsLoading(null)
    }
  }

  const getStatusColor = (status: number) => {
    if (status >= 200 && status < 300) return "text-green-600 bg-green-100"
    if (status >= 400 && status < 500) return "text-red-600 bg-red-100"
    if (status >= 500) return "text-red-600 bg-red-200"
    return "text-gray-600 bg-gray-100"
  }

  const clearCalls = () => {
    setApiCalls([])
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
            <span className='text-gray-700'>API Example</span>
          </nav>

          <h1 className='text-3xl! font-bold! text-gray-900 mb-4'>
            API Integration Examples
          </h1>
          <p className='text-lg text-gray-600'>
            Explore how the consent package integrates with backend APIs for
            storing and retrieving consent data.
          </p>
        </div>

        <div className='grid lg:grid-cols-2 gap-8'>
          {/* API Controls */}
          <div className='space-y-6'>
            {/* Consent Management APIs */}
            <div className='demo-card'>
              <h3 className='text-lg! font-semibold! mb-4'>
                Consent Management
              </h3>
              <div className='space-y-3 flex flex-col gap-2'>
                <button
                  type='button'
                  onClick={() =>
                    makeApiCall("POST", "/api/consent/submit", {
                      accept: true,
                      subject: "demo-app",
                      preferredLanguage: "en",
                      versionId: "v1.2.0",
                    })
                  }
                  disabled={isLoading !== null}
                  className='w-full demo-button demo-button-success'
                >
                  {isLoading === "POST-/api/consent/submit"
                    ? "Submitting..."
                    : "Submit Accept Consent"}
                </button>

                <button
                  type='button'
                  onClick={() =>
                    makeApiCall("POST", "/api/consent/submit", {
                      accept: false,
                      subject: "demo-app",
                      preferredLanguage: "en",
                      versionId: "v1.2.0",
                    })
                  }
                  disabled={isLoading !== null}
                  className='w-full demo-button demo-button-danger'
                >
                  {isLoading === "POST-/api/consent/submit"
                    ? "Submitting..."
                    : "Submit Decline Consent"}
                </button>

                <button
                  type='button'
                  onClick={() =>
                    makeApiCall("POST", "/api/consent/pending", {
                      subject: "demo-app",
                    })
                  }
                  disabled={isLoading !== null}
                  className='w-full demo-button demo-button-warning'
                >
                  {isLoading === "POST-/api/consent/pending"
                    ? "Setting..."
                    : "Set to Pending"}
                </button>
              </div>
            </div>

            {/* Status Retrieval APIs */}
            <div className='demo-card'>
              <h3 className='text-lg! font-semibold! mb-4'>Status Retrieval</h3>
              <div className='space-y-3 flex flex-col gap-2'>
                <button
                  type='button'
                  onClick={() =>
                    makeApiCall(
                      "GET",
                      "/api/consent/status?subject=demo-app&userId=user-123",
                    )
                  }
                  disabled={isLoading !== null}
                  className='w-full demo-button demo-button-primary'
                >
                  {isLoading === "GET-/api/consent/status"
                    ? "Fetching..."
                    : "Get Demo App Status"}
                </button>

                <button
                  type='button'
                  onClick={() =>
                    makeApiCall(
                      "GET",
                      "/api/consent/status?subject=analytics&userId=user-123",
                    )
                  }
                  disabled={isLoading !== null}
                  className='w-full demo-button demo-button-primary'
                >
                  {isLoading === "GET-/api/consent/status"
                    ? "Fetching..."
                    : "Get Analytics Status"}
                </button>

                <button
                  type='button'
                  onClick={() =>
                    makeApiCall(
                      "GET",
                      "/api/consent/status?subject=marketing&userId=user-123",
                    )
                  }
                  disabled={isLoading !== null}
                  className='w-full demo-button demo-button-primary'
                >
                  {isLoading === "GET-/api/consent/status"
                    ? "Fetching..."
                    : "Get Marketing Status"}
                </button>
              </div>
            </div>

            {/* Error Scenarios */}
            <div className='demo-card'>
              <h3 className='text-lg! font-semibold! mb-4'>Error Scenarios</h3>
              <div className='space-y-3 flex flex-col gap-2'>
                <button
                  type='button'
                  onClick={() =>
                    makeApiCall("POST", "/api/consent/submit", {
                      // Missing required fields
                      accept: true,
                    })
                  }
                  disabled={isLoading !== null}
                  className='w-full demo-button demo-button-secondary'
                >
                  {isLoading !== null ? "Testing..." : "Test Validation Error"}
                </button>

                <button
                  type='button'
                  onClick={() => makeApiCall("GET", "/api/consent/nonexistent")}
                  disabled={isLoading !== null}
                  className='w-full demo-button demo-button-secondary'
                >
                  {isLoading !== null ? "Testing..." : "Test 404 Error"}
                </button>

                <button
                  type='button'
                  onClick={clearCalls}
                  className='w-full demo-button demo-button-warning'
                >
                  Clear API Calls
                </button>
              </div>
            </div>
          </div>

          {/* API Call Log */}
          <div className='demo-card'>
            <div className='flex items-center justify-between mb-4'>
              <h3 className='text-lg! font-semibold!'>API Call Log</h3>
              <span className='text-sm text-gray-500'>
                {apiCalls.length} calls made
              </span>
            </div>

            {apiCalls.length === 0 ? (
              <div className='text-center py-8 text-gray-500'>
                <div className='text-4xl mb-2'>🔗</div>
                <p>No API calls made yet.</p>
                <p className='text-sm'>
                  Click the buttons on the left to test the APIs.
                </p>
              </div>
            ) : (
              <div className='space-y-3 max-h-96 overflow-y-auto'>
                {apiCalls.map((call) => (
                  <div
                    key={call.timestamp}
                    className='border border-gray-200 rounded-lg p-4 bg-white'
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

        {/* Integration Documentation */}
        <div className='demo-card mt-8'>
          <h3 className='text-lg! font-semibold! mb-4'>
            Integration Documentation
          </h3>

          <div className='grid gap-6'>
            <div>
              <h4 className='font-medium mb-3'>API Configuration</h4>
              <pre className='text-xs bg-gray-800 text-green-400 p-4 rounded overflow-x-auto'>
                {`// Configure API endpoints
config.api = (latestConsentVersion) => ({
  consentStatementId: latestConsentVersion,
  
  submitConsent: async (data) => {
    const response = await fetch('/api/consent/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    
    if (!response.ok) {
      const error = await response.json()
      return { error: { detail: error.message } }
    }
    
    return {}
  },
  
  setConsentToPending: async (subject) => {
    const response = await fetch('/api/consent/pending', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ subject }),
    })
    
    return response.ok ? {} : { error: { detail: 'Failed' } }
  },
})`}
              </pre>
            </div>

            <div>
              <h4 className='font-medium mb-3'>Backend Implementation</h4>
              <pre className='text-xs bg-gray-800 text-green-400 p-4 rounded overflow-x-auto'>
                {`// Example Next.js API route
export async function POST(request) {
  const { accept, subject, preferredLanguage, versionId } = 
    await request.json()
  
  // Validate request
  if (!subject || !preferredLanguage || !versionId) {
    return NextResponse.json(
      { message: 'Missing required fields' },
      { status: 400 }
    )
  }
  
  // Store in database
  await db.consent.create({
    userId: getCurrentUserId(),
    subject,
    accepted: accept,
    versionId,
    language: preferredLanguage,
    timestamp: new Date(),
  })
  
  return NextResponse.json({ success: true })
}`}
              </pre>
            </div>
          </div>

          <div className='mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg'>
            <h4 className='font-medium text-blue-800 mb-2'>
              💡 Integration Tips
            </h4>
            <ul className='text-sm text-blue-700 space-y-1'>
              <li>• Always validate incoming data on your backend</li>
              <li>
                • Store consent decisions with timestamps for audit trails
              </li>
              <li>• Implement proper error handling and user feedback</li>
              <li>• Consider rate limiting to prevent abuse</li>
              <li>• Use proper authentication to ensure user identity</li>
              <li>• Log consent changes for compliance purposes</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
