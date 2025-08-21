import { type ConsentStatus, ConsentStatuses } from "@ogcio/consent/server"
import { type NextRequest, NextResponse } from "next/server"

// Demo storage type for simulating database
interface DemoConsentRecord {
  accept: boolean
  subject: string
  preferredLanguage: string
  versionId: string
  timestamp: string
}

interface DemoConsentStorage {
  [userKey: string]: DemoConsentRecord
}

declare global {
  var __demo_consent_storage: DemoConsentStorage | undefined
}

// This endpoint returns the current consent status for a user
// In a real application, this would be authenticated and fetch from your database

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const subject = searchParams.get("subject")
    const userId = searchParams.get("userId") // In real app, this would come from auth

    if (!subject) {
      return NextResponse.json(
        { message: "Subject is required" },
        { status: 400 },
      )
    }

    // Simulate database lookup
    await new Promise((resolve) => setTimeout(resolve, 300))

    // In a real application, you would query your database here
    // For demo purposes, we'll check if consent was stored in this session
    // In a real app, this would come from a database with proper user authentication

    // Get stored consent from global storage (simulating database)
    const globalConsent = globalThis.__demo_consent_storage || {}
    const userKey = `${subject}-${userId || "anonymous"}`
    const storedConsent = globalConsent[userKey]

    let consentStatus: ConsentStatus = ConsentStatuses.Undefined
    let userConsentVersion: string | undefined

    if (storedConsent) {
      consentStatus = storedConsent.accept
        ? ConsentStatuses.OptedIn
        : ConsentStatuses.OptedOut
      // Store version for both accept and decline to prevent modal reopening
      userConsentVersion = storedConsent.versionId
    } else {
      // Fallback to hardcoded statuses for other subjects
      const simulatedStatuses = {
        analytics: ConsentStatuses.OptedIn,
        marketing: ConsentStatuses.OptedOut,
        messaging: ConsentStatuses.Pending,
      }
      consentStatus =
        simulatedStatuses[subject as keyof typeof simulatedStatuses] ||
        ConsentStatuses.Undefined
      userConsentVersion =
        consentStatus === ConsentStatuses.OptedIn ? "v1.0.0" : undefined
    }

    return NextResponse.json({
      subject,
      consentStatus,
      userConsentVersion,
      lastUpdated: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Error fetching consent status:", error)
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    )
  }
}
