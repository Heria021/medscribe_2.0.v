"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useQuery } from "convex/react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Calendar, Clock, Video, MapPin, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { api } from "@/convex/_generated/api";

export default function TodaySchedulePage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // Get doctor profile
  const doctorProfile = useQuery(
    api.doctors.getDoctorProfile,
    session?.user?.id ? { userId: session.user.id as any } : "skip"
  );

  // Get today's appointments
  const todayAppointments = useQuery(
    api.appointments.getDoctorTodayAppointments,
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

  // Helper functions
  const getStatusColor = (status: string) => {
    switch (status) {
      case "scheduled":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400";
      case "confirmed":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
      case "in_progress":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400";
      case "completed":
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400";
      case "cancelled":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400";
    }
  };

  const formatTime = (time: string) => {
    // Convert 24-hour format to 12-hour format
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const getAppointmentStatus = (appointmentTime: string) => {
    const now = new Date();
    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

    if (appointmentTime < currentTime) {
      return "completed";
    } else if (appointmentTime === currentTime) {
      return "current";
    } else {
      return "upcoming";
    }
  };

  // Loading state
  if (todayAppointments === undefined) {
    return (
      <DashboardLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link href="/doctor/appointments">
            <Button variant="outline" size="sm" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              All Appointments
            </Button>
          </Link>
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Today's Schedule</h2>
            <p className="text-muted-foreground">
              {new Date().toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
          </div>
        </div>

        {/* Schedule Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="border-0 shadow-md">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total</p>
                  <p className="text-2xl font-bold">{todayAppointments.length}</p>
                </div>
                <Calendar className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Completed</p>
                  <p className="text-2xl font-bold">
                    {todayAppointments.filter(apt => getAppointmentStatus(apt.appointmentTime) === "completed").length}
                  </p>
                </div>
                <Calendar className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Upcoming</p>
                  <p className="text-2xl font-bold">
                    {todayAppointments.filter(apt => getAppointmentStatus(apt.appointmentTime) === "upcoming").length}
                  </p>
                </div>
                <Clock className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Pending</p>
                  <p className="text-2xl font-bold">
                    {todayAppointments.filter(apt => apt.status === "scheduled").length}
                  </p>
                </div>
                <Clock className="h-8 w-8 text-red-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Appointments Timeline */}
        <Card className="border-0 shadow-md">
          <CardHeader>
            <CardTitle>Appointment Timeline</CardTitle>
            <CardDescription>
              Your appointments for today in chronological order
            </CardDescription>
          </CardHeader>
          <CardContent>
            {todayAppointments.length === 0 ? (
              <div className="flex items-center justify-center py-8 text-center">
                <div className="space-y-2">
                  <Calendar className="h-12 w-12 text-muted-foreground mx-auto" />
                  <p className="text-sm text-muted-foreground">No appointments scheduled for today</p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {todayAppointments.map((appointment, index) => {
                  const status = getAppointmentStatus(appointment.appointmentTime);
                  return (
                    <div
                      key={appointment._id}
                      className={`relative flex items-center gap-6 p-4 rounded-lg border transition-colors ${
                        status === "current"
                          ? "border-primary bg-primary/5"
                          : status === "completed"
                          ? "border-green-200 bg-green-50 dark:bg-green-950/20"
                          : "border-border hover:bg-muted/50"
                      }`}
                    >
                      {/* Timeline indicator */}
                      <div className="flex flex-col items-center">
                        <div className={`w-3 h-3 rounded-full ${
                          status === "current"
                            ? "bg-primary"
                            : status === "completed"
                            ? "bg-green-600"
                            : "bg-muted-foreground"
                        }`} />
                        {index < todayAppointments.length - 1 && (
                          <div className="w-px h-16 bg-border mt-2" />
                        )}
                      </div>

                      {/* Time */}
                      <div className="flex flex-col items-center min-w-[80px]">
                        <span className="text-sm font-medium">{formatTime(appointment.appointmentTime)}</span>
                        <span className="text-xs text-muted-foreground">
                          {appointment.duration ? `${appointment.duration} min` : '30 min'}
                        </span>
                      </div>

                      {/* Patient Info */}
                      <div className="flex items-center gap-3 flex-1">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={`/avatars/patient-${appointment.patient?.firstName?.toLowerCase()}.jpg`} />
                          <AvatarFallback className="bg-primary/10 text-primary">
                            {appointment.patient?.firstName?.[0]}{appointment.patient?.lastName?.[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <h4 className="font-medium">
                            {appointment.patient?.firstName} {appointment.patient?.lastName}
                          </h4>
                          <p className="text-sm text-muted-foreground">{appointment.appointmentType}</p>
                          {appointment.notes && (
                            <p className="text-xs text-muted-foreground mt-1">{appointment.notes}</p>
                          )}
                        </div>
                      </div>

                      {/* Location & Status */}
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          {appointment.appointmentLocation?.toLowerCase().includes("virtual") ||
                           appointment.appointmentLocation?.toLowerCase().includes("online") ? (
                            <Video className="h-4 w-4 text-blue-600" />
                          ) : (
                            <MapPin className="h-4 w-4 text-green-600" />
                          )}
                          <span className="text-sm text-muted-foreground">
                            {appointment.appointmentLocation || "TBD"}
                          </span>
                        </div>

                        <Badge variant="secondary" className={getStatusColor(appointment.status)}>
                          {appointment.status}
                        </Badge>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2">
                        {status === "current" && (
                          <Button size="sm" className="bg-primary">
                            Start Session
                          </Button>
                        )}
                        {status === "upcoming" && (
                          <>
                            <Button size="sm" variant="outline">
                              Reschedule
                            </Button>
                            <Button size="sm" variant="outline">
                              Contact
                            </Button>
                          </>
                        )}
                        {status === "completed" && (
                          <Button size="sm" variant="outline">
                            View Notes
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
