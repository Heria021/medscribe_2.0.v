"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useQuery } from "convex/react";
import {
  Users,
  Calendar,
  Brain,
  ArrowRight,
  Sparkles,
  FileText,
  Activity,
  Clock,
  Phone
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import Link from "next/link";

import { api } from "@/convex/_generated/api";

// Individual skeleton components matching patient dashboard structure

const PatientListSkeleton = () => (
  <Card className="h-full flex flex-col">
    <CardHeader className="p-4 pb-3 flex-shrink-0">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Skeleton className="h-8 w-8 rounded-lg" />
          <Skeleton className="h-5 w-24" />
        </div>
        <Skeleton className="h-7 w-20" />
      </div>
    </CardHeader>
    <CardContent className="p-4 pt-0 flex-1 min-h-0">
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3 p-3 rounded-lg border border-border">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="flex-1 space-y-2">
              <div className="flex items-center justify-between">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-3" />
              </div>
              <div className="flex items-center gap-2">
                <Skeleton className="h-5 w-16 rounded-md" />
                <Skeleton className="h-5 w-20 rounded-md" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </CardContent>
  </Card>
);

const AppointmentsSkeleton = () => (
  <Card className="h-full flex flex-col">
    <CardHeader className="p-4 pb-3 flex-shrink-0">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Skeleton className="h-8 w-8 rounded-lg" />
          <Skeleton className="h-5 w-32" />
        </div>
        <Skeleton className="h-7 w-20" />
      </div>
    </CardHeader>
    <CardContent className="p-4 pt-0 flex-1 min-h-0">
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="p-3 rounded-lg border border-border space-y-2">
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-16" />
            </div>
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-2/3" />
          </div>
        ))}
      </div>
    </CardContent>
  </Card>
);

