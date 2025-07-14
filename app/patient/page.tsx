"use client";

import { useSession } from "next-auth/react";
import { useQuery } from "convex/react";
import { Calendar, Mic, History, Bot, Sparkles, Brain, Pill, CloudSun, Cloud, Sun, CloudRain, Wind } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import {
  FeatureCard,
  AppointmentSection,
  HealthTipCard,
  TreatmentOverview,
  type Appointment
} from "@/app/patient/_components/dashboard";
import { api } from "@/convex/_generated/api";

// Weather-based health tips utility
function getWeatherHealthTip() {
  const tips = [
    {
      weather: "Sunny",
      temp: "75°F",
      condition: "Clear skies",
      icon: <Sun className="h-4 w-4 text-primary-foreground" />,
      tip: "Perfect day for outdoor exercise! UV protection recommended."
    },
    {
      weather: "Partly Cloudy",
      temp: "72°F",
      condition: "Good air quality",
      icon: <CloudSun className="h-4 w-4 text-primary-foreground" />,
      tip: "Ideal weather for walking or light outdoor activities."
    },
    {
      weather: "Cloudy",
      temp: "68°F",
      condition: "Overcast",
      icon: <Cloud className="h-4 w-4 text-primary-foreground" />,
      tip: "Great for indoor workouts or yoga. Stay hydrated!"
    },
    {
      weather: "Rainy",
      temp: "65°F",
      condition: "Light rain",
      icon: <CloudRain className="h-4 w-4 text-primary-foreground" />,
      tip: "Perfect for indoor meditation or stretching exercises."
    },
    {
      weather: "Windy",
      temp: "70°F",
      condition: "Breezy",
      icon: <Wind className="h-4 w-4 text-primary-foreground" />,
      tip: "Good for brisk walks. Protect eyes from dust and debris."
    }
  ];

  // Simulate different weather conditions (in real app, this would come from weather API)
  const randomIndex = Math.floor(Date.now() / (1000 * 60 * 60 * 6)) % tips.length; // Changes every 6 hours
  return tips[randomIndex];
}

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
    return (
      <div className="h-full flex flex-col p-4 space-y-4">
        {/* Header Skeleton */}
        <div className="flex-shrink-0 space-y-2">
          <Skeleton className="h-7 w-64" />
          <Skeleton className="h-4 w-96" />
        </div>

        {/* Main Features Layout Skeleton */}
        <div className="flex-shrink-0 grid gap-4 lg:grid-cols-4">
          {/* SOAP Generation - 2 columns */}
          <div className="lg:col-span-2">
            <Skeleton className="h-48 w-full rounded-lg" />
          </div>
          {/* AI Assistant - 1 column */}
          <div className="lg:col-span-1">
            <Skeleton className="h-48 w-full rounded-lg" />
          </div>
          {/* Order Medication - 1 column */}
          <div className="lg:col-span-1">
            <Skeleton className="h-48 w-full rounded-lg" />
          </div>
        </div>

        {/* Main Content Grid Skeleton */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-4 overflow-hidden">
          {/* Left Column - Health Tips + Quick Actions */}
          <div className="flex flex-col h-full overflow-hidden">
            <div className="flex-1 overflow-y-auto">
              <Skeleton className="h-full w-full rounded-lg" />
            </div>
            <div className="flex-shrink-0 mt-4">
              <Skeleton className="h-32 w-full rounded-lg" />
            </div>
          </div>

          {/* Middle Column - Treatment Overview */}
          <div className="flex flex-col h-full overflow-hidden">
            <div className="flex-1 overflow-y-auto">
              <Skeleton className="h-full w-full rounded-lg" />
            </div>
          </div>

          {/* Right Column - Appointments */}
          <div className="flex flex-col h-full overflow-hidden">
            <div className="flex-1 overflow-y-auto">
              <Skeleton className="h-full w-full rounded-lg" />
            </div>
          </div>
        </div>
      </div>
    );
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

  // Get current weather-based health tip
  const weatherTip = getWeatherHealthTip();

  return (
    <div className="h-full flex flex-col p-4 space-y-4">
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
          {patientProfile ? (
            <FeatureCard
              title="Generate SOAP Notes with AI"
              description="Record your voice or upload audio files to automatically generate structured clinical notes with AI assistance for accuracy and quality."
              icon={<Sparkles className="h-5 w-5 text-primary-foreground" />}
              badge="AI-Powered"
              gradient={{
                from: "bg-background",
                to: "",
                border: "border-border",
                iconBg: "bg-primary",
                textColor: "text-foreground",
                badgeColor: "bg-secondary text-secondary-foreground"
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
          ) : (
            <Skeleton className="h-48 w-full rounded-lg" />
          )}
        </div>

        {/* AI Medical Assistant - Takes 2 columns (1/2) */}
        <div className="lg:col-span-2">
          {patientProfile ? (
            <FeatureCard
              title="AI Medical Assistant"
              description="Chat with your personal AI assistant for medical insights, health questions, symptom analysis, and personalized health recommendations with advanced AI capabilities."
              icon={<Brain className="h-5 w-5 text-primary-foreground" />}
              badge="Smart Chat"
              gradient={{
                from: "bg-background",
                to: "",
                border: "border-border",
                iconBg: "bg-primary",
                textColor: "text-foreground",
                badgeColor: "bg-secondary text-secondary-foreground"
              }}
              actions={{
                secondary: {
                  label: "Chat History",
                  href: "/patient/assistant/history",
                  icon: <History className="h-4 w-4 mr-2" />
                },
                primary: {
                  label: "Chat with Assistant",
                  href: "/patient/assistant",
                  icon: <Bot className="h-4 w-4 mr-2" />
                }
              }}
            />
          ) : (
            <Skeleton className="h-48 w-full rounded-lg" />
          )}
        </div>
      </div>

      {/* New 3-Column Grid: Takes full remaining space */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-4 overflow-hidden">
        {/* Left Column - Health Tips + Order Medication */}
        <div className="flex flex-col h-full overflow-hidden">
          <div className="flex-1 overflow-y-auto">
            {patientProfile ? (
              <HealthTipCard
                title="Weather & Health"
                subtitle={`${weatherTip.temp} • ${weatherTip.condition}`}
                tip={weatherTip.tip}
                icon={weatherTip.icon}
                gradient={{
                  from: "bg-background",
                  to: "",
                  border: "border-border",
                  iconBg: "bg-primary",
                  textColor: "text-foreground"
                }}
                className="h-full"
              />
            ) : (
              <Skeleton className="h-full w-full rounded-lg" />
            )}
          </div>
          <div className="flex-shrink-0 mt-4">
            {patientProfile ? (
              <FeatureCard
                title="Order Medication"
                description="Order basic medications from your preferred pharmacy with prescription management and delivery tracking."
                icon={<Pill className="h-5 w-5 text-primary-foreground" />}
                badge="Pharmacy"
                gradient={{
                  from: "bg-background",
                  to: "",
                  border: "border-border",
                  iconBg: "bg-primary",
                  textColor: "text-foreground",
                  badgeColor: "bg-secondary text-secondary-foreground"
                }}
                actions={{
                  secondary: {
                    label: "Order History",
                    href: "/patient/medications/history",
                    icon: <History className="h-4 w-4 mr-2" />
                  },
                  primary: {
                    label: "Order Medication",
                    href: "/patient/medications/order",
                    icon: <Pill className="h-4 w-4 mr-2" />
                  }
                }}
              />
            ) : (
              <Skeleton className="h-32 w-full rounded-lg" />
            )}
          </div>
        </div>

        {/* Middle Column - Treatment Overview */}
        <div className="flex flex-col h-full overflow-hidden">
          <div className="flex-1 overflow-y-auto">
            {patientProfile === undefined ? (
              <Skeleton className="h-full w-full rounded-lg" />
            ) : patientProfile && activeTreatments && activeTreatments.length > 0 ? (
              <TreatmentOverview
                patientId={patientProfile._id}
                gradient={{
                  from: "bg-background",
                  to: "",
                  border: "border-border",
                  iconBg: "bg-primary",
                  textColor: "text-foreground",
                  itemBg: "bg-muted",
                  itemBorder: "border-border"
                }}
              />
            ) : null}
          </div>
        </div>

        {/* Right Column - Appointments Only */}
        <div className="flex flex-col h-full overflow-hidden">
          <div className="flex-1 overflow-y-auto">
            {patientProfile === undefined ? (
              <Skeleton className="h-full w-full rounded-lg" />
            ) : (
              <AppointmentSection
                appointments={appointments}
                title="Upcoming Appointments"
                description="Your scheduled visits"
                icon={<Calendar className="h-4 w-4 text-primary-foreground" />}
                gradient={{
                  from: "bg-background",
                  to: "",
                  border: "border-border",
                  iconBg: "bg-primary",
                  textColor: "text-foreground",
                  itemBg: "bg-muted",
                  itemBorder: "border-border"
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
            )}
          </div>
        </div>
      </div>
    </div>
  );
}