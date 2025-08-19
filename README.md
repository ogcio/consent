# @ogcio/consent

A reusable consent management package for Next.js applications. This package provides a comprehensive solution for handling user consent with a modern, accessible modal interface.

## Features

- 🎯 **Composable Design**: Highly configurable consent system that adapts to your application's needs
- 🌍 **Internationalization**: Built-in support for multiple languages (English and Irish)
- 📊 **Analytics Integration**: Easy integration with any analytics system
- 🔧 **Feature Flags**: Built-in feature flag support for gradual rollouts
- ♿ **Accessible**: WCAG compliant modal with keyboard navigation and screen reader support
- 📱 **Responsive**: Works seamlessly on desktop and mobile devices
- 🧪 **Tested**: Comprehensive test coverage with Vitest
- 📦 **TypeScript**: Full TypeScript support with comprehensive type definitions

## Installation

```bash
npm install @ogcio/consent
# or
yarn add @ogcio/consent
# or
pnpm add @ogcio/consent
```

## Peer Dependencies

This package requires the following peer dependencies:

```json
{
  "react": "^18.0.0",
  "react-dom": "^18.0.0",
  "next": "^14.0.0",
  "@govie-ds/react": "^1.0.0"
}
```

## Quick Start

### 1. Basic Setup

```tsx
import { ConsentProvider, createDefaultConsentConfig } from '@ogcio/consent'

function App() {
  const consentConfig = createDefaultConsentConfig({
    subject: 'my-app',
    content: {
      title: 'Welcome to My App',
      bodyParagraphs: [
        'We need your consent to provide you with the best experience.',
        'Please review our terms and conditions.',
      ],
      listItems: [
        'We will process your data securely',
        'You can withdraw consent at any time',
      ],
      footerText: 'By accepting, you agree to our <tc>Terms and Conditions</tc> and <pp>Privacy Policy</pp>.',
      buttons: {
        accept: 'Accept',
        decline: 'Decline',
      },
      success: {
        title: 'Consent Updated',
        message: 'Thank you for your consent.',
      },
      error: {
        title: 'Error',
        message: 'An error occurred. Please try again.',
      },
      links: {
        tc: 'https://example.com/terms',
        pp: 'https://example.com/privacy',
      },
      version: {
        id: 'v1.0.0',
        createdAt: new Date().toISOString(),
      },
    },
  })

  return (
    <ConsentProvider
      config={consentConfig}
      userContext={{
        isPublicServant: false,
        preferredLanguage: 'en',
      }}
      consentStatus="undefined"
    >
      <YourAppContent />
    </ConsentProvider>
  )
}
```

### 2. With API Integration

```tsx
import { ConsentProvider, createDefaultConsentConfig } from '@ogcio/consent'

function App() {
  const consentConfig = createDefaultConsentConfig({
    subject: 'my-app',
    content: consentContent,
  })

  // Override the API implementation
  consentConfig.api = (latestConsentVersion) => ({
    consentStatementId: latestConsentVersion,
    submitConsent: async ({ accept, subject, preferredLanguage, versionId }) => {
      // Your API call here
      const response = await fetch('/api/consent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accept, subject, preferredLanguage, versionId }),
      })
      
      if (!response.ok) {
        return { error: { detail: 'Failed to update consent' } }
      }
      
      return {}
    },
    setConsentToPending: async (subject) => {
      // Your API call here
      return {}
    },
  })

  return (
    <ConsentProvider
      config={consentConfig}
      userContext={userContext}
      consentStatus={consentStatus}
    >
      <YourAppContent />
    </ConsentProvider>
  )
}
```

### 3. With Analytics

```tsx
import { ConsentProvider, createAnalyticsTracker } from '@ogcio/consent'

function App() {
  const consentConfig = createDefaultConsentConfig({
    subject: 'my-app',
    content: consentContent,
  })

  // Add analytics tracking
  consentConfig.analyticsTracker = createAnalyticsTracker((event) => {
    // Your analytics tracking here
    analytics.track(event.event.name, {
      category: event.event.category,
      action: event.event.action,
      value: event.event.value,
    })
  })

  return (
    <ConsentProvider
      config={consentConfig}
      userContext={userContext}
      consentStatus={consentStatus}
    >
      <YourAppContent />
    </ConsentProvider>
  )
}
```

## API Reference

### Components

#### `ConsentProvider`

The main provider component that manages consent state and renders the consent modal.

