# Dashboard Structure Documentation

## Overview
The MedScribe dashboard implements a responsive sidebar navigation system with role-based routing for doctors and patients. Built with ShadCN UI components and TypeScript for type safety.

## File Structure

```
app/
├── doctor/
│   ├── dashboard/
│   │   └── page.tsx                 # Doctor main dashboard
│   ├── patients/
│   │   ├── page.tsx                 # All patients list
│   │   ├── add/
│   │   │   └── page.tsx             # Add new patient form
│   │   └── records/
│   │       └── page.tsx             # Patient records
│   ├── appointments/
│   │   ├── page.tsx                 # All appointments
│   │   ├── today/
│   │   │   └── page.tsx             # Today's schedule
│   │   └── new/
│   │       └── page.tsx             # Schedule new appointment
│   ├── consultations/
│   │   ├── page.tsx                 # Consultation history
│   │   ├── active/
│   │   │   └── page.tsx             # Active sessions
│   │   └── new/
│   │       └── page.tsx             # Start new session
│   ├── records/
│   │   ├── page.tsx                 # All medical records
│   │   ├── create/
│   │   │   └── page.tsx             # Create new record
│   │   └── templates/
│   │       └── page.tsx             # Record templates
│   ├── messages/
│   │   └── page.tsx                 # Messages
│   ├── notifications/
│   │   └── page.tsx                 # Notifications
│   └── settings/
│       ├── profile/
│       │   └── page.tsx             # Profile settings
│       ├── preferences/
│       │   └── page.tsx             # User preferences
│       └── security/
│           └── page.tsx             # Security settings
│
├── patient/
│   ├── dashboard/
│   │   └── page.tsx                 # Patient main dashboard
│   ├── appointments/
│   │   ├── page.tsx                 # My appointments
│   │   ├── upcoming/
│   │   │   └── page.tsx             # Upcoming appointments
│   │   ├── history/
│   │   │   └── page.tsx             # Past appointments
│   │   └── book/
│   │       └── page.tsx             # Book new appointment
│   ├── records/
│   │   ├── page.tsx                 # My records overview
│   │   ├── history/
│   │   │   └── page.tsx             # Medical history
│   │   ├── tests/
│   │   │   └── page.tsx             # Test results
│   │   └── prescriptions/
│   │       └── page.tsx             # Prescriptions
│   ├── tracking/
│   │   ├── page.tsx                 # Health tracking overview
│   │   ├── vitals/
│   │   │   └── page.tsx             # Vital signs
│   │   ├── symptoms/
│   │   │   └── page.tsx             # Symptoms log
│   │   └── medications/
│   │       └── page.tsx             # Medication log
│   ├── messages/
│   │   └── page.tsx                 # Messages
│   ├── notifications/
│   │   └── page.tsx                 # Notifications
│   ├── billing/
│   │   └── page.tsx                 # Billing information
│   ├── help/
│   │   └── page.tsx                 # Help & support
│   └── settings/
│       └── profile/
│           └── page.tsx             # Profile settings
│
components/
├── dashboard/
│   ├── dashboard-layout.tsx         # Main layout wrapper
│   ├── dashboard-sidebar.tsx        # Sidebar navigation
│   ├── dashboard-header.tsx         # Header with user info
│   └── index.ts                     # Component exports
│
lib/
└── navigation.ts                    # Navigation configuration
```

## Key Components

### 1. DashboardLayout
- **File**: `components/dashboard/dashboard-layout.tsx`
- **Purpose**: Main layout wrapper that provides sidebar and header
- **Features**:
  - Responsive design with mobile sidebar toggle
  - Role-based navigation
  - Current route detection
  - Session management

### 2. DashboardSidebar
- **File**: `components/dashboard/dashboard-sidebar.tsx`
- **Purpose**: Collapsible sidebar navigation with nested routes
- **Features**:
  - Hierarchical navigation structure
  - Active route highlighting
  - Badge support for notifications
  - Collapsible sub-menus
  - Role-specific branding

### 3. DashboardHeader
- **File**: `components/dashboard/dashboard-header.tsx`
- **Purpose**: Top header with user info and navigation
- **Features**:
  - Current page title and breadcrumb
  - User avatar and dropdown menu
  - Notification bell with badge
  - Mobile sidebar trigger
  - Sign out functionality

### 4. Navigation Configuration
- **File**: `lib/navigation.ts`
- **Purpose**: Centralized navigation structure
- **Features**:
  - Role-based navigation (doctor/patient)
  - Nested route support
  - Icon and badge configuration
  - Type-safe navigation items

## Navigation Structure

### Doctor Navigation
- **Dashboard**: Overview, Analytics
- **Patient Management**: Patients (All, Add, Records), Appointments (Today, All, New)
- **Medical Records**: Consultations (Active, History, New), Records (All, Create, Templates)
- **Communication**: Messages, Notifications
- **Settings**: Profile, Preferences, Security

### Patient Navigation
- **Dashboard**: Overview, Health Summary
- **Appointments**: My Appointments (Upcoming, History, Book)
- **Medical Records**: My Records (History, Tests, Prescriptions), Health Tracking (Vitals, Symptoms, Medications)
- **Communication**: Messages, Notifications
- **Account**: Profile, Billing, Help & Support

## Features

### Responsive Design
- Mobile-first approach
- Collapsible sidebar on mobile
- Responsive grid layouts
- Touch-friendly interactions

### Role-Based Access
- Automatic role detection from session
- Role-specific navigation menus
- Protected routes with middleware
- Appropriate redirects

### Modern UI/UX
- ShadCN UI components throughout
- Consistent design system
- Smooth animations and transitions
- Dark/light mode support
- Proper loading and error states

### TypeScript Integration
- Fully typed navigation structure
- Type-safe route parameters
- Proper component prop types
- IntelliSense support

## Usage

### Basic Layout Usage
```tsx
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";

export default function MyPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Your page content */}
      </div>
    </DashboardLayout>
  );
}
```

### Adding New Routes
1. Create the page component in the appropriate directory
2. Update `lib/navigation.ts` to include the new route
3. Ensure proper role-based access control

### Customizing Navigation
- Edit `lib/navigation.ts` to modify menu structure
- Add new icons from Lucide React
- Configure badges for notification counts
- Adjust role-specific menus

## Best Practices

1. **Consistent Layout**: Always wrap pages in `DashboardLayout`
2. **Proper Spacing**: Use consistent spacing classes (`space-y-6`, `gap-4`)
3. **Loading States**: Include loading states for async operations
4. **Error Handling**: Implement proper error boundaries
5. **Accessibility**: Ensure keyboard navigation and screen reader support
6. **Performance**: Lazy load heavy components when possible

## Future Enhancements

- Real-time notifications
- Advanced search and filtering
- Customizable dashboard widgets
- Keyboard shortcuts
- Offline support
- Progressive Web App features
