"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Calendar, Clock, Video, MapPin, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";

export default function TodaySchedulePage() {
  const { data: session, status } = useSession();
  const router = useRouter();

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

  // Mock today's appointments
  const todayAppointments = [
    {
      id: 1,
      patient: "Sarah Johnson",
      time: "09:00 AM",
      duration: "30 min",
      type: "Follow-up",
      status: "Confirmed",
      mode: "In-person",
      location: "Room 205",
      notes: "Blood pressure check-up",
    },
    {
      id: 2,
      patient: "Michael Chen",
      time: "10:30 AM",
      duration: "45 min",
      type: "Consultation",
      status: "Confirmed",
      mode: "Video Call",
      location: "Online",
      notes: "Diabetes management review",
    },
    {
      id: 3,
      patient: "Emily Davis",
      time: "02:00 PM",
      duration: "30 min",
      type: "Check-up",
      status: "Pending",
      mode: "In-person",
      location: "Room 203",
      notes: "Annual physical examination",
    },
    {
      id: 4,
      patient: "Robert Wilson",
      time: "03:30 PM",
      duration: "60 min",
      type: "Initial Consultation",
      status: "Confirmed",
      mode: "In-person",
      location: "Room 205",
      notes: "New patient intake",
    },
  ];

  const currentTime = new Date();
  const currentHour = currentTime.getHours();

  const getAppointmentStatus = (timeString: string) => {
    const appointmentHour = parseInt(timeString.split(":")[0]);
    const isPM = timeString.includes("PM");
    const hour24 = isPM && appointmentHour !== 12 ? appointmentHour + 12 : appointmentHour;
    
    if (hour24 < currentHour) return "completed";
    if (hour24 === currentHour) return "current";
    return "upcoming";
  };

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
                    {todayAppointments.filter(apt => getAppointmentStatus(apt.time) === "completed").length}
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
                    {todayAppointments.filter(apt => getAppointmentStatus(apt.time) === "upcoming").length}
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
                    {todayAppointments.filter(apt => apt.status === "Pending").length}
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
            <div className="space-y-4">
              {todayAppointments.map((appointment, index) => {
                const status = getAppointmentStatus(appointment.time);
                return (
                  <div 
                    key={appointment.id}
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
                      <span className="text-sm font-medium">{appointment.time}</span>
                      <span className="text-xs text-muted-foreground">{appointment.duration}</span>
                    </div>

                    {/* Patient Info */}
                    <div className="flex items-center gap-3 flex-1">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src="" alt={appointment.patient} />
                        <AvatarFallback>
                          {appointment.patient.split(" ").map(n => n[0]).join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <h4 className="font-medium">{appointment.patient}</h4>
                        <p className="text-sm text-muted-foreground">{appointment.type}</p>
                        <p className="text-xs text-muted-foreground mt-1">{appointment.notes}</p>
                      </div>
                    </div>

                    {/* Location & Status */}
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        {appointment.mode === "Video Call" ? (
                          <Video className="h-4 w-4 text-blue-600" />
                        ) : (
                          <MapPin className="h-4 w-4 text-green-600" />
                        )}
                        <span className="text-sm text-muted-foreground">{appointment.location}</span>
                      </div>
                      
                      <Badge 
                        variant={appointment.status === "Confirmed" ? "default" : "secondary"}
                        className="text-xs"
                      >
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
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
