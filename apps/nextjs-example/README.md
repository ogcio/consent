# @ogcio/consent - Next.js Example Application

A comprehensive example application showcasing the `@ogcio/consent` package in a real-world Next.js application.

## 🚀 Quick Start

### Prerequisites

- Node.js 20.0.0 or higher
- pnpm (recommended) or npm/yarn

### Installation

1. **Navigate to the example directory:**
   ```bash
   cd examples/nextjs-app
   ```

2. **Install dependencies:**
   ```bash
   pnpm install
   # or
   npm install
   ```

3. **Start the development server:**
   ```bash
   pnpm dev
   # or
   npm run dev
   ```

4. **Open your browser:**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
examples/nextjs-app/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/               # API routes for consent management
│   │   │   └── consent/
│   │   │       ├── submit/    # Submit consent decision
│   │   │       ├── pending/   # Set consent to pending
│   │   │       └── status/    # Get consent status
│   │   ├── analytics/         # Analytics integration example
│   │   ├── api-example/       # API integration demonstration
│   │   ├── scenarios/         # Different consent scenarios
│   │   ├── layout.tsx         # Root layout with ConsentProvider
│   │   ├── page.tsx          # Homepage
│   │   └── globals.css       # Global styles
│   ├── components/
│   │   └── ConsentWrapper.tsx # Consent provider wrapper
│   └── lib/
│       └── consent.ts         # Consent configuration and utilities
├── package.json
├── next.config.js
├── tsconfig.json
└── README.md
```

## 🎯 Features Demonstrated

### 1. **Basic Consent Integration**
- ConsentProvider setup with custom configuration
- Modal display logic based on user status
- Custom event handlers for consent decisions

### 2. **API Integration**
- Backend API routes for consent storage
- Error handling and validation
- Real-time status updates

### 3. **Analytics Integration**
- Custom analytics tracker implementation
- Event tracking for consent decisions
- Integration examples for popular analytics services

### 4. **Multiple Consent Scenarios**
- New user experience
- Version updates requiring re-consent
- Public servant vs. regular user handling
- Opted-out user experience

### 5. **Responsive Design**
- Mobile-friendly consent modal
- Accessible keyboard navigation
- WCAG compliant implementation

## 🔧 Configuration Examples

### Basic Setup

```tsx
import { ConsentProvider, createDefaultConsentConfig } from '@ogcio/consent'

const config = createDefaultConsentConfig({
  subject: 'demo-app',
  content: consentContent,
  isConsentEnabled: true,
  showToastOnSuccess: true,
})

