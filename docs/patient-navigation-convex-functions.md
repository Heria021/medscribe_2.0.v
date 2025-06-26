# Patient Portal - Navigation & Convex Functions Documentation

## 📋 Table of Contents
1. [Navigation Structure](#navigation-structure)
2. [Dashboard Layout](#dashboard-layout)
3. [Page-by-Page Breakdown](#page-by-page-breakdown)
4. [Convex Functions Reference](#convex-functions-reference)
5. [API Routes](#api-routes)

---

## 🧭 Navigation Structure

### Sidebar Navigation (`lib/navigation.ts`)
The patient portal uses a hierarchical sidebar navigation with the following sections:

```typescript
export const patientNavigation: NavSection[] = [
  {
    title: "Dashboard",
    items: [
      { title: "Overview", href: "/patient/dashboard", icon: LayoutDashboard }
    ]
  },
  {
    title: "AI Assistant", 
    items: [
      { title: "Medical Assistant", href: "/patient/assistant", icon: Bot }
    ]
  },
  {
    title: "SOAP Notes",
    items: [
      { title: "Generate SOAP", href: "/patient/soap/generate", icon: Mic },
      { title: "SOAP History", href: "/patient/soap/history", icon: History }
    ]
  },
  {
    title: "Health Management",
    items: [
      { title: "My Appointments", href: "/patient/appointments", icon: Calendar },
      { title: "My Treatments", href: "/patient/treatments", icon: Activity },
      { title: "My Records", href: "/patient/records", icon: FileText }
    ]
  },
  {
    title: "Communication",
    items: [
      { title: "Chat with Doctors", href: "/patient/chat", icon: MessageCircle }
    ]
  },
  {
    title: "Settings",
    items: [
      { title: "Profile Settings", href: "/patient/settings/profile", icon: User },
      { title: "Account Settings", href: "/patient/settings/account", icon: Settings }
    ]
  }
];
```

### Header Navigation (`components/dashboard/dashboard-header.tsx`)
- **Breadcrumb Navigation**: Dynamic breadcrumbs based on current route
- **User Menu**: Profile access, settings, logout
- **Notifications**: Real-time notification center
- **Search**: Global search functionality

---

## 🏗️ Dashboard Layout

### Main Layout Component (`components/dashboard/dashboard-layout.tsx`)
```typescript
export function DashboardLayout({ children }: { children: React.ReactNode }) {
  // Uses SidebarProvider for responsive sidebar
  // Includes breadcrumb navigation
  // Floating chat widget for quick access
}
```

**Key Features:**
- **Responsive Design**: Collapsible sidebar on mobile
- **Breadcrumb System**: Auto-generated from route structure
- **Floating Chat Widget**: Quick access to doctor communication
- **Role-Based Navigation**: Different nav items based on user role

### Sidebar Component (`components/dashboard/dashboard-sidebar.tsx`)
```typescript
export function DashboardSidebar({ navigation, userRole, currentPath }) {
  // Renders navigation sections with icons
  // Highlights active routes
  // Shows badges for notifications/counts
}
```

---

## 📄 Page-by-Page Breakdown

### 1. Dashboard Overview (`/patient/dashboard`)
**File**: `app/patient/dashboard/page.tsx`

**Purpose**: Main landing page with health overview and quick actions

**Convex Functions Used:**
- `api.patients.getPatientByUserId` - Get patient profile
- `api.treatmentPlans.getWithDetailsByPatientId` - Get active treatments
- `api.medications.getActiveByPatientId` - Get current medications  
- `api.appointments.getUpcomingByPatient` - Get upcoming appointments

**Key Features:**
- Welcome message with patient name
- AI Assistant quick access card
- Treatment overview component
- Quick action buttons
- Upcoming appointments summary

### 2. AI Medical Assistant (`/patient/assistant`)
**File**: `app/patient/assistant/page.tsx`

**Purpose**: Chat interface with AI assistant for medical queries

**Convex Functions Used:**
- `api.patients.getPatientByUserId` - Get patient profile
- `api.chatSessions.getUserSessions` - Get chat history
- `api.chatSessions.createSession` - Create new chat session
- `api.chatMessages.getSessionMessages` - Get session messages
- `api.chatMessages.addMessage` - Add new message

**Key Features:**
- Chat history sidebar
- Real-time messaging interface
- Context-aware AI responses
- Document relevance display
- Session management

### 3. SOAP Note Generation (`/patient/soap/generate`)
**File**: `app/patient/soap/generate/page.tsx`

**Purpose**: Record or upload audio to generate clinical documentation

**Convex Functions Used:**
- `api.patients.getPatientByUserId` - Get patient profile
- `api.soapNotes.create` - Store generated SOAP note (via API)

**API Routes Used:**
- `POST /api/patient/soap` - Process audio and generate SOAP

**Key Features:**
- Audio recording interface
- File upload capability
- Real-time processing status
- Quality assurance feedback
- Automatic redirection to generated note

### 4. SOAP History (`/patient/soap/history`)
**File**: `app/patient/soap/history/page.tsx`

**Purpose**: View all previously generated SOAP notes

**Convex Functions Used:**
- `api.patients.getPatientByUserId` - Get patient profile
- `api.soapNotes.getByPatientId` - Get patient's SOAP notes

**Key Features:**
- Chronological SOAP note listing
- Search and filter capabilities
- Quick preview and full view options
- Export functionality

### 5. View SOAP Note (`/patient/soap/view/[id]`)
**File**: `app/patient/soap/view/[id]/page.tsx`

**Purpose**: Display detailed view of specific SOAP note

**Convex Functions Used:**
- `api.patients.getPatientByUserId` - Get patient profile
- `api.soapNotes.getById` - Get specific SOAP note

**Key Features:**
- Full SOAP note display (S.O.A.P format)
- Quality score and metadata
- Export options
- Edit capabilities (if applicable)

### 6. Appointments (`/patient/appointments`)
**File**: `app/patient/appointments/page.tsx`

**Purpose**: Manage medical appointments

**Convex Functions Used:**
- `api.patients.getPatientByUserId` - Get patient profile
- `api.appointments.getUpcomingByPatient` - Get upcoming appointments
- `api.appointments.getByPatient` - Get all appointments
- `api.appointments.cancel` - Cancel appointment
- `api.appointments.reschedule` - Reschedule appointment

**Key Features:**
- Upcoming appointments list
- Past appointments history
- Appointment actions (cancel, reschedule)
- Book new appointment link

### 7. Treatments (`/patient/treatments`)
**File**: `app/patient/treatments/page.tsx`

**Purpose**: View and manage treatment plans

**Convex Functions Used:**
- `api.patients.getPatientByUserId` - Get patient profile
- `api.treatmentPlans.getWithDetailsByPatientId` - Get treatment plans
- `api.medications.getActiveByPatientId` - Get medications

**Key Features:**
- Active treatment plans
- Medication management
- Treatment progress tracking
- Care plan details

### 8. Medical Records (`/patient/records`)
**File**: `app/patient/records/page.tsx`

**Purpose**: Access medical records and documents

**Current Status**: Coming Soon placeholder

**Planned Convex Functions:**
- `api.medicalRecords.getByPatientId` - Get medical records
- `api.documents.getByPatientId` - Get patient documents

### 9. Doctor Chat (`/patient/chat`)
**File**: `app/patient/chat/page.tsx`

**Purpose**: Direct messaging with healthcare providers

**Convex Functions Used:**
- `api.patients.getPatientByUserId` - Get patient profile
- `api.doctorPatientConversations.getPatientConversations` - Get conversations
- `api.doctorPatientMessages.getConversationMessages` - Get messages
- `api.doctorPatientMessages.sendMessage` - Send message

**Key Features:**
- Doctor list with conversation history
- Real-time messaging
- Message status indicators
- File sharing capabilities

---

## 🔧 Convex Functions Reference

### Patient Functions (`convex/patients.ts`)
```typescript
// Core patient operations
export const createPatientProfile = mutation({...})
export const getPatientByUserId = query({...})
export const updatePatientProfile = mutation({...})
export const getPatientById = query({...})

// Medical information
export const addMedicalHistory = mutation({...})
export const getMedicalHistory = query({...})
export const addAllergy = mutation({...})
export const getAllergies = query({...})
export const getPatientInsurance = query({...})
```

### Appointment Functions (`convex/appointments.ts`)
```typescript
export const getUpcomingByPatient = query({...})
export const getByPatient = query({...})
export const cancel = mutation({...})
export const reschedule = mutation({...})
export const book = mutation({...})
```

### Treatment Functions (`convex/treatmentPlans.ts`)
```typescript
export const getWithDetailsByPatientId = query({...})
export const getByPatientId = query({...})
export const updateProgress = mutation({...})
```

### Medication Functions (`convex/medications.ts`)
```typescript
export const getActiveByPatientId = query({...})
export const getByPatientId = query({...})
export const updateAdherence = mutation({...})
```

### SOAP Note Functions (`convex/soapNotes.ts`)
```typescript
export const create = mutation({...})
export const getByPatientId = query({...})
export const getById = query({...})
export const update = mutation({...})
```

### Chat Functions (`convex/chatSessions.ts`, `convex/chatMessages.ts`)
```typescript
// Sessions
export const createSession = mutation({...})
export const getUserSessions = query({...})
export const deleteSession = mutation({...})

// Messages  
export const addMessage = mutation({...})
export const getSessionMessages = query({...})
```

### Doctor-Patient Communication (`convex/doctorPatientConversations.ts`)
```typescript
export const getPatientConversations = query({...})
export const createConversation = mutation({...})
export const getConversationMessages = query({...})
export const sendMessage = mutation({...})
```

---

## 🌐 API Routes

### SOAP Generation (`/api/patient/soap`)
- **POST**: Process audio file and generate SOAP note
- **GET**: Retrieve SOAP notes for patient

### AI Assistant (`/api/patient/assistant/chat`)
- **POST**: Send message to AI assistant and get response

### Profile Management (`/api/patient/create-profile`)
- **POST**: Create new patient profile

---

## 🔐 Authentication & Authorization

All patient routes are protected by:
1. **Session Authentication**: Must be logged in
2. **Role Authorization**: Must have "patient" role
3. **Profile Validation**: Patient profile must exist

## 📱 Responsive Design

The patient portal is fully responsive with:
- **Mobile-first design**
- **Collapsible sidebar**
- **Touch-friendly interfaces**
- **Optimized for tablets and phones**

## 🎨 UI Components

Key reusable components:
- `DashboardLayout` - Main layout wrapper
- `ActionCard` - Quick action buttons
- `TreatmentOverview` - Treatment summary
- `PatientDoctorChat` - Chat interface
- Various loading skeletons for better UX
