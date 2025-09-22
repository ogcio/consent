"use client"

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
import { useId, useRef, useState } from "react"
import { ApiCallsCard } from "@/components/ApiCallsCard"
import { ConsoleLogsCard } from "@/components/ConsoleLogsCard"
import type { ApiCall, ConsoleLog } from "@/components/types"
import {
  createApiCallTracker,
  createConsoleLogger,
  createMakeApiCall,
} from "@/utils/apiUtils"

export default function ApiExamplePage() {
  const [apiCalls, setApiCalls] = useState<ApiCall[]>([])
  const [isLoading, setIsLoading] = useState<string | null>(null)
  const [consoleLogs, setConsoleLogs] = useState<ConsoleLog[]>([])

  // Generate unique IDs using React's useId hook
  const baseId = useId()
  const idCounterRef = useRef(0)
  const generateId = () => `${baseId}-${++idCounterRef.current}`

  const clearLogs = () => {
    setConsoleLogs([])
  }

  // Function to trigger consent status refresh in layout banner
  const triggerConsentStatusRefresh = () => {
    // Dispatch event to notify layout components to refresh their consent status
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("consentChanged"))
      addConsoleLog("🔄 Consent status refresh event dispatched")
    }
  }

  // Console log function using utility
  const addConsoleLog = createConsoleLogger(setConsoleLogs, generateId)

  // API call tracking using utilities
  const trackApiCall = createApiCallTracker(
    setApiCalls,
    addConsoleLog,
    generateId,
  )
  const utilMakeApiCall = createMakeApiCall(trackApiCall)

  const makeApiCall = async (
    method: string,
    endpoint: string,
    body?: unknown,
  ) => {
    const callId = `${method}-${endpoint}-${generateId()}`
    setIsLoading(callId)

    try {
      const response = await utilMakeApiCall(method, endpoint, body)

      // If this was a consent submission or pending request, trigger status refresh in layout banner
      if (
        (endpoint === "/api/consent/submit" ||
          endpoint === "/api/consent/pending") &&
        response.ok
      ) {
        addConsoleLog(`✅ ${endpoint} API call successful`)
        setTimeout(() => triggerConsentStatusRefresh(), 500) // Small delay to ensure API has processed
      } else if (
        endpoint === "/api/consent/submit" ||
        endpoint === "/api/consent/pending"
      ) {
        addConsoleLog(`❌ ${endpoint} API call failed`, "error")
      }
    } catch {
      // Error already handled by utility function
    } finally {
      setIsLoading(null)
    }
  }

  const clearCalls = () => {
    setApiCalls([])
  }

  return (
    <Stack gap={8}>
      <Paragraph>
        Explore how the consent package integrates with backend APIs for storing
        and retrieving consent data.
      </Paragraph>

      <div className='grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8'>
        {/* Consent Management APIs */}
        <Card type='horizontal'>
          <CardContainer>
            <CardHeader>
              <CardTitle>Consent Management</CardTitle>
              <Paragraph size='sm'>
                Explore how the consent package integrates with backend APIs for
                storing and retrieving consent data.
              </Paragraph>
            </CardHeader>
            <CardAction>
              <Stack gap={2}>
                <Button
                  variant='secondary'
                  type='button'
                  onClick={() =>
                    makeApiCall("POST", "/api/consent/submit", {
                      accept: true,
                      subject: "demo-app",
                      preferredLanguage: "en",
                      consentStatementId:
                        "550e8400-e29b-41d4-a716-446655440001",
                    })
                  }
                  disabled={isLoading !== null}
                  className='w-full gi-justify-center'
                >
                  {isLoading === "POST-/api/consent/submit"
                    ? "Submitting..."
                    : "Submit Accept Consent"}
                </Button>

                <Button
                  variant='secondary'
                  type='button'
                  onClick={() =>
                    makeApiCall("POST", "/api/consent/submit", {
                      accept: false,
                      subject: "demo-app",
                      preferredLanguage: "en",
                      consentStatementId:
                        "550e8400-e29b-41d4-a716-446655440001",
                    })
                  }
                  disabled={isLoading !== null}
                  className='w-full gi-justify-center'
                >
                  {isLoading === "POST-/api/consent/submit"
                    ? "Submitting..."
                    : "Submit Decline Consent"}
                </Button>

                <Button
                  variant='secondary'
                  type='button'
                  onClick={() =>
                    makeApiCall("POST", "/api/consent/pending", {
                      subject: "demo-app",
                      userId: "user-123",
                    })
                  }
                  disabled={isLoading !== null}
                  className='w-full gi-justify-center'
                >
                  {isLoading === "POST-/api/consent/pending"
                    ? "Setting..."
                    : "Set to Pending"}
                </Button>
              </Stack>
            </CardAction>
          </CardContainer>
        </Card>

        {/* Status Retrieval APIs */}
        <Card type='horizontal'>
          <CardContainer>
            <CardHeader>
              <CardTitle>Status Retrieval</CardTitle>
              <Paragraph size='sm'>
                Explore how the consent package integrates with backend APIs for
                storing and retrieving consent data.
              </Paragraph>
            </CardHeader>
            <CardAction>
              <Stack gap={2}>
                <Button
                  type='button'
                  variant='secondary'
                  onClick={() =>
                    makeApiCall(
                      "GET",
                      "/api/consent/status?subject=demo-app&userId=user-123",
                    )
                  }
                  disabled={isLoading !== null}
                  className='w-full gi-justify-center'
                >
                  {isLoading === "GET-/api/consent/status"
                    ? "Fetching..."
                    : "Get Demo App Status"}
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
                  disabled={isLoading !== null}
                  className='w-full gi-justify-center'
                >
                  {isLoading === "GET-/api/consent/status"
                    ? "Fetching..."
                    : "Get Analytics Status"}
                </Button>

                <Button
                  type='button'
                  variant='secondary'
                  onClick={() =>
                    makeApiCall(
                      "GET",
                      "/api/consent/status?subject=marketing&userId=user-123",
                    )
                  }
                  disabled={isLoading !== null}
                  className='w-full gi-justify-center'
                >
                  {isLoading === "GET-/api/consent/status"
                    ? "Fetching..."
                    : "Get Marketing Status"}
                </Button>
              </Stack>
            </CardAction>
          </CardContainer>
        </Card>

        {/* Error Scenarios */}
        <Card type='horizontal'>
          <CardContainer>
            <CardHeader>
              <CardTitle>Error Scenarios</CardTitle>
              <Paragraph size='sm'>
                Explore how the consent package integrates with backend APIs for
                storing and retrieving consent data.
              </Paragraph>
            </CardHeader>
            <CardAction>
              <Stack gap={2}>
                <Button
                  variant='secondary'
                  type='button'
                  onClick={() =>
                    makeApiCall("POST", "/api/consent/submit", {
                      // Missing required fields
                      accept: true,
                    })
                  }
                  disabled={isLoading !== null}
                  className='w-full gi-justify-center'
                >
                  {isLoading !== null ? "Testing..." : "Test Validation Error"}
                </Button>

                <Button
                  variant='secondary'
                  type='button'
                  onClick={() => makeApiCall("GET", "/api/consent/nonexistent")}
                  disabled={isLoading !== null}
                  className='w-full gi-justify-center'
                >
                  {isLoading !== null ? "Testing..." : "Test 404 Error"}
                </Button>
              </Stack>
            </CardAction>
          </CardContainer>
        </Card>
      </div>

      <Stack gap={8}>
        <ConsoleLogsCard logs={consoleLogs} onClearLogs={clearLogs} />

        <ApiCallsCard apiCalls={apiCalls} onClearApiCalls={clearCalls} />
      </Stack>

      {/* Integration Documentation */}
      {/* <div className='demo-card mt-8'>
        <h3>Integration Documentation</h3>

        <div className='grid gap-6'>
          <div>
            <h4 className='font-medium mb-3'>API Configuration</h4>
            <pre className='text-xs! bg-gray-800 text-green-400 p-4 rounded overflow-x-auto'>
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
            <pre className='text-xs! bg-gray-800 text-green-400 p-4 rounded overflow-x-auto'>
              {`// Example Next.js API route
export async function POST(request) {
  const { accept, subject, preferredLanguage, consentStatementId } = 
    await request.json()
  
  // Validate request
  if (!subject || !preferredLanguage || !consentStatementId) {
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
    consentStatementId,
    language: preferredLanguage,
    timestamp: new Date(),
  })
  
  return NextResponse.json({ success: true })
}`}
            </pre>
          </div>
        </div>
      </div> */}
    </Stack>
  )
}
