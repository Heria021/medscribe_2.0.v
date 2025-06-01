"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Calendar, Clock, Plus, Video, MapPin } from "lucide-react";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";

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
          <Button className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Book Appointment
          </Button>
        </div>

        {/* Upcoming Appointments */}
        <Card className="border-0 shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Upcoming Appointments
            </CardTitle>
            <CardDescription>
              Your scheduled medical appointments
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {upcomingAppointments.map((appointment) => (
                <div 
                  key={appointment.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors gap-4"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex flex-col items-center gap-1 min-w-[80px]">
                      <div className="text-sm font-medium">{appointment.date}</div>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {appointment.time}
                      </div>
                      <div className="text-xs text-muted-foreground">{appointment.duration}</div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src="" alt={appointment.doctor} />
                        <AvatarFallback>
                          {appointment.doctor.split(" ").map(n => n[0]).join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h4 className="font-medium">{appointment.doctor}</h4>
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
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Past Appointments */}
        <Card className="border-0 shadow-md">
          <CardHeader>
            <CardTitle>Past Appointments</CardTitle>
            <CardDescription>
              Your appointment history
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {pastAppointments.map((appointment) => (
                <div 
                  key={appointment.id}
                  className="flex items-center justify-between p-3 rounded-lg border border-border"
                >
                  <div className="flex items-center gap-4">
                    <div className="text-sm text-muted-foreground min-w-[80px]">
                      {appointment.date}
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src="" alt={appointment.doctor} />
                        <AvatarFallback className="text-xs">
                          {appointment.doctor.split(" ").map(n => n[0]).join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h4 className="text-sm font-medium">{appointment.doctor}</h4>
                        <p className="text-xs text-muted-foreground">{appointment.specialty}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Badge variant="secondary" className="text-xs">
                      {appointment.status}
                    </Badge>
                    <Button size="sm" variant="outline">
                      View Details
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="border-0 shadow-md">
            <CardContent className="p-4 text-center">
              <Calendar className="h-8 w-8 mx-auto mb-2 text-blue-600" />
              <h3 className="font-medium mb-1">Book Appointment</h3>
              <p className="text-sm text-muted-foreground mb-3">
                Schedule a new appointment with your doctor
              </p>
              <Button size="sm" className="w-full">
                Book Now
              </Button>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md">
            <CardContent className="p-4 text-center">
              <Video className="h-8 w-8 mx-auto mb-2 text-green-600" />
              <h3 className="font-medium mb-1">Virtual Consultation</h3>
              <p className="text-sm text-muted-foreground mb-3">
                Connect with doctors online
              </p>
              <Button size="sm" variant="outline" className="w-full">
                Start Call
              </Button>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md">
            <CardContent className="p-4 text-center">
              <Clock className="h-8 w-8 mx-auto mb-2 text-purple-600" />
              <h3 className="font-medium mb-1">Emergency</h3>
              <p className="text-sm text-muted-foreground mb-3">
                Need immediate medical attention?
              </p>
              <Button size="sm" variant="destructive" className="w-full">
                Emergency
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
