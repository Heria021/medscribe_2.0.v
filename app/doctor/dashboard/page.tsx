"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo } from "react";
import { useQuery } from "convex/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, Calendar, FileText, Stethoscope, Activity, Brain, Bot, ArrowRight } from "lucide-react";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { ScheduledAppointments } from "@/components/doctor/scheduled-appointments";
import { ActionCard } from "@/components/ui/action-card";
import { api } from "@/convex/_generated/api";
import Link from "next/link";

// Skeleton Components
function DashboardSkeleton() {
  return (
    <DashboardLayout>
      <div className="h-full flex flex-col space-y-4">
        {/* Header Skeleton */}
        <div className="flex-shrink-0 space-y-2">
          <Skeleton className="h-7 w-64" />
          <Skeleton className="h-4 w-96" />
        </div>

        {/* Main Content Grid Skeleton */}
        <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-4 gap-4">
          {/* Left Content Skeleton */}
          <div className="lg:col-span-3 flex flex-col min-h-0">
            <Card className="flex-1 min-h-0">
              <CardHeader>
                <Skeleton className="h-5 w-32" />
              </CardHeader>
              <CardContent className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex items-center space-x-3 p-3 border rounded-lg">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-48" />
                    </div>
                    <Skeleton className="h-6 w-16" />
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Right Sidebar Skeleton */}
          <div className="flex flex-col min-h-0 space-y-4">
            {/* Quick Actions Skeleton */}
            <Card className="flex-shrink-0">
              <CardHeader className="pb-2">
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent className="p-3 pt-0">
                <div className="grid grid-cols-2 gap-2">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="p-3 border rounded-lg">
                      <Skeleton className="h-4 w-4 mb-2" />
                      <Skeleton className="h-3 w-16 mb-1" />
                      <Skeleton className="h-3 w-12" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* AI Assistant Skeleton */}
            <Card className="flex-shrink-0">
              <CardContent className="p-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Skeleton className="w-8 h-8 rounded-lg" />
                    <div className="flex-1">
                      <Skeleton className="h-4 w-32 mb-1" />
                      <Skeleton className="h-3 w-20" />
                    </div>
                  </div>
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-8 w-full rounded-md" />
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity Skeleton */}
            <Card className="flex-1 min-h-0">
              <CardHeader className="pb-2">
                <Skeleton className="h-4 w-28" />
              </CardHeader>
              <CardContent className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex items-center space-x-3">
                    <Skeleton className="h-6 w-6 rounded-full" />
                    <div className="flex-1">
                      <Skeleton className="h-3 w-32 mb-1" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

