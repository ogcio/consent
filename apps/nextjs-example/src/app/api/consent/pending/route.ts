import { type NextRequest, NextResponse } from "next/server"

interface ConsentPendingRequest {
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

// This endpoint sets a user's consent status to pending
// Useful when you need to force re-consent (e.g., after terms update)

export async function POST(request: NextRequest) {
  try {
    const body: ConsentPendingRequest = await request.json()
    const { subject, userId } = body

    // Simulate validation
    if (!subject) {
      return NextResponse.json(
        { message: "Subject is required" },
        { status: 400 },
      )
    }

    // Simulate processing time
    await new Promise((resolve) => setTimeout(resolve, 500))

    // Clear stored consent to make status return to pending/undefined
    // This simulates invalidating consent when terms are updated
    const globalConsent = globalThis.__demo_consent_storage || {}
    const userKey = `${subject}-${userId || "anonymous"}`

    // Remove the stored consent record to force re-consent
    if (globalConsent[userKey]) {
      delete globalConsent[userKey]
      console.log("Consent record cleared for pending status:", {
        userKey,
        subject,
        timestamp: new Date().toISOString(),
      })
    } else {
      console.log(
        "No existing consent record found, status will be undefined:",
        {
          userKey,
          subject,
          timestamp: new Date().toISOString(),
        },
      )
    }

    // Update global storage
    globalThis.__demo_consent_storage = globalConsent

    return NextResponse.json({
      success: true,
      message: "Consent status set to pending - user will need to re-consent",
    })
  } catch (error) {
    console.error("Error setting consent to pending:", error)
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    )
  }
}
