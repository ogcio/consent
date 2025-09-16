import type {
  ConsentStatementContent,
  ConsentStatementData,
  ConsentStatementLanguages,
} from "@/types"

/**
 * Transform backend API response to frontend content structure
 */
export async function transformBackendResponse(
  data: ConsentStatementData,
  locale: ConsentStatementLanguages = "en",
): Promise<ConsentStatementContent> {
  const translation = data.translations[locale]

  if (!translation) {
    throw new Error(`Translation not found for locale: ${locale}`)
  }

  return {
    id: data.id,
    version: data.version,
    publishDate: data.publishDate,
    isEnabled: data.isEnabled,
    title: translation.title,
    description: translation.description,
    disclaimer: translation.disclaimer,
    buttons: {
      accept: "Accept",
      decline: "Decline",
    },
    success: {
      title: "Consent Updated",
      message: "Your consent preferences have been updated successfully.",
    },
    error: {
      title: "Error",
      message:
        "An error occurred while updating your consent. Please try again.",
    },
  }
}
