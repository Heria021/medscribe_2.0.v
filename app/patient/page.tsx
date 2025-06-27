"use client";

import { useSession } from "next-auth/react";
import { useQuery } from "convex/react";
import { UserCheck, Calendar, FileText, Mic, History, Bot, Sparkles, Brain, Pill, MessageCircle, CloudSun } from "lucide-react";
import { 
  FeatureCard, 
  AppointmentSection, 
  QuickActionGrid, 
  HealthTipCard, 
  DashboardSkeleton,
  type Appointment,
  type QuickAction
} from "@/app/patient/_components/dashboard";
import { TreatmentOverview } from "@/components/patient/treatment-overview";
import { api } from "@/convex/_generated/api";
import { cn } from "@/lib/utils";

export default function PatientDashboard() {
  const { data: session } = useSession();

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



  // Fetch upcoming appointments
  const upcomingAppointments = useQuery(
    api.appointments.getUpcomingByPatient,
    patientProfile?._id ? { patientId: patientProfile._id as any } : "skip"
  );

  // Show loading skeleton while session or profile is loading
  if (session?.user?.id && patientProfile === undefined) {
    return <DashboardSkeleton />;
  }

  // Handle error states
  if (!session?.user?.id) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-muted-foreground">Unable to load user session</p>
        </div>
      </div>
    );
  }

  if (patientProfile === null) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-muted-foreground">Patient profile not found</p>
        </div>
      </div>
    );
  }

  // Prepare data for components
  const quickActions: QuickAction[] = [
    {
      title: "Chat with Doctors",
      description: "Direct messaging",
      icon: <MessageCircle className="h-4 w-4" />,
      href: "/patient/chat"
    },
    {
      title: "Book Appointment",
      description: "Schedule visit",
      icon: <Calendar className="h-4 w-4" />,
      href: "/patient/appointments/book"
    },
    {
      title: "Medical Records",
      description: "View history",
      icon: <FileText className="h-4 w-4" />,
      href: "/patient/records"
    },
    {
      title: "Profile Settings",
      description: "Update info",
      icon: <UserCheck className="h-4 w-4" />,
      href: "/patient/settings/profile"
    }
  ];

  // Convert appointments to the expected format
  const appointments: Appointment[] = upcomingAppointments?.map(appointment => ({
    _id: appointment._id,
    doctor: appointment.doctor ? {
      firstName: appointment.doctor.firstName,
      lastName: appointment.doctor.lastName
    } : undefined,
    appointmentDateTime: appointment.appointmentDateTime.toString(),
    status: appointment.status,
    reason: (appointment as any).reason || undefined
  })) || [];

  return (
    <div className="h-full flex flex-col overflow-hidden  space-y-4">
      {/* Header */}
      <div className="flex-shrink-0">
        <h1 className="text-xl font-bold tracking-tight">
          Welcome back, {patientProfile?.firstName || "Patient"}!
        </h1>
        <p className="text-muted-foreground text-sm">
          Manage your health records and generate SOAP notes with AI-powered features
        </p>
      </div>

      {/* Main Features Layout: 1/2 SOAP + 1/4 AI Assistant + 1/4 Order Medication */}
      <div className="flex-shrink-0 grid gap-4 lg:grid-cols-4">
        {/* SOAP Generation - Takes 2 columns (1/2) */}
        <div className="lg:col-span-2">
          <FeatureCard
            title="Generate SOAP Notes with AI"
            description="Record your voice or upload audio files to automatically generate structured clinical notes with AI assistance for accuracy and quality."
            icon={<Sparkles className="h-5 w-5 text-white" />}
            badge="AI-Powered"
            gradient={{
              from: "from-blue-50",
              to: "to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20",
              border: "border-blue-200 dark:border-blue-800",
              iconBg: "bg-blue-500",
              textColor: "text-blue-900 dark:text-blue-100",
              badgeColor: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300"
            }}
            actions={{
              secondary: {
                label: "View History",
                href: "/patient/soap/history",
                icon: <History className="h-4 w-4 mr-2" />
              },
              primary: {
                label: "Generate SOAP",
                href: "/patient/soap/generate",
                icon: <Mic className="h-4 w-4 mr-2" />
              }
            }}
          />
        </div>

        {/* AI Medical Assistant - Takes 1 column (1/4) */}
        <div className="lg:col-span-1">
          <FeatureCard
            title="AI Medical Assistant"
            description="Chat with your personal AI assistant for medical insights."
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
                href: "/patient/assistant",
                icon: <Bot className="h-3 w-3 mr-2" />
              }
            }}
          />
        </div>

        {/* Order Medication - Takes 1 column (1/4) */}
        <div className="lg:col-span-1">
          <FeatureCard
            title="Order Medication"
            description="Order basic medications from your preferred pharmacy."
            icon={<Pill className="h-4 w-4 text-white" />}
            badge="Pharmacy"
            size="compact"
            gradient={{
              from: "from-green-50",
              to: "to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20",
              border: "border-green-200 dark:border-green-800",
              iconBg: "bg-green-500",
              textColor: "text-green-900 dark:text-green-100",
              badgeColor: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
            }}
            actions={{
              secondary: {
                label: "Coming Soon",
                href: "#",
                icon: <Pill className="h-3 w-3 mr-2" />,
                disabled: true
              }
            }}
          />
        </div>
      </div>

      {/* Additional Actions & Weather Tips - Compact */}
      <div className="flex-shrink-0 grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Health Tip Card */}
        <HealthTipCard
          title="Health Tips"
          subtitle="72°F • Good air quality"
          tip="Perfect weather for outdoor activities. Stay hydrated and enjoy the fresh air!"
          icon={<CloudSun className="h-4 w-4 text-white" />}
          gradient={{
            from: "from-sky-50",
            to: "to-cyan-50 dark:from-sky-950/20 dark:to-cyan-950/20",
            border: "border-sky-200 dark:border-sky-800",
            iconBg: "bg-sky-500",
            textColor: "text-sky-900 dark:text-sky-100"
          }}
        />

        {/* Appointments Section */}
        <AppointmentSection
          appointments={appointments}
          title="Appointments & Records"
          description="Quick access to your healthcare"
          icon={<Calendar className="h-4 w-4 text-white" />}
          gradient={{
            from: "from-orange-50",
            to: "to-amber-50 dark:from-orange-950/20 dark:to-amber-950/20",
            border: "border-orange-200 dark:border-orange-800",
            iconBg: "bg-orange-500",
            textColor: "text-orange-900 dark:text-orange-100",
            itemBg: "bg-orange-100/50 dark:bg-orange-900/20",
            itemBorder: "border-orange-200 dark:border-orange-700"
          }}
          emptyState={{
            icon: <Calendar className="h-8 w-8" />,
            message: "No upcoming appointments",
            actionLabel: "Book Appointment",
            actionHref: "/patient/appointments/book"
          }}
          viewAllHref="/patient/appointments"
          maxItems={3}
        />
      </div>

      {/* Main Content Grid - Treatment + Quick Actions */}
      <div className="flex-1 min-h-0 overflow-hidden">
        <div className="h-full grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Treatment Section - 1/3 width */}
          {patientProfile && activeTreatments && activeTreatments.length > 0 && (
            <div className="lg:col-span-1 min-h-0 overflow-hidden">
              <TreatmentOverview patientId={patientProfile._id} />
            </div>
          )}

          {/* Quick Actions - Takes remaining space */}
          <div className={cn(
            "lg:col-span-1 min-h-0 overflow-hidden",
            patientProfile && activeTreatments && activeTreatments.length > 0
              ? "lg:col-start-2"
              : "lg:col-span-2"
          )}>
            <QuickActionGrid
              title="Quick Actions"
              actions={quickActions}
              columns={2}
              variant="compact"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
