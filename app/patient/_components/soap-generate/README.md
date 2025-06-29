# SOAP Generate Components

This directory contains the component structure for the SOAP generation page, following the established pattern used throughout the patient routes.

## Structure

```
soap-generate/
├── components/           # UI Components
│   ├── SOAPGenerateHeader.tsx
│   ├── SOAPGenerateContent.tsx
│   ├── AudioRecordingSection.tsx
│   ├── RecordingTipsSection.tsx
│   ├── HowItWorksSection.tsx
│   ├── ProcessingIndicator.tsx
│   ├── SOAPGenerateSkeleton.tsx
│   ├── SOAPErrorBoundary.tsx
│   └── index.ts
├── hooks/               # Custom Hooks
│   ├── useSOAPGenerate.ts
│   ├── useAudioRecording.ts
│   └── index.ts
├── types.ts            # TypeScript Types
├── index.ts            # Main Exports
└── README.md           # This file
```

## Mobile-First Design

All components are designed with a mobile-first approach:

- **Responsive Grid**: Uses `grid-cols-1 lg:grid-cols-3` for mobile-first layout
- **Flexible Typography**: Text sizes scale from mobile (`text-sm`) to desktop (`sm:text-base`)
- **Touch-Friendly**: Buttons and interactive elements are sized appropriately for touch
- **Stacked Layout**: Components stack vertically on mobile, side-by-side on desktop

## Components

### SOAPGenerateHeader
- Displays page title and patient information
- Responsive layout with badge positioning
- Mobile-optimized text sizing

### SOAPGenerateContent
- Main container component that orchestrates all sections
- Uses the `useSOAPGenerate` hook for state management
- Implements responsive grid layout

### AudioRecordingSection
- Handles audio recording and file upload
- Integrates with existing AudioRecorder component
- Mobile-first button layout (stacked on mobile, row on desktop)
- Processing state management

### RecordingTipsSection
- Provides helpful tips for recording
- Responsive text sizing
- Organized content sections

### HowItWorksSection
- Explains the SOAP generation process
- Responsive grid: 1 column (mobile) → 2 columns (tablet) → 4 columns (desktop)
- Step-by-step visual indicators

### ProcessingIndicator
- Shows processing status during SOAP generation
- Animated loading indicator
- Progress messaging

## Hooks

### useSOAPGenerate
- Main hook for SOAP generation functionality
- Handles audio state, processing, and API calls
- Error handling and user feedback
- Navigation after successful generation

### useAudioRecording
- Simplified hook for audio recording state
- Can be used independently for other audio features

## Usage

```tsx
import {
  SOAPGenerateHeader,
  SOAPGenerateContent,
  SOAPGenerateSkeleton,
  SOAPErrorBoundary,
} from "@/app/patient/_components/soap-generate";

// In your page component
export default function GenerateSOAPPage() {
  // ... authentication and data fetching logic

  return (
    <SOAPErrorBoundary>
      <div className="flex flex-col h-full w-full overflow-hidden gap-4">
        <div className="flex-shrink-0">
          <SOAPGenerateHeader patientProfile={patientProfile} />
        </div>
        <div className="flex-1 min-h-0 overflow-y-auto">
          <SOAPGenerateContent patientProfile={patientProfile} />
        </div>
      </div>
    </SOAPErrorBoundary>
  );
}
```

## Key Features

- **Mobile-First Responsive Design**: All components adapt from mobile to desktop
- **Error Boundaries**: Graceful error handling with recovery options
- **Loading States**: Comprehensive skeleton loading for better UX
- **Accessibility**: Proper ARIA labels and semantic HTML
- **Type Safety**: Full TypeScript support with comprehensive types
- **Reusable Components**: Modular design for easy maintenance and testing
