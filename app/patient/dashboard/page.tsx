"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useQuery } from "convex/react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UserCheck, Calendar, FileText, Heart, Mic, History, Bot } from "lucide-react";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { ProfileCompletion } from "@/components/patient/profile-completion";
import { DashboardStats } from "@/components/dashboard/dashboard-stats";
import { ActionCard, ActionCardGrid } from "@/components/ui/action-card";
import { ScheduledAppointments } from "@/components/patient/scheduled-appointments";
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
      <div className="space-y-4">
        {/* Welcome Header */}
        <div className="space-y-2">
          <h1 className="text-xl font-bold tracking-tight">
            Welcome back, {session.user.name?.split(" ")[0] || "Patient"}!
          </h1>
          <p className="text-muted-foreground text-sm">
            Manage your health records and generate SOAP notes with AI features.
          </p>
        </div>

        {/* Profile Completion */}
        {patientProfile && <ProfileCompletion patientProfile={patientProfile} />}

        {/* Dashboard Stats */}
        {/* <DashboardStats userRole="patient" /> */}

        {/* AI Features Highlight */}
        <div className="grid gap-4 md:grid-cols-2">
          {/* SOAP Generation */}
          <Card className="border bg-muted shadow-none">
            <CardContent className="p-6 flex flex-col gap-4">
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-primary">
                  Generate SOAP Notes with AI
                </h3>
                <p className="text-sm text-muted-foreground">
                  Record your voice or upload audio files to automatically generate structured clinical notes with AI assistance for accuracy and quality.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-2">
                <Link href="/patient/soap/history" className="flex-1">
                  <Button variant={'outline'} className="w-full">
                    <History className="h-4 w-4 mr-2" />
                    View History
                  </Button>
                </Link>
                <Link href="/patient/soap/generate" className="flex-1">
                  <Button className="w-full">
                    <Mic className="h-4 w-4 mr-2" />
                    Generate SOAP
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>


          {/* Medical Assistant */}
          <Card className="border bg-muted shadow-none">
            <CardContent className="p-6 flex flex-col gap-4">
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-primary">
                  AI Medical Assistant
                </h3>
                <p className="text-sm text-muted-foreground">
                  Chat with your personal AI assistant about your medical records, SOAP notes, and health information.
                </p>
              </div>
              <Link href="/patient/assistant" className="block">
                <Button className="w-full">
                  <Bot className="h-4 w-4 mr-2" />
                  Chat with Assistant
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
        {/* Scheduled Appointments */}
        {patientProfile && (
          <ScheduledAppointments patientId={patientProfile._id} />
        )}

        {/* Quick Actions */}
        <ActionCardGrid columns={4}>
          <ActionCard
            title="Book Appointment"
            description="Schedule with your doctor"
            icon={<Calendar className="h-4 w-4" />}
            href="/patient/appointments/book"
            className="border-1 shadow-none"
          />
          <ActionCard
            title="Medical Records"
            description="View your health history"
            icon={<FileText className="h-4 w-4" />}
            href="/patient/records"
            className="border-1 shadow-none"
          />
          <ActionCard
            title="Health Tracker"
            description="Monitor vital signs"
            icon={<Heart className="h-4 w-4" />}
            href="/patient/health"
            badge="New"
            className="border-1 shadow-none"
          />
          <ActionCard
            title="Profile Settings"
            description="Update your information"
            icon={<UserCheck className="h-4 w-4" />}
            href="/patient/settings/profile"
            className="border-1 shadow-none"
          />
        </ActionCardGrid>


      </div>
    </DashboardLayout>
  );
}