// Patient List Component (simplified, no gradients)
const PatientList = ({ patients, isLoading }: { patients: any[], isLoading: boolean }) => {
  if (isLoading) return <PatientListSkeleton />;

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="p-4 pb-3 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-primary">
              <Users className="h-4 w-4 text-primary-foreground" />
            </div>
            <div>
              <h3 className="font-semibold text-base text-foreground">My Patients</h3>
            </div>
          </div>
          <Link href="/doctor/patients">
            <Button variant="outline" size="sm" className="h-7 px-3 text-xs">
              <Users className="h-3 w-3 mr-1" />
              View All
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-0 flex-1 min-h-0">
        <ScrollArea className="h-full">
          {!patients || patients.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-6 text-center">
              <div className="w-12 h-12 rounded-full flex items-center justify-center mb-3 bg-muted">
                <Users className="h-6 w-6 text-muted-foreground" />
              </div>
              <h3 className="font-medium text-sm mb-1 text-foreground">No Patients Yet</h3>
              <p className="text-xs mb-3 max-w-[180px] text-muted-foreground">
                Patients will appear here once assigned to you
              </p>
              <Link href="/doctor/patients">
                <Button size="sm" className="h-7 px-3 text-xs">View Patients</Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {patients.slice(0, 6).map((relationship) => {
                const patient = relationship.patient;
                const age = new Date().getFullYear() - new Date(patient.dateOfBirth).getFullYear();

                return (
                  <div
                    key={relationship._id}
                    className="group flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all duration-200 hover:bg-muted/50 border border-border hover:border-primary/30 hover:shadow-sm"
                    onClick={() => window.location.href = `/doctor/patients/${patient._id}`}
                  >
                    <Avatar className="h-10 w-10 flex-shrink-0 ring-2 ring-background group-hover:ring-primary/20 transition-all">
                      <AvatarFallback className="text-sm font-semibold bg-primary/10 text-primary group-hover:bg-primary/20">
                        {patient.firstName[0]}{patient.lastName[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-semibold text-sm truncate text-foreground group-hover:text-primary transition-colors">
                          {patient.firstName} {patient.lastName}
                        </h4>
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                          <ArrowRight className="h-3 w-3 text-primary" />
                        </div>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1 bg-muted/50 px-2 py-1 rounded-md">
                          <Calendar className="h-3 w-3" />
                          {age} years old
                        </span>
                        <span className="flex items-center gap-1 bg-muted/50 px-2 py-1 rounded-md truncate">
                          <Phone className="h-3 w-3" />
                          {patient.primaryPhone}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

// Appointments Component (simplified, no gradients)
const AppointmentsList = ({ doctorId, isLoading }: { doctorId: string | undefined, isLoading: boolean }) => {
  const weekAppointments = useQuery(api.appointments.getWeekByDoctor,
    doctorId ? { doctorId: doctorId as any } : "skip"
  );

  if (isLoading || !doctorId || weekAppointments === undefined) return <AppointmentsSkeleton />;

  const appointments = weekAppointments || [];
  // Fix: Check if appointments have the correct structure
  const sortedAppointments = appointments
    .filter((appointment: any) => appointment.scheduledFor) // Only include valid appointments
    .sort((a: any, b: any) => new Date(a.scheduledFor).getTime() - new Date(b.scheduledFor).getTime())
    .slice(0, 5);

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="p-4 pb-3 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-primary">
              <Calendar className="h-4 w-4 text-primary-foreground" />
            </div>
            <div>
              <h3 className="font-semibold text-base text-foreground">Upcoming Appointments</h3>
            </div>
          </div>
          <Link href="/doctor/appointments">
            <Button variant="outline" size="sm" className="h-7 px-3 text-xs">
              <Calendar className="h-3 w-3 mr-1" />
              View All
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-0 flex-1 min-h-0">
        <ScrollArea className="h-full">
          {sortedAppointments.length === 0 ? (
            <div className="flex items-center justify-center py-6 text-center">
              <div className="space-y-2">
                <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 bg-muted">
                  <Calendar className="h-6 w-6 text-muted-foreground" />
                </div>
                <p className="text-sm text-muted-foreground">No appointments this week</p>
                <Link href="/doctor/appointments">
                  <Button variant="outline" size="sm" className="h-6 px-3 text-xs">
                    Schedule Appointment
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {sortedAppointments.map((appointment: any) => (
                <div
                  key={appointment._id}
                  className="flex items-center gap-2 p-2 rounded transition-colors bg-muted/50 border border-border hover:bg-muted"
                >
                  <div className="w-1.5 h-1.5 rounded-full flex-shrink-0 bg-primary" />
                  <Avatar className="h-6 w-6 flex-shrink-0">
                    <AvatarFallback className="text-xs bg-primary/10 text-primary">
                      {appointment.patient?.firstName?.[0] || 'P'}{appointment.patient?.lastName?.[0] || 'A'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1">
                      <h4 className="text-xs font-medium truncate text-foreground">
                        {appointment.patient?.firstName || 'Patient'} {appointment.patient?.lastName || 'Appointment'}
                      </h4>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {appointment.scheduledFor ? new Date(appointment.scheduledFor).toLocaleTimeString('en-US', {
                          hour: '2-digit',
                          minute: '2-digit',
                          hour12: true
                        }) : 'Time TBD'}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

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
    if (status === "loading") return;

    if (!session) {
      router.push("/auth/login");
      return;
    }

    if (session.user.role !== "doctor") {
      router.push("/auth/login");
      return;
    }
  }, [session, status, router]);

  // Redirect if not authenticated or wrong role
  if (!session || session.user.role !== "doctor") {
    return null;
  }

  // Convert patients to the expected format
  const patients = assignedPatients?.filter(p => p.patient).map(relationship => ({
    _id: relationship._id,
    patient: {
      _id: relationship.patient!._id,
      firstName: relationship.patient!.firstName,
      lastName: relationship.patient!.lastName,
      dateOfBirth: relationship.patient!.dateOfBirth,
      primaryPhone: relationship.patient!.primaryPhone
    }
  })) || [];

  const isLoading = !doctorProfile;

  return (
    <div className="h-full flex flex-col p-4 space-y-4">
      {/* Header */}
      <div className="flex-shrink-0 space-y-1">
        <h1 className="text-xl font-bold tracking-tight text-foreground">
          Welcome back, {doctorProfile?.title ? `${doctorProfile.title} ` : "Dr. "}{doctorProfile?.lastName || "Doctor"}!
        </h1>
        <p className="text-muted-foreground text-sm">
          Manage your patients, appointments, and medical records with AI-powered insights
        </p>
      </div>

      {/* Main Features Layout: 1/2 Patient Management + 1/4 AI Assistant + 1/4 SOAP Review */}
      <div className="flex-shrink-0 grid gap-3 lg:grid-cols-4">
        {/* Patient Management - Takes 2 columns (1/2) */}
        <div className="lg:col-span-2">
          {isLoading ? (
            <Card className="h-48 bg-background border-border p-0">
              <CardContent className="p-4 h-full">
                <div className="flex flex-col h-full">
                  <div className="flex items-center gap-3 mb-3">
                    <Skeleton className="h-10 w-10 rounded-lg" />
                    <div className="flex-1">
                      <Skeleton className="h-5 w-32" />
                      <Skeleton className="h-4 w-20 mt-1" />
                    </div>
                  </div>
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-3/4 mb-4 flex-1" />
                  <div className="flex gap-2">
                    <Skeleton className="h-9 flex-1" />
                    <Skeleton className="h-9 flex-1" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="h-48 bg-background border-border p-0">
              <CardContent className="p-4">
                <div className="space-y-3 h-full flex flex-col">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-primary">
                      <Users className="h-4 w-4 text-primary-foreground" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-base text-foreground">
                        Patient Management Hub
                      </h3>
                      <Badge variant="secondary" className="text-xs mt-1">
                        Comprehensive Care
                      </Badge>
                    </div>
                  </div>

                  <p className="text-xs text-muted-foreground">
                    Manage your patient roster, view medical histories, track treatment progress, and coordinate care plans all in one centralized location.
                  </p>

                  <div className="flex gap-2 flex-col sm:flex-row mt-auto">
                    <Button variant="outline" size="sm" asChild className="flex-1">
                      <Link href="/doctor/patients">
                        <Users className="h-4 w-4 mr-2" />
                        View Patients
                      </Link>
                    </Button>
                    <Button size="sm" asChild className="flex-1">
                      <Link href="/doctor/patients">
                        <Activity className="h-4 w-4 mr-2" />
                        Manage Care
                      </Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* AI Assistant - Takes 1 column (1/4) */}
        <div className="lg:col-span-1">
          {isLoading ? (
            <Card className="h-48 bg-background border-border p-0">
              <CardContent className="p-4 h-full">
                <div className="flex flex-col h-full">
                  <div className="flex items-center gap-2 mb-3">
                    <Skeleton className="h-8 w-8 rounded-lg" />
                    <div className="flex-1">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-3 w-16 mt-1" />
                    </div>
                  </div>
                  <Skeleton className="h-3 w-full mb-2" />
                  <Skeleton className="h-3 w-3/4 mb-4 flex-1" />
                  <Skeleton className="h-8 w-full" />
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="h-48 bg-background border-border p-0">
              <CardContent className="p-4">
                <div className="space-y-3 h-full flex flex-col">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-primary">
                      <Brain className="h-4 w-4 text-primary-foreground" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-base text-foreground">
                        AI Medical Assistant
                      </h3>
                      <Badge variant="secondary" className="text-xs mt-1">
                        Smart Chat
                      </Badge>
                    </div>
                  </div>

                  <p className="text-xs text-muted-foreground">
                    Chat with AI about patient records, SOAP notes, and medical insights.
                  </p>

                  <div className="flex gap-2 flex-col sm:flex-row mt-auto">
                    <Button variant="outline" size="sm" asChild className="flex-1">
                      <Link href="/doctor/assistant/history">
                        <Brain className="h-4 w-4 mr-2" />
                        Chat History
                      </Link>
                    </Button>
                    <Button size="sm" asChild className="flex-1">
                      <Link href="/doctor/assistant">
                        <Brain className="h-4 w-4 mr-2" />
                        Chat Assistant
                      </Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* SOAP Review - Takes 1 column (1/4) */}
        <div className="lg:col-span-1">
          {isLoading ? (
            <Card className="h-48 bg-background border-border p-0">
              <CardContent className="p-4 h-full">
                <div className="flex flex-col h-full">
                  <div className="flex items-center gap-2 mb-3">
                    <Skeleton className="h-8 w-8 rounded-lg" />
                    <div className="flex-1">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-3 w-16 mt-1" />
                    </div>
                  </div>
                  <Skeleton className="h-3 w-full mb-2" />
                  <Skeleton className="h-3 w-3/4 mb-4 flex-1" />
                  <Skeleton className="h-8 w-full" />
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="h-48 bg-background border-border p-0">
              <CardContent className="p-4">
                <div className="space-y-3 h-full flex flex-col">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-primary">
                      <FileText className="h-4 w-4 text-primary-foreground" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-base text-foreground">
                        SOAP Notes Review
                      </h3>
                      <Badge variant="secondary" className="text-xs mt-1">
                        Clinical Records
                      </Badge>
                    </div>
                  </div>

                  <p className="text-xs text-muted-foreground">
                    Review and manage patient SOAP notes and clinical documentation.
                  </p>

                  <div className="flex gap-2 flex-col sm:flex-row mt-auto">
                    <Button variant="outline" size="sm" asChild className="flex-1">
                      <Link href="/doctor/shared-soap/history">
                        <FileText className="h-4 w-4 mr-2" />
                        SOAP History
                      </Link>
                    </Button>
                    <Button size="sm" asChild className="flex-1">
                      <Link href="/doctor/shared-soap">
                        <FileText className="h-4 w-4 mr-2" />
                        Review Notes
                      </Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Bottom Section - 2 Column Grid */}
      <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-2 gap-3">
        {/* Left Column - Patient List */}
        <div className="flex flex-col min-h-0">
          <PatientList patients={patients} isLoading={isLoading} />
        </div>

        {/* Right Column - Appointments */}
        <div className="flex flex-col min-h-0">
          <AppointmentsList doctorId={doctorProfile?._id} isLoading={isLoading} />
        </div>
      </div>
    </div>
  );
}