// Custom API integration
config.api = (latestConsentVersion) => ({
  consentStatementId: latestConsentVersion,
  submitConsent: async (data) => {
    const response = await fetch('/api/consent/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    return response.ok ? {} : { error: { detail: 'Failed' } }
  },
  setConsentToPending: async (subject) => {
    // Implementation
  },
})
```

### Analytics Integration

```tsx
import { createAnalyticsTracker } from '@ogcio/consent'

config.analyticsTracker = createAnalyticsTracker((event) => {
  // Google Analytics 4
  gtag('event', event.event.name, {
    event_category: event.event.category,
    event_action: event.event.action,
    value: event.event.value,
  })
})
```

## 🧪 Testing Different Scenarios

### URL Parameters
- `/?force-consent=1` - Force show consent modal

### API Testing
Visit `/api-example` to test:
- Consent submission (accept/decline)
- Setting consent to pending
- Fetching consent status
- Error handling

### Analytics Testing
Visit `/analytics` to test:
- Analytics consent flow
- Event tracking
- Custom event generation

## 📊 API Endpoints

### POST `/api/consent/submit`
Submit user's consent decision.

**Request Body:**
```json
{
  "accept": true,
  "subject": "demo-app",
  "preferredLanguage": "en",
  "versionId": "v1.2.0"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Consent decision recorded successfully"
}
```

### POST `/api/consent/pending`
Set user's consent status to pending.

**Request Body:**
```json
{
  "subject": "demo-app"
}
```

### GET `/api/consent/status`
Get user's current consent status.

**Query Parameters:**
- `subject` - Consent subject (required)
- `userId` - User ID (required)

**Response:**
```json
{
  "subject": "demo-app",
  "consentStatus": "opted-in",
  "userConsentVersion": "v1.2.0",
  "lastUpdated": "2024-01-15T10:00:00Z"
}
```

## 🎨 Customization

### Custom Consent Content

```tsx
export const customConsentContent: ConsentStatementContent = {
  title: 'Your Custom Title',
  bodyParagraphs: [
    'Custom description...',
  ],
  listItems: [
    'Custom consent item 1',
    'Custom consent item 2',
  ],
  footerText: 'Custom footer with <tc>Terms</tc> and <pp>Privacy</pp>.',
  buttons: {
    accept: 'Accept All',
    decline: 'Decline',
  },
  success: {
    title: 'Success!',
    message: 'Thank you for your consent.',
  },
  error: {
    title: 'Error',
    message: 'Something went wrong.',
  },
  links: {
    tc: '/terms',
    pp: '/privacy',
  },
  version: {
    id: 'v1.0.0',
    createdAt: new Date().toISOString(),
  },
}
```

### Custom Event Handlers

```tsx
const events = {
  onConsentDecision: (accepted: boolean) => {
    console.log(`User ${accepted ? 'accepted' : 'declined'} consent`)
    // Custom logic here
  },
  onConsentError: (error: Error) => {
    console.error('Consent error:', error)
    // Error handling logic
  },
  onModalOpen: () => {
    // Track modal open event
  },
  onModalClose: () => {
    // Track modal close event
  },
  onScrollToBottom: () => {
    // Track when user scrolls to bottom
  },
}
```

## 🚨 Error Handling

The example demonstrates comprehensive error handling:

1. **Network Errors**: API call failures
2. **Validation Errors**: Missing required fields
3. **Server Errors**: Backend processing issues
4. **User Feedback**: Toast notifications and error states

## ♿ Accessibility Features

- **Keyboard Navigation**: Full keyboard support
- **Screen Reader Support**: Proper ARIA labels
- **Focus Management**: Modal focus trapping
- **High Contrast**: Supports system color schemes
- **Reduced Motion**: Respects user preferences

## 🔍 Debugging

### Console Logs
The example logs detailed information to help you understand the flow:
- Consent decisions
- API calls and responses
- Analytics events
- Error states

### Browser DevTools
- **Network Tab**: See API requests
- **Console**: View detailed logs
- **Application Tab**: Check local storage (if used)

## 🚀 Deployment

### Build for Production

```bash
pnpm build
pnpm start
```

### Environment Variables
For production deployment, consider adding:

```env
# .env.local
NEXT_PUBLIC_API_BASE_URL=https://your-api.com
CONSENT_API_SECRET=your-secret-key
DATABASE_URL=your-database-url
```

## 📚 Additional Resources

- [Main @ogcio/consent Documentation](../../README.md)
- [Next.js Documentation](https://nextjs.org/docs)
- [GOVIE Design System](https://www.gov.ie/en/design-system/)
- [WCAG Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)

## 🤝 Contributing

To contribute to this example:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 🐛 Troubleshooting

### Common Issues

**Modal not appearing:**
- Check console for errors
- Verify consent status
- Check URL parameters

**API calls failing:**
- Ensure development server is running
- Check network tab in DevTools
- Verify request format

**Styling issues:**
- Ensure @govie-ds/react is properly installed
- Check CSS imports
- Verify Tailwind CSS configuration

### Getting Help

If you encounter issues:
1. Check the browser console for errors
2. Review the example code and documentation
3. Open an issue on GitHub with details
4. Include browser version and error messages

## 📄 License

This example is licensed under the MIT License - see the [LICENSE](../../LICENSE) file for details.
