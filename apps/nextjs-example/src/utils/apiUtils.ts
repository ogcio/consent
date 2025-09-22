import type { ApiCall, ConsoleLog } from "@/components/types"

// Enhanced fetch wrapper that tracks API calls
export const makeApiCall = async (
  method: string,
  endpoint: string,
  body: unknown,
  trackApiCall: (
    method: string,
    endpoint: string,
    status: number,
    data: unknown,
    duration: number,
  ) => void,
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

// Create API call tracking function
export const createApiCallTracker = (
  setApiCalls: React.Dispatch<React.SetStateAction<ApiCall[]>>,
  addConsoleLog: (message: string, type?: "info" | "error" | "warning") => void,
  generateId: () => string, // Accept ID generator function
) => {
  return (
    method: string,
    endpoint: string,
    status: number,
    data: unknown,
    duration: number,
  ) => {
    const apiCall: ApiCall = {
      id: generateId(),
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
}

// Create console log function
export const createConsoleLogger = (
  setConsoleLogs: React.Dispatch<React.SetStateAction<ConsoleLog[]>>,
  generateId: () => string, // Accept ID generator function
) => {
  return (message: string, type: "info" | "error" | "warning" = "info") => {
    const log: ConsoleLog = {
      id: generateId(),
      message,
      type,
      timestamp: new Date().toISOString(),
    }
    setConsoleLogs((prev) => [log, ...prev.slice(0, 49)]) // Keep last 50 logs
    console.log(message) // Also log to browser console
  }
}

// Create a wrapper makeApiCall that uses the tracking function
export const createMakeApiCall = (
  trackApiCall: (
    method: string,
    endpoint: string,
    status: number,
    data: unknown,
    duration: number,
  ) => void,
) => {
  return async (
    method: string,
    endpoint: string,
    body?: unknown,
  ): Promise<Response> => {
    return makeApiCall(method, endpoint, body, trackApiCall)
  }
}
