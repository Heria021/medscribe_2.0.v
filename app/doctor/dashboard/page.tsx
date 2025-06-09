"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useQuery } from "convex/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Users, Calendar, FileText, Stethoscope, Activity, Brain, Bot } from "lucide-react";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { DoctorProfileCompletion } from "@/components/doctor/doctor-profile-completion";
import { ScheduledAppointments } from "@/components/doctor/scheduled-appointments";
import { ActionCard } from "@/components/ui/action-card";
import { api } from "@/convex/_generated/api";
import Link from "next/link";

export default function DoctorDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // Get doctor profile
  const doctorProfile = useQuery(
    api.doctors.getDoctorProfile,
    session?.user?.id ? { userId: session.user.id as any } : "skip"
  );

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

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!session || session.user.role !== "doctor") {
    return null;
  }

  return (
    <DashboardLayout>
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

        {/* Profile Completion */}
        <div className="flex-shrink-0">
          <DoctorProfileCompletion doctorProfile={doctorProfile} />
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
    </DashboardLayout>
  );
}
