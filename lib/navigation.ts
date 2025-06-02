import {
  LayoutDashboard,
  Users,
  Calendar,
  FileText,
  Settings,
  MessageSquare,
  Bell,
  Mic,
  History,
  Share,
  UserPlus,
  Bot
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
    ],
  },
  {
    title: "Patient Management",
    items: [
      {
        title: "Patients",
        href: "/doctor/patients",
        icon: Users,
      },
      {
        title: "Appointments",
        href: "/doctor/appointments",
        icon: Calendar,
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
        title: "SOAP Notes",
        href: "/doctor/soap",
        icon: FileText,
      },
      {
        title: "Referrals",
        href: "/doctor/referrals",
        icon: UserPlus,
      },
    ],
  },
  {
    title: "Settings",
    items: [
      {
        title: "Profile",
        href: "/doctor/settings",
        icon: Settings,
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
    ],
  },
  {
    title: "AI Assistant",
    items: [
      {
        title: "Medical Assistant",
        href: "/patient/assistant",
        icon: Bot,
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
      },
    ],
  },
  {
    title: "Communication",
    items: [
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
        href: "/patient/settings",
        icon: Settings,
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
    }
  }
  return null;
}
