import { type NextRequest, NextResponse } from "next/server"

interface ConsentResetRequest {
  subject: string
  userId?: string
}

// Demo storage type for simulating database
interface DemoConsentRecord {
  accept: boolean
  subject: string
  preferredLanguage: string
  consentStatementId: string
  timestamp: string
}

interface DemoConsentStorage {
  [userKey: string]: DemoConsentRecord
}

declare global {
  var __demo_consent_storage: DemoConsentStorage | undefined
}

// This endpoint resets/clears consent data for simulating new user experience
export async function POST(request: NextRequest) {
  try {
    const body: ConsentResetRequest = await request.json()
    const { subject, userId = "user-123" } = body

    // Simulate validation
    if (!subject) {
      return NextResponse.json(
        { message: "Subject is required" },
        { status: 400 },
      )
    }

    // Simulate processing time
    await new Promise((resolve) => setTimeout(resolve, 300))

    // Clear consent data from global storage
    const globalConsent = globalThis.__demo_consent_storage || {}
    const userKey = `${subject}-${userId}`

    // Remove the specific consent record
    delete globalConsent[userKey]

    globalThis.__demo_consent_storage = globalConsent

    console.log("Consent data cleared for new user simulation:", {
      subject,
      userId,
      userKey,
      timestamp: new Date().toISOString(),
    })

    return NextResponse.json({
      success: true,
      message: "Consent data cleared successfully",
      userKey,
    })
  } catch (error) {
    console.error("Error clearing consent data:", error)
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    )
  }
}
