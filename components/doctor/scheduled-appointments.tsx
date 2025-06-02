"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Calendar, Clock, MapPin, User, Phone, Video, FileText } from "lucide-react";
import Link from "next/link";
import { Id } from "@/convex/_generated/dataModel";

interface ScheduledAppointmentsProps {
  doctorId: Id<"doctors">;
}

export function ScheduledAppointments({ doctorId }: ScheduledAppointmentsProps) {
  const todayAppointments = useQuery(api.appointments.getDoctorTodayAppointments, {
    doctorId,
  });

  if (todayAppointments === undefined) {
    return (
      <Card className="border shadow-none">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg font-semibold">Today's Schedule</CardTitle>
              <CardDescription className="text-sm text-muted-foreground">
                Your appointments and tasks for today
              </CardDescription>
            </div>
            <Link href="/doctor/appointments/today">
              <Button variant="outline" size="sm" className="gap-2">
                <Clock className="h-4 w-4" />
                View All
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "scheduled":
        return "bg-primary/10 text-primary";
      case "confirmed":
        return "bg-green-500/10 text-green-600 dark:text-green-400";
      case "in_progress":
        return "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400";
      case "completed":
        return "bg-muted text-muted-foreground";
      case "cancelled":
        return "bg-destructive/10 text-destructive";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const getLocationIcon = (location?: string) => {
    if (!location) return <MapPin className="h-4 w-4" />;
    if (location.toLowerCase().includes("virtual") || location.toLowerCase().includes("online")) {
      return <Video className="h-4 w-4" />;
    }
    return <MapPin className="h-4 w-4" />;
  };

  const getAppointmentStatus = (appointmentTime: string) => {
    const now = new Date();
    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    
    if (appointmentTime < currentTime) {
      return "past";
    } else if (appointmentTime === currentTime) {
      return "current";
    } else {
      return "upcoming";
    }
  };

  return (
    <Card className="border shadow-none">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg font-semibold">Today's Schedule</CardTitle>
            <CardDescription className="text-sm text-muted-foreground">
              Your appointments and tasks for today
            </CardDescription>
          </div>
          <Link href="/doctor/appointments/today">
            <Button variant="outline" size="sm" className="gap-2">
              <Clock className="h-4 w-4" />
              View All
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {todayAppointments.length === 0 ? (
          <div className="flex items-center justify-center py-8 text-center">
            <div className="space-y-2">
              <Calendar className="h-12 w-12 text-muted-foreground mx-auto" />
              <p className="text-sm text-muted-foreground">No appointments scheduled for today</p>
              <Link href="/doctor/appointments">
                <Button variant="outline" size="sm">
                  Schedule Appointment
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {todayAppointments.slice(0, 4).map((appointment) => {
              const timeStatus = getAppointmentStatus(appointment.appointmentTime);
              return (
                <div
                  key={appointment._id}
                  className={`relative flex items-center gap-4 p-4 rounded-lg border transition-colors ${
                    timeStatus === "current"
                      ? "border-primary bg-primary/5"
                      : timeStatus === "past"
                      ? "border-green-500/20 bg-green-500/5"
                      : "border-border hover:bg-muted/50"
                  }`}
                >
                  {/* Timeline indicator */}
                  <div className="flex flex-col items-center">
                    <div className={`w-3 h-3 rounded-full ${
                      timeStatus === "current"
                        ? "bg-primary animate-pulse"
                        : timeStatus === "past"
                        ? "bg-green-500"
                        : "bg-muted-foreground"
                    }`} />
                    {appointment !== todayAppointments[todayAppointments.length - 1] && (
                      <div className="w-px h-8 bg-border mt-2" />
                    )}
                  </div>

                  {/* Patient Avatar */}
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={`/avatars/patient-${appointment.patient?.firstName?.toLowerCase()}.jpg`} />
                    <AvatarFallback className="bg-primary/10 text-primary text-sm">
                      {appointment.patient?.firstName?.[0]}{appointment.patient?.lastName?.[0]}
                    </AvatarFallback>
                  </Avatar>

                  {/* Appointment Details */}
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-medium">
                        {appointment.patient?.firstName} {appointment.patient?.lastName}
                      </h4>
                      <Badge variant="secondary" className={getStatusColor(appointment.status)}>
                        {appointment.status}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {appointment.appointmentTime}
                      </div>
                      {appointment.appointmentLocation && (
                        <div className="flex items-center gap-1">
                          {getLocationIcon(appointment.appointmentLocation)}
                          {appointment.appointmentLocation}
                        </div>
                      )}
                      {appointment.duration && (
                        <div className="text-xs">
                          {appointment.duration} min
                        </div>
                      )}
                    </div>

                    <div className="text-xs text-muted-foreground">
                      {appointment.appointmentType}
                      {appointment.notes && ` • ${appointment.notes}`}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-2">
                    {appointment.appointmentLocation?.toLowerCase().includes("virtual") ? (
                      <Button size="sm" variant="outline" className="gap-2">
                        <Video className="h-3 w-3" />
                        Join
                      </Button>
                    ) : (
                      <Button size="sm" variant="outline" className="gap-2">
                        <Phone className="h-3 w-3" />
                        Call
                      </Button>
                    )}
                    <Button size="sm" variant="ghost" className="gap-2">
                      <FileText className="h-3 w-3" />
                      Notes
                    </Button>
                  </div>
                </div>
              );
            })}

            {todayAppointments.length > 4 && (
              <div className="pt-2 border-t">
                <Link href="/doctor/appointments/today">
                  <Button variant="ghost" size="sm" className="w-full">
                    View {todayAppointments.length - 4} more appointments
                  </Button>
                </Link>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
