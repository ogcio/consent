"use server"

import { ConsentStatuses } from "@/constants"
import type {
  BuildingBlocksClients,
  BuildingBlocksConsentResponse,
  BuildingBlocksConsentStatementResponse,
  BuildingBlocksConsentsListResponse,
  BuildingBlocksError,
  ConsentResult,
  ConsentStatementContent,
  ConsentStatementLanguages,
  Logger,
  StandardError,
} from "@/types"
import { transformBackendResponse } from "@/utils/transformers"

/**
 * Helper function to normalize Building Blocks SDK errors to standard format
 */
const normalizeError = (
  error: BuildingBlocksError,
  subject?: string,
): StandardError => {
  // Handle the errors array case
  if ("errors" in error) {
    const subjectErrors = error.errors
      .filter((err) => err.subject === subject)
      .flatMap((err) => err.errors)

    if (subjectErrors.length > 0) {
      return { error: { detail: subjectErrors.join(", ") } }
    }

    // Fallback to all errors if no subject match
    const allErrors = error.errors.flatMap((err) => err.errors)
    return { error: { detail: allErrors.join(", ") } }
  }

  // Handle the detail case
  if ("detail" in error) {
    return { error: { detail: error.detail } }
  }

  // Fallback
  return { error: { detail: "Unknown error" } }
}

/**
 * Generic server action to submit consent
 */
export const submitConsent = async ({
  accept,
  subject,
  consentStatementId,
  clients,
  onSuccess,
}: {
  accept: boolean
  subject: string
  consentStatementId: string
  clients: BuildingBlocksClients
  onSuccess?: (accepted: boolean) => void | Promise<void>
}): Promise<ConsentResult> => {
  const response = await clients.profileClient.submitConsent({
    consents: [
      {
        subject,
        status: accept ? ConsentStatuses.OptedIn : ConsentStatuses.OptedOut,
        consentStatementId,
      },
    ],
  })

  if (response?.error) {
    return normalizeError(response.error, subject)
  }

  // Call the optional success callback
  if (onSuccess) {
    await onSuccess(accept)
  }

  return {}
}

/**
 * Generic server action to set consent status to pending
 */
export const setConsentToPending = async ({
  subject,
  consentStatementId,
  clients,
}: {
  subject: string
  consentStatementId: string
  clients: BuildingBlocksClients
}): Promise<ConsentResult> => {
  const response = await clients.profileClient.submitConsent({
    consents: [
      {
        subject,
        status: ConsentStatuses.Pending,
        consentStatementId,
      },
    ],
  })

  if (response?.error) {
    return normalizeError(response.error, subject)
  }

  return {}
}

/**
 * Generic server action to get the latest consent for a subject
 */
export const getLatestConsent = async ({
  subject,
  clients,
}: {
  subject: string
  clients: BuildingBlocksClients
}): Promise<StandardError | { data: BuildingBlocksConsentResponse }> => {
  const response = await clients.profileClient.getLatestConsent({
    subject,
  })

  if (response.error) {
    return normalizeError(response.error, subject)
  }

  return { data: response.data as BuildingBlocksConsentResponse }
}

/**
 * Generic server action to list consents for a subject
 */
export const listConsents = async ({
  subject,
  clients,
}: {
  subject?: string
  clients: BuildingBlocksClients
}): Promise<StandardError | { data: BuildingBlocksConsentsListResponse }> => {
  const response = await clients.profileClient.listConsents({
    subject: subject || "",
  })

  if (response.error) {
    return normalizeError(response.error, subject)
  }

  return { data: response.data as BuildingBlocksConsentsListResponse }
}

/**
 * Generic server action to get a specific consent statement by ID
 */
export const getConsentStatement = async ({
  id,
  clients,
}: {
  id: string
  clients: BuildingBlocksClients
}): Promise<
  StandardError | { data: BuildingBlocksConsentStatementResponse }
> => {
  const response = await clients.profileClient.getConsentStatement(id)

  if (response.error) {
    return normalizeError(response.error)
  }

  return {
    data: response.data as unknown as BuildingBlocksConsentStatementResponse,
  }
}

/**
 * Generic server action to check if consent is enabled via feature flag
 */
export const getIsConsentEnabled = async ({
  userId,
  flagName,
  clients,
  logger,
}: {
  userId: string
  flagName: string
  clients: BuildingBlocksClients
  logger?: Logger
}): Promise<boolean> => {
  let isConsentEnabled = false
  try {
    isConsentEnabled = await clients.featureFlagsClient.isFlagEnabled(
      flagName,
      {
        userId,
      },
    )
  } catch (error) {
    if (logger) {
      logger.error(
        {
          error,
        },
        `Error fetching feature flag: ${error}`,
      )
    }
  }

  return isConsentEnabled
}

/**
 * Generic server action to fetch consent content from the API
 */
export const getCurrentConsentStatement = async ({
  subject,
  locale = "en",
  clients,
}: {
  subject: string
  locale?: ConsentStatementLanguages
  clients: BuildingBlocksClients
}): Promise<ConsentStatementContent> => {
  try {
    const response = await clients.profileClient.getCurrentConsentStatement({
      subject,
    })
    if (
      response.error ||
      !response.data ||
      !Array.isArray(response.data) ||
      response.data.length === 0
    ) {
      throw new Error("Invalid consent statement response")
    }

    return await transformBackendResponse(response.data[0], locale)
  } catch (error) {
    console.error("Error fetching consent content:", error)
    throw new Error("Error fetching consent content")
  }
}
