# SOAP Notes Generation Feature

## Overview

The SOAP Notes Generation feature allows patients to record or upload audio files that are automatically processed by AI to generate structured clinical notes in SOAP (Subjective, Objective, Assessment, Plan) format.

## Features

### 🎤 Audio Recording
- **Real-time Recording**: Record audio directly in the browser using Web Audio API
- **File Upload**: Upload existing audio files (supports various audio formats)
- **Recording Controls**: Start, pause, resume, and stop recording
- **Duration Limits**: Configurable maximum recording duration (default: 10 minutes)
- **Audio Playback**: Preview recorded audio before submission
- **File Management**: Download or delete recordings

### 🤖 AI Processing
- **Automatic Transcription**: Convert speech to text
- **Content Validation**: Validate medical content for accuracy
- **SOAP Generation**: Structure content into SOAP format
- **Quality Assessment**: AI-powered quality scoring (0-100%)
- **Highlighting**: Identify and highlight key medical terms
- **Recommendations**: Provide suggestions for improvement

### 📋 SOAP Notes Management
- **Structured Display**: Clean, organized presentation of SOAP sections
- **History Tracking**: View all previously generated SOAP notes
- **Search & Filter**: Find specific notes by content
- **Export Options**: Download notes as text files
- **Quality Metrics**: Track average quality scores and statistics

## Technical Implementation

### Database Schema

#### SOAP Notes Table
```typescript
soapNotes: {
  patientId: Id<"patients">,
  audioRecordingId?: Id<"audioRecordings">,
  subjective: string,
  objective: string,
  assessment: string,
  plan: string,
  highlightedHtml?: string,
  qualityScore?: number,
  processingTime?: string,
  recommendations?: string[],
  externalRecordId?: string,
  googleDocUrl?: string,
  createdAt: number,
  updatedAt: number,
}
```

#### Audio Recordings Table
```typescript
audioRecordings: {
  patientId: Id<"patients">,
  fileName: string,
  fileSize: number,
  duration?: number,
  mimeType: string,
  storageId?: string,
  status: "uploaded" | "processing" | "processed" | "failed",
  createdAt: number,
}
```

### API Integration

#### External SOAP API
```bash
curl -X POST "http://localhost:8000/api/v1/process" \
  -F "audio_file=@recording.mp3" \
  -F "patient_id=PAT001"
```

#### Internal API Route
- **Endpoint**: `/api/patient/soap`
- **Method**: POST
- **Authentication**: NextAuth session validation
- **File Validation**: Type and size checks
- **Error Handling**: Comprehensive error responses

### Components

#### AudioRecorder Component
- **Location**: `components/patient/audio-recorder.tsx`
- **Features**: Recording, playback, file upload, validation
- **Props**: `onAudioReady`, `onAudioRemove`, `disabled`, `maxDuration`

#### SOAPNotesDisplay Component
- **Location**: `components/patient/soap-notes-display.tsx`
- **Features**: Structured display, highlighting, export options
- **Modes**: Full view and compact view

### Pages

#### Generate SOAP (`/patient/soap/generate`)
- Audio recording interface
- Processing status tracking
- Real-time progress updates
- Error handling and retry logic

#### SOAP History (`/patient/soap/history`)
- List all generated SOAP notes
- Search and filter functionality
- Quality statistics
- Quick actions (view, download)

#### View SOAP (`/patient/soap/view/[id]`)
- Detailed SOAP note display
- Enhanced highlighting
- Export and sharing options

## Usage Flow

1. **Patient Access**: Navigate to "Generate SOAP" from dashboard
2. **Audio Input**: Record new audio or upload existing file
3. **Validation**: System validates file type and size
4. **Processing**: Audio sent to AI processing pipeline
5. **Generation**: SOAP notes generated with quality assessment
6. **Review**: Patient reviews generated notes
7. **Storage**: Notes saved to patient's history
8. **Management**: Access, search, and export from history

## Configuration

### Environment Variables
```env
SOAP_API_URL=http://localhost:8000/api/v1/process
NEXT_PUBLIC_CONVEX_URL=your_convex_url
NEXTAUTH_SECRET=your_secret
```

### Audio Settings
- **Max Duration**: 600 seconds (10 minutes)
- **Max File Size**: 50MB
- **Supported Formats**: MP3, WAV, M4A, WEBM
- **Recording Format**: WebM with Opus codec

### Quality Thresholds
- **Excellent**: 90-100%
- **Good**: 80-89%
- **Fair**: 70-79%
- **Needs Review**: Below 70%

## Navigation Integration

### Patient Dashboard
- Quick action buttons for SOAP generation
- Recent SOAP notes summary
- Quality metrics overview

### Sidebar Navigation
- "SOAP Notes" section with:
  - Generate SOAP
  - SOAP History

## Styling & UI

### Design System
- **Framework**: shadcn/ui components
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Theme**: Light/dark mode support

### Highlighting Styles
- **Diagnoses**: Blue highlighting
- **Medications**: Green highlighting
- **Symptoms**: Orange highlighting
- **Procedures**: Purple highlighting

## Security & Privacy

### Data Protection
- Audio files processed securely
- No permanent storage of audio on client
- SOAP notes encrypted in database
- Access control via NextAuth

### Validation
- File type validation
- Size limits enforcement
- Content sanitization
- User authentication required

## Future Enhancements

### Planned Features
- Real-time collaboration with doctors
- Voice commands for navigation
- Multi-language support
- Integration with EHR systems
- Offline recording capability
- Advanced analytics dashboard

### Technical Improvements
- WebRTC for better audio quality
- Progressive Web App features
- Background processing
- Batch processing for multiple files
- Advanced search with medical terminology

## Troubleshooting

### Common Issues
1. **Microphone Access**: Ensure browser permissions are granted
2. **File Upload**: Check file format and size limits
3. **Processing Errors**: Verify external API connectivity
4. **Quality Issues**: Review audio clarity and background noise

### Error Codes
- `401`: Authentication required
- `400`: Invalid file format or size
- `500`: Processing service unavailable
- `413`: File too large

## Support

For technical support or feature requests, please contact the development team or create an issue in the project repository.
