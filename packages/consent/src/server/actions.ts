"use server"

import { ConsentStatuses } from "@/constants"
import type {
  BuildingBlocksClients,
  ConsentResult,
  ConsentStatementContent,
  ConsentStatementLanguages,
  Logger,
} from "@/types"
import {
  createFallbackContent,
  transformBackendResponse,
} from "@/utils/transformers"

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
  const profile = await clients.profileClient.submitConsent({
    status: accept ? ConsentStatuses.OptedIn : ConsentStatuses.OptedOut,
    subject,
    consentStatementId,
  })

  if (profile?.error) {
    return { error: profile.error }
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
  const profile = await clients.profileClient.submitConsent({
    status: ConsentStatuses.Pending,
    subject,
    consentStatementId,
  })

  if (profile?.error) {
    return { error: profile.error }
  }

  return {}
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
export const getConsentStatementContent = async ({
  subject,
  locale = "en",
  isConsentEnabled = false,
  clients,
  fallbackContent,
}: {
  subject: string
  locale?: ConsentStatementLanguages
  isConsentEnabled?: boolean
  clients: BuildingBlocksClients
  fallbackContent?: ConsentStatementContent
}): Promise<ConsentStatementContent> => {
  if (!isConsentEnabled) {
    return fallbackContent || createFallbackContent(locale)
  }

  try {
    const response = await clients.profileClient.getLatestConsentStatement({
      subject,
    })
    if (response.error || !response.data) {
      return fallbackContent || createFallbackContent(locale)
    }
    // Use the transformation function to convert backend response to frontend format
    return await transformBackendResponse(response.data.data, locale)
  } catch (error) {
    console.error("Error fetching consent content:", error)
    // Return fallback content if API fails
    return fallbackContent || createFallbackContent(locale)
  }
}
