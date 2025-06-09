"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useQuery } from "convex/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { UserCheck, Calendar, FileText, Mic, History, Bot, Activity, Sparkles, Brain, Zap } from "lucide-react";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { ActionCard } from "@/components/ui/action-card";
import { ScheduledAppointments } from "@/components/patient/scheduled-appointments";
import { TreatmentOverview } from "@/components/patient/treatment-overview";

import { api } from "@/convex/_generated/api";
import Link from "next/link";

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



  useEffect(() => {
    if (status === "loading") return;

    if (!session || session.user.role !== "patient") {
      router.push("/auth/login");
    }
  }, [session, status, router]);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!session || session.user.role !== "patient") {
    return null;
  }

  return (
    <DashboardLayout>
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
        <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-4 gap-3">
          {/* Appointments & Treatments - Takes 3 columns */}
          <div className="lg:col-span-3 flex flex-col space-y-3 min-h-0">
            {/* Scheduled Appointments */}
            {/* {patientProfile && (
              <div className="flex-1 min-h-0">
                <ScheduledAppointments patientId={patientProfile._id} />
              </div>
            )} */}

            {/* Treatment Overview */}
            {patientProfile && (
              <div className="flex-1 min-h-0">
                <TreatmentOverview patientId={patientProfile._id} />
              </div>
            )}
          </div>

          {/* Right Sidebar - Health Overview & Quick Actions */}
          <div className="flex flex-col space-y-6 min-h-0">
            {/* Health Overview */}
            <Card className="flex-shrink-0">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Activity className="h-4 w-4" />
                  Health Overview
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-green-50 dark:bg-green-950/20 rounded-lg">
                    <div className="text-lg font-bold text-green-700 dark:text-green-300">
                      {activeTreatments?.filter(t => t.status === 'active').length || 0}
                    </div>
                    <div className="text-xs text-green-600 dark:text-green-400">Active Treatments</div>
                  </div>
                  <div className="text-center p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                    <div className="text-lg font-bold text-blue-700 dark:text-blue-300">
                      {activeMedications?.length || 0}
                    </div>
                    <div className="text-xs text-blue-600 dark:text-blue-400">Medications</div>
                  </div>
                </div>
                <div className="pt-2">
                  <Link href="/patient/treatments">
                    <Button variant="outline" size="sm" className="w-full">
                      <Activity className="h-3 w-3 mr-2" />
                      View All Treatments
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="flex-1 min-h-0 flex flex-col">
              <CardHeader className="pb-2 flex-shrink-0">
                <CardTitle className="text-sm">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="p-3 pt-0">
                <div className="grid grid-cols-2 gap-2">
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
                  <ActionCard
                    title="My Treatments"
                    description="View plans"
                    icon={<Activity className="h-4 w-4" />}
                    href="/patient/treatments"
                    variant="compact"
                    className="border-0 shadow-none"
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}