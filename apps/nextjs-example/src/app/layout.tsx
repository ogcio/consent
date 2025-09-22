import "./globals.css"
import {
  Container,
  Footer,
  Header,
  Link,
  Stack,
  ToastProvider,
} from "@ogcio/design-system-react"
import type { Metadata } from "next"
import { ConsentWrapper } from "@/components/ConsentWrapper"
import LayoutConsentStatus from "@/components/LayoutConsentStatus"
import "@ogcio/theme-govie/theme.css"
import "@ogcio/design-system-react/styles.css"

export const metadata: Metadata = {
  title: "@ogcio/consent - Next.js Example",
  description:
    "A comprehensive example showcasing the @ogcio/consent package in a Next.js application",
  keywords: ["consent", "gdpr", "privacy", "nextjs", "react", "ogcio"],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang='en'>
      <body>
        <div
          className='gi-flex gi-flex-col mb-12'
          style={{ minHeight: "100vh" }}
        >
          <ToastProvider />
          <Header
            title='@ogcio/consent'
            showTitleOnMobile={true}
            logo={{
              href: "/",
              imageLarge:
                "https://raw.githubusercontent.com/ogcio/govie-ds/refs/heads/main/assets/logos/gov.ie/harp-gold-text-white.svg",
            }}
            secondaryLinks={[
              {
                href: "https://github.com/ogcio/consent",
                label: "Github",
              },
            ]}
            items={[
              {
                href: "/scenarios",
                label: "Scenarios",
                itemType: "link",
                showItemMode: "desktop-only",
              },
              {
                href: "/analytics",
                label: "Analytics",
                itemType: "link",
                showItemMode: "desktop-only",
              },
              {
                href: "/api-example",
                label: "API",
                itemType: "link",
                showItemMode: "desktop-only",
              },
            ]}
            addDefaultMobileMenu={true}
          ></Header>
          <Container>
            <ConsentWrapper>
              <Stack gap={4} className='gi-mt-8'>
                <LayoutConsentStatus />
                {children}
              </Stack>
            </ConsentWrapper>
          </Container>
        </div>
        <Footer
          utilitySlot={
            <Stack
              direction={{ base: "column", md: "row", xs: "column" }}
              gap={4}
              itemsDistribution='center'
            >
              <Link aria-label='Privacy Policy' href='/privacy-policy' noColor>
                Privacy Policy
              </Link>
              <Link aria-label='Accessibility' href='/accessibility' noColor>
                Accessibility
              </Link>
              <div className='gi-text-sm'>© 2025 Government of Ireland.</div>
            </Stack>
          }
        />
      </body>
    </html>
  )
}
