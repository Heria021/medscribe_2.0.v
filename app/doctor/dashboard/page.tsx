"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useQuery } from "convex/react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, Calendar, FileText, Stethoscope, Activity } from "lucide-react";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { DoctorProfileCompletion } from "@/components/doctor/doctor-profile-completion";
import { DashboardStats } from "@/components/dashboard/dashboard-stats";
import { ScheduledAppointments } from "@/components/doctor/scheduled-appointments";
import { ActionCard, ActionCardGrid } from "@/components/ui/action-card";
import { api } from "@/convex/_generated/api";

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
      <div className="space-y-4">
        {/* Welcome Header */}
        <div className="space-y-2">
          <h1 className="text-xl font-bold tracking-tight">
            Welcome back, Dr. {session.user.name?.split(' ')[1] || session.user.name || 'Doctor'}!
          </h1>
          <p className="text-muted-foreground text-sm">
            Manage your patients, appointments, and medical records
          </p>
        </div>

        {/* Profile Completion */}
        <DoctorProfileCompletion doctorProfile={doctorProfile} />

        {/* Enhanced Stats Cards */}
        <DashboardStats userRole="doctor" />

        {/* Today's Schedule */}
        {doctorProfile && (
          <ScheduledAppointments doctorId={doctorProfile._id} />
        )}

        {/* Quick Actions */}
        <div className="space-y-2">
          <h2 className="text-lg font-semibold text-foreground">Quick Actions</h2>
          <p className="text-sm text-muted-foreground">Common tasks and features</p>
        </div>

        <ActionCardGrid columns={4}>
          <ActionCard
            title="Manage Patients"
            description="View and manage patient records"
            icon={<Users className="h-4 w-4" />}
            href="/doctor/patients"
            className="border shadow-none"
          />
          <ActionCard
            title="View Appointments"
            description="Check your schedule"
            icon={<Calendar className="h-4 w-4" />}
            href="/doctor/appointments"
            className="border shadow-none"
          />
          <ActionCard
            title="Review SOAP Notes"
            description="Shared medical records"
            icon={<FileText className="h-4 w-4" />}
            href="/doctor/shared-soap"
            className="border shadow-none"
          />
          <ActionCard
            title="Manage Referrals"
            description="Patient referrals and consultations"
            icon={<Stethoscope className="h-4 w-4" />}
            href="/doctor/referrals"
            className="border shadow-none"
          />
        </ActionCardGrid>

        {/* Recent Activity */}
        <Card className="border shadow-none">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg font-semibold">Recent Activity</CardTitle>
                <CardDescription className="text-sm text-muted-foreground">
                  Latest updates and notifications
                </CardDescription>
              </div>
              <Button variant="outline" size="sm">
                <Activity className="h-4 w-4 mr-2" />
                View All
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-center py-8 text-center">
                <div className="space-y-2">
                  <Activity className="h-12 w-12 text-muted-foreground mx-auto" />
                  <p className="text-sm text-muted-foreground">No recent activity</p>
                  <p className="text-xs text-muted-foreground">
                    Patient interactions and updates will appear here
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
