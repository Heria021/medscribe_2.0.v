import {
  LayoutDashboard,
  Users,
  Calendar,
  FileText,
  Stethoscope,
  Settings,
  Heart,
  UserCheck,
  ClipboardList,
  MessageSquare,
  BarChart3,
  Shield,
  Bell,
  CreditCard,
  HelpCircle,
  BookOpen,
  Activity,
  Mic,
  History,
  Share,
  UserPlus
} from "lucide-react";

export interface NavItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  items?: NavItem[];
}

export interface NavSection {
  title: string;
  items: NavItem[];
}

// Doctor Navigation Configuration
export const doctorNavigation: NavSection[] = [
  {
    title: "Dashboard",
    items: [
      {
        title: "Overview",
        href: "/doctor/dashboard",
        icon: LayoutDashboard,
      },
      {
        title: "Analytics",
        href: "/doctor/analytics",
        icon: BarChart3,
      },
    ],
  },
  {
    title: "Patient Management",
    items: [
      {
        title: "Patients",
        href: "/doctor/patients",
        icon: Users,
        items: [
          {
            title: "All Patients",
            href: "/doctor/patients",
            icon: Users,
          },
          {
            title: "Add Patient",
            href: "/doctor/patients/add",
            icon: UserCheck,
          },
          {
            title: "Patient Records",
            href: "/doctor/patients/records",
            icon: FileText,
          },
        ],
      },
      {
        title: "Appointments",
        href: "/doctor/appointments",
        icon: Calendar,
        badge: "3",
        items: [
          {
            title: "Today's Schedule",
            href: "/doctor/appointments/today",
            icon: Calendar,
          },
          {
            title: "All Appointments",
            href: "/doctor/appointments",
            icon: Calendar,
          },
          {
            title: "Schedule New",
            href: "/doctor/appointments/new",
            icon: Calendar,
          },
        ],
      },
    ],
  },
  {
    title: "Medical Records",
    items: [
      {
        title: "Shared SOAP Notes",
        href: "/doctor/shared-soap",
        icon: Share,
      },
      {
        title: "Referrals",
        href: "/doctor/referrals",
        icon: UserPlus,
      },
      {
        title: "Consultations",
        href: "/doctor/consultations",
        icon: Stethoscope,
        items: [
          {
            title: "Active Sessions",
            href: "/doctor/consultations/active",
            icon: Activity,
          },
          {
            title: "Consultation History",
            href: "/doctor/consultations",
            icon: Stethoscope,
          },
          {
            title: "Start New Session",
            href: "/doctor/consultations/new",
            icon: Stethoscope,
          },
        ],
      },
      {
        title: "Medical Records",
        href: "/doctor/records",
        icon: FileText,
        items: [
          {
            title: "All Records",
            href: "/doctor/records",
            icon: FileText,
          },
          {
            title: "Create Record",
            href: "/doctor/records/create",
            icon: FileText,
          },
          {
            title: "Templates",
            href: "/doctor/records/templates",
            icon: ClipboardList,
          },
        ],
      },
    ],
  },
  {
    title: "Communication",
    items: [
      {
        title: "Messages",
        href: "/doctor/messages",
        icon: MessageSquare,
        badge: "2",
      },
      {
        title: "Notifications",
        href: "/doctor/notifications",
        icon: Bell,
      },
    ],
  },
  {
    title: "Settings",
    items: [
      {
        title: "Profile",
        href: "/doctor/settings/profile",
        icon: Settings,
      },
      {
        title: "Preferences",
        href: "/doctor/settings/preferences",
        icon: Settings,
      },
      {
        title: "Security",
        href: "/doctor/settings/security",
        icon: Shield,
      },
    ],
  },
];

// Patient Navigation Configuration
export const patientNavigation: NavSection[] = [
  {
    title: "Dashboard",
    items: [
      {
        title: "Overview",
        href: "/patient/dashboard",
        icon: LayoutDashboard,
      },
      {
        title: "Health Summary",
        href: "/patient/health",
        icon: Heart,
      },
    ],
  },
  {
    title: "SOAP Notes",
    items: [
      {
        title: "Generate SOAP",
        href: "/patient/soap/generate",
        icon: Mic,
      },
      {
        title: "SOAP History",
        href: "/patient/soap/history",
        icon: History,
      },
    ],
  },
  {
    title: "Appointments",
    items: [
      {
        title: "My Appointments",
        href: "/patient/appointments",
        icon: Calendar,
        items: [
          {
            title: "Upcoming",
            href: "/patient/appointments/upcoming",
            icon: Calendar,
          },
          {
            title: "Past Appointments",
            href: "/patient/appointments/history",
            icon: Calendar,
          },
          {
            title: "Book Appointment",
            href: "/patient/appointments/book",
            icon: Calendar,
          },
        ],
      },
    ],
  },
  {
    title: "Medical Records",
    items: [
      {
        title: "My Records",
        href: "/patient/records",
        icon: FileText,
        items: [
          {
            title: "Medical History",
            href: "/patient/records/history",
            icon: FileText,
          },
          {
            title: "Test Results",
            href: "/patient/records/tests",
            icon: ClipboardList,
          },
          {
            title: "Prescriptions",
            href: "/patient/records/prescriptions",
            icon: FileText,
          },
        ],
      },
      {
        title: "Health Tracking",
        href: "/patient/tracking",
        icon: Activity,
        items: [
          {
            title: "Vital Signs",
            href: "/patient/tracking/vitals",
            icon: Heart,
          },
          {
            title: "Symptoms Log",
            href: "/patient/tracking/symptoms",
            icon: Activity,
          },
          {
            title: "Medication Log",
            href: "/patient/tracking/medications",
            icon: ClipboardList,
          },
        ],
      },
    ],
  },
  {
    title: "Communication",
    items: [
      {
        title: "Messages",
        href: "/patient/messages",
        icon: MessageSquare,
        badge: "1",
      },
      {
        title: "Notifications",
        href: "/patient/notifications",
        icon: Bell,
      },
    ],
  },
  {
    title: "Account",
    items: [
      {
        title: "Profile",
        href: "/patient/settings/profile",
        icon: Settings,
      },
      {
        title: "Billing",
        href: "/patient/billing",
        icon: CreditCard,
      },
      {
        title: "Help & Support",
        href: "/patient/help",
        icon: HelpCircle,
      },
    ],
  },
];

// Helper function to get navigation based on user role
export function getNavigationForRole(role: "doctor" | "patient"): NavSection[] {
  return role === "doctor" ? doctorNavigation : patientNavigation;
}

// Helper function to find current route info
export function findCurrentRoute(navigation: NavSection[], pathname: string) {
  for (const section of navigation) {
    for (const item of section.items) {
      if (item.href === pathname) {
        return { section: section.title, item: item.title };
      }
      if (item.items) {
        for (const subItem of item.items) {
          if (subItem.href === pathname) {
            return { section: section.title, item: item.title, subItem: subItem.title };
          }
        }
      }
    }
  }
  return null;
}
