"use client"

import {
  Button,
  Card,
  CardAction,
  CardContainer,
  CardHeader,
  CardTitle,
  Heading,
  Link,
  Paragraph,
} from "@ogcio/design-system-react"
import { useConsent } from "@ogcio/consent"

export default function HomePage() {
  const { setIsConsentModalOpen } = useConsent()

  return (
    <>
      <Paragraph>
        A reusable consent management package for Next.js applications
      </Paragraph>

      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-12'>
        <Card type='horizontal'>
          <CardContainer>
            <CardHeader>
              <CardTitle>
                <Heading level={3} size='sm'>
                  Smart Modal Logic
                </Heading>
              </CardTitle>
              <Paragraph size='sm'>
                The consent modal appears automatically based on user status,
                consent version, and custom rules.
              </Paragraph>
            </CardHeader>
            <CardAction>
              <Button
                type='button'
                variant='secondary'
                onClick={() => setIsConsentModalOpen(true)}
                className='gi-w-full gi-justify-center'
              >
                Force Show Modal
              </Button>
            </CardAction>
          </CardContainer>
        </Card>

        <Card type='horizontal'>
          <CardContainer>
            <CardHeader>
              <CardTitle>
                <Heading level={3} size='sm'>
                  Analytics Integration
                </Heading>
              </CardTitle>
              <Paragraph size='sm'>
                Track user consent decisions and modal interactions with
                built-in analytics support.
              </Paragraph>
            </CardHeader>

            <CardAction>
              <Link
                href='/analytics'
                asButton={{
                  variant: "secondary",
                  appearance: "default",
                }}
                className='gi-w-full gi-justify-center'
              >
                View Analytics
              </Link>
            </CardAction>
          </CardContainer>
        </Card>

        <Card type='horizontal'>
          <CardContainer>
            <CardHeader>
              <CardTitle>
                <Heading level={3} size='sm'>
                  Multiple Scenarios
                </Heading>
              </CardTitle>
              <Paragraph size='sm'>
                Explore different consent scenarios and configurations in
                action.
              </Paragraph>
            </CardHeader>
            <CardAction>
              <Link
                href='/scenarios'
                asButton={{
                  variant: "secondary",
                }}
                className='gi-w-full gi-justify-center'
              >
                View Scenarios
              </Link>
            </CardAction>
          </CardContainer>
        </Card>

        <Card type='horizontal'>
          <CardContainer>
            <CardHeader>
              <CardTitle>
                <Heading level={3} size='sm'>
                  API Integration
                </Heading>
              </CardTitle>
              <Paragraph size='sm'>
                See how to integrate with your backend API for consent storage
                and retrieval.
              </Paragraph>
            </CardHeader>
            <CardAction>
              <Link
                asButton={{
                  variant: "secondary",
                }}
                href='/api-example'
                className='gi-w-full gi-justify-center'
              >
                API Examples
              </Link>
            </CardAction>
          </CardContainer>
        </Card>

        <Card type='horizontal'>
          <CardContainer>
            <CardHeader>
              <CardTitle>
                <Heading level={3} size='sm'>
                  Multi-language
                </Heading>
              </CardTitle>
              <Paragraph size='sm'>
                Built-in support for internationalization with English and Irish
                languages.
              </Paragraph>
            </CardHeader>
            <CardAction>
              <Link
                href='/i18n'
                asButton={{
                  variant: "secondary",
                }}
                className='gi-w-full gi-justify-center'
              >
                Language Demo
              </Link>
            </CardAction>
          </CardContainer>
        </Card>
      </div>
    </>
  )
}
