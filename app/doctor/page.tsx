"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useQuery } from "convex/react";
import { Users, Calendar, FileText, Brain, MessageCircle, Settings } from "lucide-react";

import { ScheduledAppointments } from "@/components/doctor/scheduled-appointments";
import {
  DoctorFeatureCard,
  PatientListCard,
  DoctorQuickActions,
  DoctorDashboardSkeleton,
  type DoctorQuickAction,
  type PatientRelationship
} from "@/app/doctor/_components/dashboard";

import { api } from "@/convex/_generated/api";

export default function DoctorDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // Get doctor profile
  const doctorProfile = useQuery(
    api.doctors.getDoctorProfile,
    session?.user?.id ? { userId: session.user.id as any } : "skip"
  );

  // Get assigned patients for the patient list
  const assignedPatients = useQuery(
    api.doctorPatients.getPatientsByDoctor,
    doctorProfile ? { doctorId: doctorProfile._id } : "skip"
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

  // Show loading skeleton while session or profile is loading
  if (status === "loading" || (session?.user?.id && doctorProfile === undefined)) {
    return <DoctorDashboardSkeleton />;
  }

  // Redirect if not authenticated or wrong role
  if (!session || session.user.role !== "doctor") {
    return null;
  }

  // Prepare data for components
  const quickActions: DoctorQuickAction[] = [
    {
      title: "Chat with Patients",
      description: "Direct messaging",
      icon: <MessageCircle className="h-4 w-4" />,
      href: "/doctor/chat"
    },
    {
      title: "View Appointments",
      description: "Check schedule",
      icon: <Calendar className="h-4 w-4" />,
      href: "/doctor/appointments"
    },
    {
      title: "SOAP Notes",
      description: "Shared records",
      icon: <FileText className="h-4 w-4" />,
      href: "/doctor/shared-soap"
    },
    {
      title: "Profile Settings",
      description: "Update info",
      icon: <Settings className="h-4 w-4" />,
      href: "/doctor/settings/profile"
    }
  ];

  // Convert patients to the expected format
  const patients: PatientRelationship[] = assignedPatients?.filter(p => p.patient).map(relationship => ({
    _id: relationship._id,
    patient: {
      _id: relationship.patient!._id,
      firstName: relationship.patient!.firstName,
      lastName: relationship.patient!.lastName,
      dateOfBirth: relationship.patient!.dateOfBirth,
      primaryPhone: relationship.patient!.primaryPhone
    }
  })) || [];

  // Show main dashboard - profiles are complete after registration
  return (
    <>
      {doctorProfile ? (
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

          {/* Main Content Grid - 2/3 Schedule + 1/3 Sidebar */}
          <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-4 overflow-hidden">
            {/* Left Section - Weekly Schedule (Takes 2 columns) */}
            <div className="lg:col-span-2 flex flex-col h-full overflow-hidden">
              <div className="flex-1 overflow-y-auto">
                {doctorProfile && (
                  <ScheduledAppointments
                    doctorId={doctorProfile._id}
                    gradient={{
                      from: "from-blue-50",
                      to: "to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20",
                      border: "border-blue-200 dark:border-blue-800",
                      iconBg: "bg-blue-500",
                      textColor: "text-blue-900 dark:text-blue-100",
                      itemBg: "bg-blue-100/50 dark:bg-blue-900/20",
                      itemBorder: "border-blue-200 dark:border-blue-700"
                    }}
                    className="h-full"
                  />
                )}
              </div>
            </div>

            {/* Right Sidebar - AI Assistant + Patient List + Quick Actions */}
            <div className="flex flex-col h-full overflow-hidden space-y-4">
              {/* AI Assistant */}
              <div className="flex-shrink-0">
                <DoctorFeatureCard
                  title="AI Medical Assistant"
                  description="Get AI-powered insights about patients, SOAP notes, and medical records."
                  icon={<Brain className="h-4 w-4 text-white" />}
                  badge="Smart Chat"
                  size="compact"
                  gradient={{
                    from: "from-purple-50",
                    to: "to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20",
                    border: "border-purple-200 dark:border-purple-800",
                    iconBg: "bg-purple-500",
                    textColor: "text-purple-900 dark:text-purple-100",
                    badgeColor: "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300"
                  }}
                  actions={{
                    primary: {
                      label: "Chat with Assistant",
                      href: "/doctor/assistant",
                      icon: <Brain className="h-3 w-3 mr-2" />
                    }
                  }}
                />
              </div>

              {/* Patient List */}
              <div className="flex-1 overflow-hidden">
                <PatientListCard
                  title="My Patients"
                  description="Recently assigned patients"
                  patients={patients}
                  gradient={{
                    from: "from-green-50",
                    to: "to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20",
                    border: "border-green-200 dark:border-green-800",
                    iconBg: "bg-green-500",
                    textColor: "text-green-900 dark:text-green-100",
                    itemBg: "bg-green-100/50 dark:bg-green-900/20",
                    itemBorder: "border-green-200 dark:border-green-700"
                  }}
                  maxItems={6}
                  viewAllHref="/doctor/patients"
                  emptyState={{
                    icon: <Users className="h-6 w-6" />,
                    message: "No Patients Yet",
                    actionLabel: "View Patients",
                    actionHref: "/doctor/patients"
                  }}
                  className="h-full"
                />
              </div>

              {/* Quick Actions */}
              <div className="flex-shrink-0">
                <DoctorQuickActions
                  title="Quick Actions"
                  actions={quickActions}
                  gradient={{
                    from: "from-orange-50",
                    to: "to-amber-50 dark:from-orange-950/20 dark:to-amber-950/20",
                    border: "border-orange-200 dark:border-orange-800",
                    iconBg: "bg-orange-500",
                    textColor: "text-orange-900 dark:text-orange-100",
                    itemBg: "bg-orange-100/50 dark:bg-orange-900/20",
                    itemBorder: "border-orange-200 dark:border-orange-700"
                  }}
                  columns={2}
                  variant="compact"
                />
              </div>
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
    </>
  );
}
