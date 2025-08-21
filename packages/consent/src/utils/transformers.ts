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
    version: {
      id: data.id,
      createdAt: data.createdAt,
      description: `Version ${data.version}`,
    },
    title: translation.title || "Consent Required",
    bodyParagraphs: translation.bodyTop || [],
    listItems: translation.bodyList || [],
    bodyBottom: translation.bodyBottom || [],
    infoAlert:
      translation.bodySmall && translation.bodySmall.length > 0
        ? {
            title: "Important information",
            items: translation.bodySmall,
          }
        : undefined,
    footerText:
      translation.bodyFooter ||
      "Please read our terms and conditions and privacy policy.",
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
    links: translation.bodyLinks || {},
  }
}

/**
 * Create fallback content when API is unavailable
 */
export function createFallbackContent(
  locale: ConsentStatementLanguages = "en",
): ConsentStatementContent {
  const fallbackContent = {
    en: {
      title: "Welcome to Our Service",
      bodyParagraphs: [
        "This service provides you with secure access to important information and communications.",
        "Before you start using this service, we need your consent for the following:",
      ],
      listItems: [
        "To allow us to send you important communications where required or permitted",
        "To notify you of new messages and updates through this service",
      ],
      footerText:
        "Please read our <tc>Terms and Conditions</tc> and <pp>Privacy Notice</pp>.",
    },
    ga: {
      title: "Fáilte go dtí ár Seirbhís",
      bodyParagraphs: [
        "Soláthraíonn an tseirbhís seo rochtain shlán ar eolas tábhachtach agus cumarsáid.",
        "Sula dtosaíonn tú ag úsáid na seirbhíse seo, teastaíonn do thoil chun leanúint ar aghaidh:",
      ],
      listItems: [
        "Ligean dúinn cumarsáidí tábhachtacha a sheoladh chugat nuair is gá nó ceadaithe",
        "Cuirfimid in iúl duit faoi theachtaireachtaí nua agus nuashonruithe tríd an tseirbhís seo",
      ],
      footerText:
        "Léigh ár <tc>Téarmaí agus Coinníollacha</tc> agus <pp>Fógra Príobháideachta</pp>.",
    },
  }

  const content = fallbackContent[locale] || fallbackContent.en

  return {
    version: {
      id: "fallback",
      createdAt: new Date().toISOString(),
      description: "Fallback content",
    },
    title: content.title,
    bodyParagraphs: content.bodyParagraphs,
    listItems: content.listItems,
    footerText: content.footerText,
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
    links: {
      tc: "#",
      pp: "#",
    },
  }
}
