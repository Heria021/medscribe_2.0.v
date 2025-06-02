"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Calendar, Clock, MapPin, Phone, Video } from "lucide-react";
import Link from "next/link";
import { Id } from "@/convex/_generated/dataModel";

interface ScheduledAppointmentsProps {
  patientId: Id<"patients">;
}

export function ScheduledAppointments({ patientId }: ScheduledAppointmentsProps) {
  const upcomingAppointments = useQuery(api.appointments.getPatientUpcomingAppointments, {
    patientId,
  });

  if (upcomingAppointments === undefined) {
    return (
      <Card className="border-1 shadow-none">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Scheduled Appointments</CardTitle>
          <CardDescription>Your upcoming medical appointments</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const getLocationIcon = (location?: string) => {
    if (!location) return <MapPin className="h-4 w-4" />;
    if (location.toLowerCase().includes("virtual") || location.toLowerCase().includes("online")) {
      return <Video className="h-4 w-4" />;
    }
    return <MapPin className="h-4 w-4" />;
  };

  return (
    <Card className="border-1 shadow-none">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg font-semibold">Scheduled Appointments</CardTitle>
            <CardDescription>Your upcoming medical appointments</CardDescription>
          </div>
          <Link href="/patient/appointments">
            <Button variant="outline" size="sm" className="gap-2">
              <Calendar className="h-4 w-4" />
              View All
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        {upcomingAppointments.length === 0 ? (
          <div className="flex items-center justify-center py-8 text-center">
            <div className="space-y-3">
              <Calendar className="h-12 w-12 text-muted-foreground mx-auto" />
              <div className="space-y-1">
                <p className="text-sm font-medium">No upcoming appointments</p>
                <p className="text-xs text-muted-foreground">
                  Schedule your next appointment with your healthcare provider
                </p>
              </div>
              <Link href="/patient/appointments/book">
                <Button size="sm" className="gap-2">
                  <Calendar className="h-4 w-4" />
                  Book Appointment
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {upcomingAppointments.slice(0, 3).map((appointment) => (
              <div
                key={appointment._id}
                className="flex items-center gap-4 p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
              >
                {/* Doctor Avatar */}
                <Avatar className="h-12 w-12">
                  <AvatarImage src={`/avatars/doctor-${appointment.doctor?.firstName?.toLowerCase()}.jpg`} />
                  <AvatarFallback className="bg-primary/10 text-primary">
                    {appointment.doctor?.firstName?.[0]}
                    {appointment.doctor?.lastName?.[0]}
                  </AvatarFallback>
                </Avatar>

                {/* Appointment Details */}
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-medium">
                      Dr. {appointment.doctor?.firstName} {appointment.doctor?.lastName}
                    </h4>
                    <Badge variant="secondary" className="capitalize">
                      {appointment.status.replace("_", " ")}
                    </Badge>
                  </div>

                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {new Date(appointment.appointmentDate).toLocaleDateString("en-US", {
                        weekday: "short",
                        month: "short",
                        day: "numeric",
                      })}
                    </div>
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
                  </div>

                  <div className="text-xs text-muted-foreground">
                    {appointment.appointmentType} • {appointment.doctor?.specialization}
                  </div>
                </div>

                {/* Action Button */}
                <div className="flex flex-col gap-2">
                  {appointment.appointmentLocation?.toLowerCase().includes("virtual") ? (
                    <Button size="sm" variant="outline" className="gap-2">
                      <Video className="h-3 w-3" />
                      Join
                    </Button>
                  ) : (
                    <Button size="sm" variant="outline" className="gap-2">
                      <Phone className="h-3 w-3" />
                      Contact
                    </Button>
                  )}
                </div>
              </div>
            ))}

            {upcomingAppointments.length > 3 && (
              <div className="pt-2 border-t">
                <Link href="/patient/appointments">
                  <Button variant="ghost" size="sm" className="w-full">
                    View {upcomingAppointments.length - 3} more appointments
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