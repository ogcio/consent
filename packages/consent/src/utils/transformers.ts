import type {
  ConsentStatementContent,
  ConsentStatementData,
  ConsentStatementLanguages,
} from "@/types"

/**
 * UI text translations for different locales
 */
const UI_TRANSLATIONS = {
  en: {
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
  },
  ga: {
    buttons: {
      accept: "Glac leis",
      decline: "Diúltaigh",
    },
    success: {
      title: "Toiliú Nuashonraithe",
      message: "Cuireadh do roghanna toilithe in iúl go rathúil.",
    },
    error: {
      title: "Earráid",
      message:
        "Tharla earráid agus do thoiliú á nuashonrú. Bain triail eile as le do thoil.",
    },
  },
} as const

/**
 * Get UI text translations for a specific locale
 */
function getUITexts(locale: ConsentStatementLanguages) {
  return UI_TRANSLATIONS[locale] || UI_TRANSLATIONS.en
}

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

  // Get localized UI text
  const uiTexts = getUITexts(locale)

  return {
    id: data.id,
    version: data.version,
    publishDate: data.publishDate,
    isEnabled: data.isEnabled,
    title: translation.title,
    description: translation.description,
    disclaimer: translation.disclaimer,
    buttons: {
      accept: uiTexts.buttons.accept,
      decline: uiTexts.buttons.decline,
    },
    success: {
      title: uiTexts.success.title,
      message: uiTexts.success.message,
    },
    error: {
      title: uiTexts.error.title,
      message: uiTexts.error.message,
    },
  }
}