```tsx
<ConsentProvider
  config={ConsentConfig}
  userContext={ConsentUserContext}
  consentStatus={ConsentStatus}
  userConsentVersion?: string
  events?: ConsentEvents
>
  {children}
</ConsentProvider>
```

#### `ConsentModal`

The consent modal component (automatically rendered by `ConsentProvider`).

### Hooks

#### `useConsent()`

Hook to access consent context within components.

```tsx
const { isConsentModalOpen, setIsConsentModalOpen, config, userContext, isOptedOut } = useConsent()
```

### Configuration

#### `ConsentConfig`

```tsx
interface ConsentConfig {
  subject: string
  content: ConsentStatementContent
  userContext: {
    getPreferredLanguage: (user: ConsentUserContext) => string
  }
  shouldShowModal: (params: ConsentModalVisibilityParams) => boolean
  api: (latestConsentVersion: string) => ConsentAPI
  analytics?: ConsentAnalytics
  analyticsTracker?: ConsentAnalyticsTracker
  featureFlags?: {
    isEnabled: () => boolean
  }
  onConsentSuccess?: {
    redirectTo?: string | ((accepted: boolean, preferredLanguage: string) => string)
    showToast?: boolean
  }
  forceModalParam?: string
}
```

### Utility Functions

#### `createDefaultConsentConfig()`

Creates a consent configuration with sensible defaults.

```tsx
const config = createDefaultConsentConfig({
  subject: 'my-app',
  content: consentContent,
  isConsentEnabled?: boolean,
  forceModalParam?: string,
  showToastOnSuccess?: boolean,
})
```

#### `createMessagingConsentConfig()`

Creates a messaging-specific consent configuration.

```tsx
const config = createMessagingConsentConfig({
  subject: 'messaging',
  content: consentContent,
  isConsentEnabled?: boolean,
})
```

#### `transformBackendResponse()`

Transforms backend API response to frontend content format.

```tsx
const content = await transformBackendResponse(backendData, 'en')
```

#### `createFallbackContent()`

Creates fallback content when API is unavailable.

```tsx
const content = createFallbackContent('en')
```

#### `createAnalyticsTracker()`

Creates an analytics tracker for consent events.

```tsx
const tracker = createAnalyticsTracker((event) => {
  // Your analytics tracking logic
})
```

### Types

#### `ConsentStatus`

```tsx
type ConsentStatus = 'pending' | 'undefined' | 'pre-approved' | 'opted-out' | 'opted-in'
```

#### `ConsentUserContext`

```tsx
interface ConsentUserContext {
  isPublicServant: boolean
  preferredLanguage: string
  [key: string]: unknown
}
```

#### `ConsentEvents`

```tsx
interface ConsentEvents {
  onConsentDecision?: (accepted: boolean) => void
  onConsentError?: (error: Error) => void
  onModalOpen?: () => void
  onModalClose?: () => void
  onScrollToBottom?: () => void
}
```

## Advanced Usage

### Custom Modal Visibility Logic

```tsx
const customConfig = createDefaultConsentConfig({
  subject: 'my-app',
  content: consentContent,
})

customConfig.shouldShowModal = ({
  userContext,
  consentStatus,
  searchParams,
  userConsentVersion,
  latestConsentVersion,
}) => {
  // Your custom logic here
  if (userContext.isAdmin) return false
  if (searchParams.get('skip-consent') === 'true') return false
  
  return !hasValidConsent || !hasValidVersion
}
```

### Custom Analytics Integration

```tsx
import { createAnalyticsTracker } from '@ogcio/consent'

const analyticsTracker = createAnalyticsTracker((event) => {
  // Google Analytics 4
  gtag('event', event.event.name, {
    event_category: event.event.category,
    event_action: event.event.action,
    value: event.event.value,
  })
  
  // Or Mixpanel
  mixpanel.track(event.event.name, {
    category: event.event.category,
    action: event.event.action,
    value: event.event.value,
  })
})
```

### Server-Side Integration

```tsx
// In your Next.js API route
import { transformBackendResponse } from '@ogcio/consent'

export async function GET(request: Request) {
  const backendData = await fetchConsentData()
  const content = await transformBackendResponse(backendData, 'en')
  
  return Response.json(content)
}
```

## Testing

The package includes comprehensive tests. To run them:

```bash
npm test
npm run test:coverage
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## License

MIT License - see LICENSE file for details.

## Support

For support and questions, please open an issue on GitHub or contact the OGCIO team.

