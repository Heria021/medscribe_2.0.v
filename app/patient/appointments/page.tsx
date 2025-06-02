"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Calendar, Clock, Plus, Video, MapPin, AlertCircle, CheckCircle } from "lucide-react";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { DataTableCompact, QuickList } from "@/components/ui/data-table-compact";
import { StatusIndicator } from "@/components/ui/status-indicator";
import { ActionCard, ActionCardGrid } from "@/components/ui/action-card";
import Link from "next/link";

export default function PatientAppointmentsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "loading") return;

    if (!session) {
      router.push("/auth/login");
      return;
    }

    if (session.user.role !== "patient") {
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

  if (!session || session.user.role !== "patient") {
    return null;
  }

  // Mock appointment data
  const upcomingAppointments = [
    {
      id: 1,
      doctor: "Dr. Sarah Wilson",
      specialty: "Cardiologist",
      date: "2024-01-20",
      time: "10:00 AM",
      duration: "45 min",
      type: "Follow-up",
      mode: "In-person",
      location: "Medical Center, Room 205",
    },
    {
      id: 2,
      doctor: "Dr. Michael Brown",
      specialty: "General Practitioner",
      date: "2024-01-25",
      time: "02:30 PM",
      duration: "30 min",
      type: "Consultation",
      mode: "Video Call",
      location: "Online",
    },
  ];

  const pastAppointments = [
    {
      id: 3,
      doctor: "Dr. Sarah Wilson",
      specialty: "Cardiologist",
      date: "2024-01-10",
      time: "10:00 AM",
      type: "Check-up",
      status: "Completed",
    },
    {
      id: 4,
      doctor: "Dr. Emily Davis",
      specialty: "Dermatologist",
      date: "2023-12-15",
      time: "03:00 PM",
      type: "Consultation",
      status: "Completed",
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">My Appointments</h2>
            <p className="text-muted-foreground">
              View and manage your medical appointments
            </p>
          </div>
          <Link href="/patient/appointments/book">
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Book Appointment
            </Button>
          </Link>
        </div>

        {/* Upcoming Appointments */}
        <QuickList
          title="Upcoming Appointments"
          items={upcomingAppointments}
          emptyMessage="No upcoming appointments scheduled"
          renderItem={(appointment) => (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="flex flex-col items-center gap-1 min-w-[80px] p-2 rounded-lg bg-primary/5">
                  <div className="text-sm font-semibold">{appointment.date}</div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    {appointment.time}
                  </div>
                  <div className="text-xs text-muted-foreground">{appointment.duration}</div>
                </div>

                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10 border border-border">
                    <AvatarImage src="" alt={appointment.doctor} />
                    <AvatarFallback className="text-sm font-medium">
                      {appointment.doctor.split(" ").map(n => n[0]).join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h4 className="font-semibold">{appointment.doctor}</h4>
                    <p className="text-sm text-muted-foreground">{appointment.specialty}</p>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                      {appointment.mode === "Video Call" ? (
                        <Video className="h-3 w-3" />
                      ) : (
                        <MapPin className="h-3 w-3" />
                      )}
                      {appointment.location}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Badge variant="outline" className="text-xs">
                  {appointment.type}
                </Badge>
                <StatusIndicator
                  status="pending"
                  label="Scheduled"
                  variant="pill"
                  size="sm"
                />

                <div className="flex gap-2">
                  <Button size="sm" variant="outline">
                    Reschedule
                  </Button>
                  <Button size="sm" variant="outline">
                    Cancel
                  </Button>
                  {appointment.mode === "Video Call" && (
                    <Button size="sm">
                      Join Call
                    </Button>
                  )}
                </div>
              </div>
            </div>
          )}
        />

        {/* Past Appointments */}
        <QuickList
          title="Past Appointments"
          items={pastAppointments}
          emptyMessage="No past appointments"
          maxItems={5}
          showMore={() => router.push("/patient/appointments/history")}
          renderItem={(appointment) => (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="text-sm text-muted-foreground min-w-[80px] font-medium">
                  {appointment.date}
                </div>

                <div className="flex items-center gap-3">
                  <Avatar className="h-8 w-8 border border-border">
                    <AvatarImage src="" alt={appointment.doctor} />
                    <AvatarFallback className="text-xs font-medium">
                      {appointment.doctor.split(" ").map(n => n[0]).join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h4 className="text-sm font-semibold">{appointment.doctor}</h4>
                    <p className="text-xs text-muted-foreground">{appointment.specialty}</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <StatusIndicator
                  status="success"
                  label={appointment.status}
                  variant="pill"
                  size="sm"
                />
                <Button size="sm" variant="outline">
                  View Details
                </Button>
              </div>
            </div>
          )}
        />

        {/* Quick Actions */}
        <ActionCardGrid columns={3}>
          <ActionCard
            title="Book Appointment"
            description="Schedule a new appointment with your doctor"
            icon={<Calendar className="h-6 w-6" />}
            href="/patient/appointments/book"
            color="blue"
            variant="featured"
          />
          <ActionCard
            title="Virtual Consultation"
            description="Connect with doctors online"
            icon={<Video className="h-6 w-6" />}
            href="/patient/appointments/virtual"
            color="green"
            variant="featured"
            badge="Available"
          />
          <ActionCard
            title="Emergency"
            description="Need immediate medical attention?"
            icon={<AlertCircle className="h-6 w-6" />}
            href="/patient/emergency"
            color="red"
            variant="featured"
          />
        </ActionCardGrid>
      </div>
    </DashboardLayout>
  );
}