// Profile Completion Component (Inside Dashboard Layout)
function ProfileCompletionContent({ doctorProfile }: { doctorProfile: any }) {
  // Define required fields for profile completion
  const requiredFields = [
    { key: 'firstName', label: 'First Name' },
    { key: 'lastName', label: 'Last Name' },
    { key: 'phone', label: 'Phone Number' },
    { key: 'email', label: 'Email' },
    { key: 'primarySpecialty', label: 'Primary Specialty' },
    { key: 'licenseNumber', label: 'License Number' },
  ];

  const completedRequired = useMemo(() => {
    if (!doctorProfile) return [];
    return requiredFields.filter(field => {
      const value = doctorProfile[field.key];
      return value && (Array.isArray(value) ? value.length > 0 : value.toString().trim() !== "");
    });
  }, [doctorProfile, requiredFields]);

  const requiredCompletion = (completedRequired.length / requiredFields.length) * 100;
  const missingRequired = requiredFields.length - completedRequired.length;

  return (
    <div className="h-full w-full flex items-center justify-center p-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-primary/10">
              <Stethoscope className="h-8 w-8 text-primary" />
            </div>
          </div>
          <CardTitle className="text-2xl">Complete Your Doctor Profile</CardTitle>
          <p className="text-muted-foreground">
            {!doctorProfile
              ? "Set up your professional profile to start accepting patients."
              : `${missingRequired} required field${missingRequired !== 1 ? 's' : ''} remaining`
            }
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {doctorProfile && (
            <div className="space-y-4">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Profile Completion</span>
                <span className="font-medium">{completedRequired.length}/{requiredFields.length} fields</span>
              </div>
              <div className="w-full bg-secondary rounded-full h-3">
                <div
                  className="bg-primary h-3 rounded-full transition-all duration-500"
                  style={{ width: `${requiredCompletion}%` }}
                />
              </div>
              <div className="flex justify-center">
                <Badge variant="secondary" className="text-sm px-3 py-1">
                  {Math.round(requiredCompletion)}% Complete
                </Badge>
              </div>
            </div>
          )}

          <div className="space-y-4">
            <div className="bg-muted/50 rounded-lg p-4">
              <h4 className="font-medium mb-2 flex items-center gap-2">
                <Stethoscope className="h-4 w-4" />
                Required Information
              </h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Professional contact details</li>
                <li>• Medical specialty and credentials</li>
                <li>• License verification information</li>
                <li>• Practice location and availability</li>
              </ul>
            </div>

            <p className="text-sm text-muted-foreground text-center">
              Complete all required fields to start accepting patients and unlock full platform features.
            </p>

            <Link href="/doctor/settings/profile" className="block">
              <Button className="w-full" size="lg">
                {!doctorProfile ? "Get Started" : "Complete Profile"}
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function DoctorDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // Get doctor profile
  const doctorProfile = useQuery(
    api.doctors.getDoctorProfile,
    session?.user?.id ? { userId: session.user.id as any } : "skip"
  );

  // Check if profile is complete
  const isProfileComplete = useMemo(() => {
    if (!doctorProfile) return false;

    const requiredFields = ['firstName', 'lastName', 'phone', 'email', 'primarySpecialty', 'licenseNumber'] as const;
    return requiredFields.every(field => {
      const value = doctorProfile[field as keyof typeof doctorProfile];
      return value && (Array.isArray(value) ? value.length > 0 : value.toString().trim() !== "");
    });
  }, [doctorProfile]);

  useEffect(() => {
    if (status === "loading") return; // Still loading

    if (!session) {
      router.push("/auth/login");
      return;
    }

    if (session.user.role !== "doctor") {
      router.push("/auth/login");
      return;
    }
  }, [session, status, router]);

  // Show loading skeleton while session or profile is loading
  if (status === "loading" || (session?.user?.id && doctorProfile === undefined)) {
    return <DashboardSkeleton />;
  }

  // Redirect if not authenticated or wrong role
  if (!session || session.user.role !== "doctor") {
    return null;
  }

  // Show dashboard with profile completion content if profile is not complete
  return (
    <DashboardLayout>
      {!isProfileComplete ? (
        <ProfileCompletionContent doctorProfile={doctorProfile} />
      ) : (
        <div className="h-full flex flex-col space-y-4">
          {/* Header */}
          <div className="flex-shrink-0 space-y-1">
            <h1 className="text-xl font-bold tracking-tight">
              Welcome back, {doctorProfile?.title ? `${doctorProfile.title} ` : "Dr. "}{doctorProfile?.lastName || "Doctor"}!
            </h1>
            <p className="text-muted-foreground text-sm">
              Manage your patients, appointments, and medical records
            </p>
          </div>

        {/* Main Content Grid - Fixed Height Distribution */}
        <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-4 gap-4">
          {/* Week's Schedule - Takes 3 columns */}
          <div className="lg:col-span-3 flex flex-col min-h-0">
            {doctorProfile && (
              <ScheduledAppointments doctorId={doctorProfile._id} />
            )}
          </div>

          {/* Right Sidebar - Quick Actions & AI Assistant */}
          <div className="flex flex-col min-h-0 space-y-4">
            {/* Quick Actions - Fixed Height */}
            <Card className="flex-shrink-0">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="p-3 pt-0">
                <div className="grid grid-cols-2 gap-2">
                  <ActionCard
                    title="Patients"
                    description="View records"
                    icon={<Users className="h-4 w-4" />}
                    href="/doctor/patients"
                    variant="compact"
                    className="border-0 shadow-none"
                  />
                  <ActionCard
                    title="Appointments"
                    description="Check schedule"
                    icon={<Calendar className="h-4 w-4" />}
                    href="/doctor/appointments"
                    variant="compact"
                    className="border-0 shadow-none"
                  />
                  <ActionCard
                    title="SOAP Notes"
                    description="Shared records"
                    icon={<FileText className="h-4 w-4" />}
                    href="/doctor/shared-soap"
                    variant="compact"
                    className="border-0 shadow-none"
                  />
                  <ActionCard
                    title="Referrals"
                    description="Patient referrals"
                    icon={<Stethoscope className="h-4 w-4" />}
                    href="/doctor/referrals"
                    variant="compact"
                    className="border-0 shadow-none"
                  />
                </div>
              </CardContent>
            </Card>

            {/* AI Medical Assistant */}
            <Card className="p-0 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border-blue-200 dark:border-blue-800 flex-shrink-0">
              <CardContent className="p-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                      <Brain className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-100">
                        AI Medical Assistant
                      </h3>
                      <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300">
                        Smart Chat
                      </Badge>
                    </div>
                  </div>
                  <p className="text-xs text-blue-700 dark:text-blue-300">
                    Chat with AI about patient records, SOAP notes, and medical insights.
                  </p>
                  <Link href="/doctor/assistant" className="block">
                    <Button size="sm" className="w-full bg-blue-600 hover:bg-blue-700">
                      <Bot className="h-3 w-3 mr-2" />
                      Chat with Assistant
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity - Takes Remaining Space */}
            <Card className="flex-1 min-h-0 flex flex-col">
              <CardHeader className="pb-2 flex-shrink-0">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm">Recent Activity</CardTitle>
                  <Button variant="outline" size="sm" className="h-6 px-2 text-xs">
                    <Activity className="h-3 w-3" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="flex-1 min-h-0 p-0">
                <ScrollArea className="h-full">
                  <div className="p-3">
                    <div className="flex items-center justify-center py-6 text-center">
                      <div className="space-y-1">
                        <Activity className="h-8 w-8 text-muted-foreground mx-auto" />
                        <p className="text-xs text-muted-foreground">No recent activity</p>
                        <p className="text-xs text-muted-foreground opacity-70">
                          Updates will appear here
                        </p>
                      </div>
                    </div>
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      )}
    </DashboardLayout>
  );
}
