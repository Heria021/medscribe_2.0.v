# Patient Portal - Advanced Features & Implementation Details

## 📋 Table of Contents
1. [Component Architecture](#component-architecture)
2. [State Management](#state-management)
3. [Real-time Features](#real-time-features)
4. [Error Handling](#error-handling)
5. [Performance Optimizations](#performance-optimizations)
6. [Security Considerations](#security-considerations)

---

## 🏗️ Component Architecture

### Dashboard Layout Hierarchy
```
DashboardLayout
├── SidebarProvider
│   ├── DashboardSidebar
│   │   ├── SidebarHeader (Logo + Role)
│   │   ├── SidebarContent (Navigation)
│   │   └── SidebarFooter (User info)
│   └── SidebarInset
│       ├── DashboardHeader
│       │   ├── SidebarTrigger
│       │   ├── Breadcrumb
│       │   └── UserMenu
│       └── Main Content Area
└── FloatingChatWidget
```

### Key Reusable Components

#### 1. ActionCard (`components/ui/action-card.tsx`)
```typescript
interface ActionCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  href: string;
  variant?: "default" | "compact";
  className?: string;
}
```
**Usage**: Quick action buttons throughout the dashboard

#### 2. TreatmentOverview (`components/patient/treatment-overview.tsx`)
```typescript
interface TreatmentOverviewProps {
  patientId: Id<"patients">;
}
```
**Features**:
- Active treatment plans display
- Medication adherence tracking
- Progress indicators
- Quick action buttons

#### 3. PatientDoctorChat (`components/patient/patient-doctor-chat.tsx`)
```typescript
interface PatientDoctorChatProps {
  doctorId: Id<"doctors">;
  patientId: Id<"patients">;
  doctorName: string;
  onClose: () => void;
}
```
**Features**:
- Real-time messaging
- Message status indicators
- File attachment support
- Typing indicators

---

## 🔄 State Management

### Session Management
```typescript
// Authentication state
const { data: session, status } = useSession();

// Profile loading
const patientProfile = useQuery(
  api.patients.getPatientByUserId,
  session?.user?.id ? { userId: session.user.id as any } : "skip"
);
```

### Loading States
Each page implements comprehensive loading states:

```typescript
// Loading skeleton while data loads
if (status === "loading" || (session?.user?.id && patientProfile === undefined)) {
  return <DashboardSkeleton />;
}

// Authentication check
if (!session || session.user.role !== "patient") {
  return null;
}
```

### Data Fetching Patterns
```typescript
// Conditional queries based on dependencies
const activeTreatments = useQuery(
  api.treatmentPlans.getWithDetailsByPatientId,
  patientProfile?._id ? { patientId: patientProfile._id as any } : "skip"
);
```

---

## ⚡ Real-time Features

### 1. Chat System
**Implementation**: Uses Convex real-time subscriptions
```typescript
// Real-time message updates
const sessionMessages = useQuery(
  api.chatMessages.getSessionMessages,
  currentSessionId ? { sessionId: currentSessionId } : "skip"
);

// Auto-scroll to new messages
useEffect(() => {
  messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
}, [messages]);
```

### 2. Appointment Updates
**Real-time appointment status changes**:
- Automatic updates when doctors modify appointments
- Instant notifications for cancellations/reschedules
- Live availability updates

### 3. Treatment Plan Updates
**Live synchronization**:
- Treatment progress updates from doctors
- Medication changes
- Care plan modifications

---

## 🛡️ Error Handling

### API Error Handling
```typescript
try {
  const response = await fetch('/api/patient/soap', {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    throw new Error(`API call failed: ${response.statusText}`);
  }

  const result = await response.json();
  
  if (result.success) {
    toast.success("SOAP note generated successfully!");
  } else {
    // Handle specific error types
    if (response.status === 422 && result.details?.qa_results) {
      toast.error(`Quality check failed: ${result.details.message}`);
    } else {
      throw new Error(result.error || 'Failed to generate SOAP note');
    }
  }
} catch (error) {
  console.error('Error:', error);
  toast.error("Operation failed. Please try again.");
}
```

### Convex Query Error Handling
```typescript
// Graceful handling of missing data
const patientProfile = useQuery(
  api.patients.getPatientByUserId,
  session?.user?.id ? { userId: session.user.id as any } : "skip"
);

// Show appropriate UI based on data state
if (patientProfile === undefined) {
  return <LoadingSkeleton />;
}

if (patientProfile === null) {
  return <CreateProfilePrompt />;
}
```

---

## 🚀 Performance Optimizations

### 1. Code Splitting
```typescript
// Lazy loading of heavy components
const AudioRecorder = lazy(() => import('@/components/audio/audio-recorder'));
const SOAPViewer = lazy(() => import('@/components/soap/soap-viewer'));
```

### 2. Memoization
```typescript
// Expensive calculations
const isProfileComplete = useMemo(() => {
  if (!patientProfile) return false;
  
  const requiredFields = ['firstName', 'lastName', 'dateOfBirth', ...];
  return requiredFields.every(field => {
    const value = patientProfile[field];
    return value && value.toString().trim() !== "";
  });
}, [patientProfile]);
```

### 3. Optimistic Updates
```typescript
// Immediate UI updates before server confirmation
const handleSendMessage = async () => {
  // Add message to UI immediately
  setMessages(prev => [...prev, optimisticMessage]);
  
  try {
    // Send to server
    await addMessage({...});
  } catch (error) {
    // Rollback on error
    setMessages(prev => prev.filter(m => m.id !== optimisticMessage.id));
    toast.error("Failed to send message");
  }
};
```

### 4. Virtual Scrolling
For large lists (chat history, SOAP notes):
```typescript
// Implemented in ScrollArea components
<ScrollArea className="h-full">
  <VirtualizedList
    items={messages}
    renderItem={renderMessage}
    itemHeight={80}
  />
</ScrollArea>
```

---

## 🔐 Security Considerations

### 1. Route Protection
```typescript
// Every patient route includes authentication check
useEffect(() => {
  if (status === "loading") return;
  
  if (!session || session.user.role !== "patient") {
    router.push("/auth/login");
  }
}, [session, status, router]);
```

### 2. Data Validation
```typescript
// Client-side validation before API calls
const validateSOAPData = (data: any) => {
  if (!data.patientId || !data.audioFile) {
    throw new Error("Missing required fields");
  }
  
  if (data.audioFile.size > 50 * 1024 * 1024) {
    throw new Error("File too large");
  }
};
```

### 3. Sanitization
```typescript
// Content sanitization for chat messages
import DOMPurify from 'dompurify';

const sanitizedContent = DOMPurify.sanitize(userInput);
```

### 4. HIPAA Compliance
- **Encryption**: All data encrypted in transit and at rest
- **Access Logs**: Comprehensive audit trails
- **Data Minimization**: Only necessary data collected
- **User Consent**: Explicit consent for data sharing

---

## 📊 Analytics & Monitoring

### User Interaction Tracking
```typescript
// Track important user actions
const trackUserAction = (action: string, metadata?: any) => {
  analytics.track('patient_action', {
    action,
    userId: session?.user?.id,
    timestamp: Date.now(),
    ...metadata
  });
};

// Usage examples
trackUserAction('soap_generated', { processingTime: 45000 });
trackUserAction('appointment_booked', { doctorId, appointmentDate });
```

### Performance Monitoring
```typescript
// Monitor API response times
const measureApiCall = async (apiCall: () => Promise<any>) => {
  const startTime = performance.now();
  try {
    const result = await apiCall();
    const duration = performance.now() - startTime;
    
    analytics.track('api_performance', {
      endpoint: apiCall.name,
      duration,
      success: true
    });
    
    return result;
  } catch (error) {
    analytics.track('api_error', {
      endpoint: apiCall.name,
      error: error.message
    });
    throw error;
  }
};
```

---

## 🎨 Theming & Customization

### CSS Variables
```css
:root {
  --primary: 222.2 84% 4.9%;
  --primary-foreground: 210 40% 98%;
  --secondary: 210 40% 96%;
  --muted: 210 40% 96%;
  --accent: 210 40% 96%;
  --destructive: 0 84.2% 60.2%;
}
```

### Component Variants
```typescript
// Button variants for different contexts
<Button variant="default">Primary Action</Button>
<Button variant="outline">Secondary Action</Button>
<Button variant="ghost">Subtle Action</Button>
<Button variant="destructive">Delete Action</Button>
```

### Responsive Design Tokens
```typescript
// Breakpoint system
const breakpoints = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px'
};
```

---

## 🧪 Testing Strategy

### Unit Tests
```typescript
// Component testing with React Testing Library
test('renders patient dashboard with correct data', async () => {
  render(<PatientDashboard />);
  
  await waitFor(() => {
    expect(screen.getByText(/Welcome back/)).toBeInTheDocument();
  });
});
```

### Integration Tests
```typescript
// API route testing
test('SOAP generation API processes audio correctly', async () => {
  const formData = new FormData();
  formData.append('audio_file', mockAudioFile);
  
  const response = await fetch('/api/patient/soap', {
    method: 'POST',
    body: formData
  });
  
  expect(response.status).toBe(200);
  const result = await response.json();
  expect(result.success).toBe(true);
});
```

### E2E Tests
```typescript
// Playwright tests for critical user flows
test('patient can generate SOAP note end-to-end', async ({ page }) => {
  await page.goto('/patient/soap/generate');
  await page.click('[data-testid="record-button"]');
  await page.waitForTimeout(5000);
  await page.click('[data-testid="stop-button"]');
  await page.click('[data-testid="generate-button"]');
  
  await expect(page.locator('[data-testid="soap-result"]')).toBeVisible();
});
```
