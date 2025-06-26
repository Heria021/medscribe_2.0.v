"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo } from "react";
import { useQuery } from "convex/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { UserCheck, Calendar, FileText, Mic, History, Bot, Sparkles, Brain, User, ArrowRight, MessageCircle, Clock } from "lucide-react";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { ActionCard } from "@/components/ui/action-card";
import { TreatmentOverview } from "@/components/patient/treatment-overview";


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

        {/* AI Features Skeleton */}
        <div className="flex-shrink-0 grid gap-4 md:grid-cols-2">
          {Array.from({ length: 2 }).map((_, i) => (
            <Card key={i} className="p-0">
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Skeleton className="w-10 h-10 rounded-lg" />
                    <div className="flex-1">
                      <Skeleton className="h-5 w-48 mb-2" />
                      <Skeleton className="h-4 w-20" />
                    </div>
                  </div>
                  <Skeleton className="h-4 w-full" />
                  <div className="flex flex-col sm:flex-row gap-2">
                    <Skeleton className="h-9 flex-1" />
                    <Skeleton className="h-9 flex-1" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main Content Grid Skeleton */}
        <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-4 gap-3">
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
          <div className="flex flex-col space-y-6 min-h-0">
            {/* Health Overview Skeleton */}
            <Card className="flex-shrink-0">
              <CardHeader className="pb-3">
                <Skeleton className="h-5 w-32" />
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  {Array.from({ length: 2 }).map((_, i) => (
                    <div key={i} className="text-center p-4 bg-muted rounded-lg">
                      <Skeleton className="h-6 w-8 mx-auto mb-2" />
                      <Skeleton className="h-3 w-16 mx-auto" />
                    </div>
                  ))}
                </div>
                <Skeleton className="h-8 w-full" />
              </CardContent>
            </Card>

            {/* Quick Actions Skeleton */}
            <Card className="flex-1 min-h-0">
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
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}



export default function PatientDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // Fetch patient profile
  const patientProfile = useQuery(
    api.patients.getPatientByUserId,
    session?.user?.id ? { userId: session.user.id as any } : "skip"
  );

  // Fetch active treatments and medications to determine if quick actions should be shown
  const activeTreatments = useQuery(
    api.treatmentPlans.getWithDetailsByPatientId,
    patientProfile?._id ? { patientId: patientProfile._id as any } : "skip"
  );

  const activeMedications = useQuery(
    api.medications.getActiveByPatientId,
    patientProfile?._id ? { patientId: patientProfile._id as any } : "skip"
  );

  // Fetch upcoming appointments
  const upcomingAppointments = useQuery(
    api.appointments.getUpcomingByPatient,
    patientProfile?._id ? { patientId: patientProfile._id as any } : "skip"
  );

  // Profiles are now complete after comprehensive registration

  useEffect(() => {
    if (status === "loading") return;

    if (!session || session.user.role !== "patient") {
      router.push("/auth/login");
    }
  }, [session, status, router]);

  // Show loading skeleton while session or profile is loading
  if (status === "loading" || (session?.user?.id && patientProfile === undefined)) {
    return <DashboardSkeleton />;
  }

  // Redirect if not authenticated or wrong role
  if (!session || session.user.role !== "patient") {
    return null;
  }

  // Show main dashboard - profiles are complete after registration
  return (
    <DashboardLayout>
      {patientProfile ? (
        <div className="h-full flex flex-col space-y-4">
          {/* Header */}
          <div className="flex-shrink-0 space-y-1">
            <h1 className="text-xl font-bold tracking-tight">
              Welcome back, {patientProfile?.firstName || "Patient"}!
            </h1>
            <p className="text-muted-foreground text-sm">
              Manage your health records and generate SOAP notes with AI-powered features
            </p>
          </div>

        {/* AI Features Highlight - Keep Original Impressive Design */}
        <div className="flex-shrink-0 grid gap-4 md:grid-cols-2">
          {/* SOAP Generation */}
          <Card className="p-0 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border-blue-200 dark:border-blue-800">
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                    <Sparkles className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100">
                      Generate SOAP Notes with AI
                    </h3>
                    <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300">
                      AI-Powered
                    </Badge>
                  </div>
                </div>
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  Record your voice or upload audio files to automatically generate structured clinical notes with AI assistance for accuracy and quality.
                </p>
                <div className="flex flex-col sm:flex-row gap-2">
                  <Link href="/patient/soap/history" className="flex-1">
                    <Button variant="outline" className="w-full border-blue-200 text-blue-700 hover:bg-blue-50 dark:border-blue-700 dark:text-blue-300">
                      <History className="h-4 w-4 mr-2" />
                      View History
                    </Button>
                  </Link>
                  <Link href="/patient/soap/generate" className="flex-1">
                    <Button className="w-full bg-blue-600 hover:bg-blue-700">
                      <Mic className="h-4 w-4 mr-2" />
                      Generate SOAP
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Medical Assistant */}
          <Card className="p-0 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 border-purple-200 dark:border-purple-800">
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center">
                    <Brain className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-purple-900 dark:text-purple-100">
                      AI Medical Assistant
                    </h3>
                    <Badge variant="secondary" className="text-xs bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300">
                      Smart Chat
                    </Badge>
                  </div>
                </div>
                <p className="text-sm text-purple-700 dark:text-purple-300">
                  Chat with your personal AI assistant about your medical records, SOAP notes, and health information for instant insights.
                </p>
                <Link href="/patient/assistant" className="block">
                  <Button className="w-full bg-purple-600 hover:bg-purple-700">
                    <Bot className="h-4 w-4 mr-2" />
                    Chat with Assistant
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-5 gap-4">
          {patientProfile && (
            <div className="lg:col-span-3">
              <TreatmentOverview patientId={patientProfile._id} />
            </div>
          )}

          {/* Right Sidebar - Upcoming Appointments & Quick Actions - Takes 2 columns */}
          <div className="lg:col-span-2 flex flex-col space-y-4 min-h-0">
            {/* Upcoming Appointments */}
            <Card className="flex-1 min-h-0 flex flex-col gap-0">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Upcoming Appointments
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-1 min-h-0 flex flex-col p-0">
                <div className="p-4 flex-1 min-h-0">
                  {!upcomingAppointments || upcomingAppointments.length === 0 ? (
                    <div className="text-center py-6">
                      <Calendar className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground mb-3">No upcoming appointments</p>
                      <Link href="/patient/appointments/book">
                        <Button size="sm" className="h-8 px-3 text-xs">
                          Book Appointment
                        </Button>
                      </Link>
                    </div>
                  ) : (
                    <div className="space-y-3 h-full overflow-y-auto">
                      {upcomingAppointments.slice(0, 3).map((appointment) => (
                        <div
                          key={appointment._id}
                          className="p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800"
                        >
                          <div className="flex items-center justify-between mb-1">
                            <div className="font-medium text-sm text-blue-900 dark:text-blue-100">
                              Dr. {appointment.doctor?.firstName} {appointment.doctor?.lastName}
                            </div>
                            <Badge variant="outline" className="text-xs h-5 border-blue-300 text-blue-700">
                              {appointment.status}
                            </Badge>
                          </div>
                          <div className="text-xs text-blue-700 dark:text-blue-300 flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {new Date(appointment.appointmentDateTime).toLocaleDateString()} at{' '}
                            {new Date(appointment.appointmentDateTime).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </div>
                          <div className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                            {appointment.appointmentType.replace('_', ' ')} • {appointment.duration} min
                          </div>
                        </div>
                      ))}
                      {upcomingAppointments.length > 3 && (
                        <div className="pt-2">
                          <Link href="/patient/appointments">
                            <Button variant="outline" size="sm" className="w-full">
                              <Calendar className="h-3 w-3 mr-2" />
                              View All Appointments
                            </Button>
                          </Link>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="flex-shrink-0 gap-1">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="p-3 pt-0">
                <div className="grid grid-cols-2">
                  <ActionCard
                    title="Chat with Doctors"
                    description="Direct messaging"
                    icon={<MessageCircle className="h-4 w-4" />}
                    href="/patient/chat"
                    variant="compact"
                    className="border-0 shadow-none"
                  />
                  <ActionCard
                    title="Book Appointment"
                    description="Schedule visit"
                    icon={<Calendar className="h-4 w-4" />}
                    href="/patient/appointments/book"
                    variant="compact"
                    className="border-0 shadow-none"
                  />
                  <ActionCard
                    title="Medical Records"
                    description="View history"
                    icon={<FileText className="h-4 w-4" />}
                    href="/patient/records"
                    variant="compact"
                    className="border-0 shadow-none"
                  />
                  <ActionCard
                    title="Profile Settings"
                    description="Update info"
                    icon={<UserCheck className="h-4 w-4" />}
                    href="/patient/settings/profile"
                    variant="compact"
                    className="border-0 shadow-none"
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      ) : (
        <div className="h-full flex items-center justify-center">
          <div className="text-center space-y-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="text-muted-foreground">Loading your profile...</p>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}