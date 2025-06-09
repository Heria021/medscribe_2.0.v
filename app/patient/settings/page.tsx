"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  User,
  Bell,
  Shield,
  HelpCircle,
  ChevronRight,
  Lock,
  Globe,
  Mail,
  Calendar,
  FileText,
  LogOut,
  Edit,
  Eye,
  Moon,
  Sun
} from "lucide-react";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";

// Settings Item Component
function SettingsItem({
  icon: Icon,
  title,
  description,
  action,
  href,
  badge,
  disabled = false
}: {
  icon: any;
  title: string;
  description: string;
  action?: React.ReactNode;
  href?: string;
  badge?: string;
  disabled?: boolean;
}) {
  const content = (
    <div className={`flex items-center justify-between p-4 rounded-lg border transition-all duration-200 ${
      disabled
        ? 'bg-muted/30 border-muted cursor-not-allowed opacity-60'
        : 'bg-card border-border hover:border-primary/50 hover:bg-accent/50 cursor-pointer'
    }`}>
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-lg ${disabled ? 'bg-muted' : 'bg-primary/10'}`}>
          <Icon className={`h-4 w-4 ${disabled ? 'text-muted-foreground' : 'text-primary'}`} />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h3 className={`font-medium ${disabled ? 'text-muted-foreground' : 'text-foreground'}`}>
              {title}
            </h3>
            {badge && (
              <Badge variant="secondary" className="text-xs h-4">
                {badge}
              </Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        {action}
        {href && !disabled && (
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        )}
      </div>
    </div>
  );

  if (href && !disabled) {
    return <Link href={href}>{content}</Link>;
  }

  return content;
}

export default function PatientSettingsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [theme, setTheme] = useState<"light" | "dark">("light");



  useEffect(() => {
    if (status === "loading") return;

    if (!session) {
      router.push("/auth/login");
      return;
    }

    if (session.user.role !== "patient") {
      router.push("/auth/login");
      return;
    }
  }, [session, status, router]);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!session || session.user.role !== "patient") {
    return null;
  }

  return (
    <DashboardLayout>
      <div className="h-full flex flex-col space-y-6">
        {/* Header */}
        <div className="flex-shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold tracking-tight">Account Settings</h1>
              <p className="text-muted-foreground text-sm">
                Manage your profile, preferences, and account security
              </p>
            </div>
            <Badge variant="outline" className="flex items-center gap-1">
              <User className="h-3 w-3" />
              Patient Account
            </Badge>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-h-0">
          <ScrollArea className="h-full scrollbar-hide">
            <div className="space-y-6">
              {/* Profile Section */}
              <div className="space-y-4">
                <h2 className="text-lg font-semibold text-foreground">Profile Information</h2>
                <div className="grid gap-4">
                  <SettingsItem
                    icon={User}
                    title="Personal Details"
                    description="Update your name, contact information, and medical details"
                    href="/patient/settings/profile"
                  />

                  <SettingsItem
                    icon={Mail}
                    title="Email Address"
                    description={session.user.email || "No email address"}
                    action={
                      <Button variant="outline" size="sm">
                        <Edit className="h-3 w-3 mr-1" />
                        Edit
                      </Button>
                    }
                  />
                </div>
              </div>

              {/* Notifications Section */}
              <div className="space-y-4">
                <h2 className="text-lg font-semibold text-foreground">Notifications</h2>
                <div className="grid gap-4">
                  <SettingsItem
                    icon={Bell}
                    title="Push Notifications"
                    description="Receive notifications about appointments and updates"
                    action={
                      <Switch
                        checked={notificationsEnabled}
                        onCheckedChange={setNotificationsEnabled}
                      />
                    }
                  />

                  <SettingsItem
                    icon={Mail}
                    title="Email Notifications"
                    description="Get important updates via email"
                    action={
                      <Switch
                        checked={emailNotifications}
                        onCheckedChange={setEmailNotifications}
                      />
                    }
                  />

                  <SettingsItem
                    icon={Calendar}
                    title="Appointment Reminders"
                    description="Receive reminders before your appointments"
                    badge="24h before"
                    action={
                      <Button variant="outline" size="sm">
                        Configure
                      </Button>
                    }
                  />
                </div>
              </div>

              {/* Appearance Section */}
              <div className="space-y-4">
                <h2 className="text-lg font-semibold text-foreground">Appearance</h2>
                <div className="grid gap-4">
                  <SettingsItem
                    icon={theme === "dark" ? Moon : Sun}
                    title="Dark Mode"
                    description={`Currently using ${theme === "dark" ? "dark" : "light"} theme`}
                    action={
                      <Switch
                        checked={theme === "dark"}
                        onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")}
                      />
                    }
                  />

                  <SettingsItem
                    icon={Globe}
                    title="Language"
                    description="English (US)"
                    disabled
                    badge="Coming Soon"
                  />
                </div>
              </div>

              {/* Account & Security Section */}
              <div className="space-y-4">
                <h2 className="text-lg font-semibold text-foreground">Account & Security</h2>
                <div className="grid gap-4">
                  <SettingsItem
                    icon={Lock}
                    title="Password & Security"
                    description="Change password, reset password, and manage account security"
                    href="/patient/settings/security"
                  />

                  <SettingsItem
                    icon={Shield}
                    title="Privacy Settings"
                    description="Control who can see your information and data sharing preferences"
                    href="/patient/settings/privacy"
                  />

                  <SettingsItem
                    icon={Eye}
                    title="Data Sharing"
                    description="Manage how your data is shared with healthcare providers"
                    action={
                      <Button variant="outline" size="sm">
                        Manage
                      </Button>
                    }
                  />
                </div>
              </div>

              {/* Support Section */}
              <div className="space-y-4">
                <h2 className="text-lg font-semibold text-foreground">Support</h2>
                <div className="grid gap-4">
                  <SettingsItem
                    icon={HelpCircle}
                    title="Help Center"
                    description="Find answers to common questions"
                    href="/patient/help"
                  />

                  <SettingsItem
                    icon={FileText}
                    title="Terms & Privacy"
                    description="Review our terms of service and privacy policy"
                    href="/legal"
                  />

                  <SettingsItem
                    icon={LogOut}
                    title="Sign Out"
                    description="Sign out of your account"
                    action={
                      <Button variant="outline" size="sm" className="text-red-600 border-red-200 hover:bg-red-50">
                        Sign Out
                      </Button>
                    }
                  />
                </div>
              </div>
            </div>
          </ScrollArea>
        </div>
      </div>
    </DashboardLayout>
  );
}
