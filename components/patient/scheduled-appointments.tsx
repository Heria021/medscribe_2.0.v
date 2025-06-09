"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Video, 
  Stethoscope, 
  ArrowRight,
  Plus,
  Loader2
} from "lucide-react";
import Link from "next/link";
import { Id } from "@/convex/_generated/dataModel";

interface ScheduledAppointmentsProps {
  patientId: Id<"patients">;
}

export function ScheduledAppointments({ patientId }: ScheduledAppointmentsProps) {
  const upcomingAppointments = useQuery(api.appointments.getUpcomingByPatient, {
    patientId,
  });

  const formatDate = (date: Date) => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    if (date.toDateString() === today.toDateString()) {
      return "Today";
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return "Tomorrow";
    } else {
      return date.toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric"
      });
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true
    });
  };

  if (upcomingAppointments === undefined) {
    return (
      <Card className="h-full flex flex-col">
        <CardHeader className="pb-3 flex-shrink-0">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Upcoming Appointments</CardTitle>
            <Link href="/patient/appointments">
              <Button variant="outline" size="sm" className="h-7 px-3 text-xs">
                <Calendar className="h-3 w-3 mr-1" />
                View All
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent className="flex-1 flex items-center justify-center">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span className="text-sm">Loading appointments...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-3 flex-shrink-0">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Upcoming Appointments</CardTitle>
          <Link href="/patient/appointments">
            <Button variant="outline" size="sm" className="h-7 px-3 text-xs">
              <Calendar className="h-3 w-3 mr-1" />
              View All
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent className="flex-1 min-h-0 p-0">
        <ScrollArea className="h-full">
          {upcomingAppointments.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                <Calendar className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="font-medium text-sm mb-2">No upcoming appointments</h3>
              <p className="text-xs text-muted-foreground mb-4 max-w-[200px]">
                Schedule your next appointment with your healthcare provider
              </p>
              <Link href="/patient/appointments/book">
                <Button size="sm" className="h-8 px-3 text-xs">
                  <Plus className="h-3 w-3 mr-1" />
                  Book Appointment
                </Button>
              </Link>
            </div>
          ) : (
            <div className="p-4 space-y-3">
              {upcomingAppointments.slice(0, 4).map((appointment) => {
                const appointmentTime = new Date(appointment.appointmentDateTime);
                const isTelemedicine = appointment.location?.type === "telemedicine";
                const isToday = appointmentTime.toDateString() === new Date().toDateString();

                return (
                  <div
                    key={appointment._id}
                    className={`relative p-4 rounded-lg border transition-all hover:shadow-sm ${
                      isToday 
                        ? "border-primary/30 bg-primary/5" 
                        : "border-border/50 hover:border-border"
                    }`}
                  >
                    <div className={`absolute left-0 top-4 w-1 h-12 rounded-r ${
                      isToday ? "bg-primary" : "bg-muted-foreground/30"
                    }`} />
                    
                    <div className="ml-4 space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                              <Stethoscope className="h-4 w-4 text-primary" />
                            </div>
                            <div>
                              <h3 className="font-medium text-sm">
                                Dr. {appointment.doctor?.firstName} {appointment.doctor?.lastName}
                              </h3>
                              <p className="text-xs text-muted-foreground">
                                {appointment.doctor?.specialization || "General Practice"}
                              </p>
                            </div>
                          </div>
                        </div>
                        <Badge 
                          variant={isToday ? "default" : "secondary"} 
                          className="text-xs h-5"
                        >
                          {formatDate(appointmentTime)}
                        </Badge>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            <span className="font-medium">{formatTime(appointmentTime)}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            {isTelemedicine ? (
                              <>
                                <Video className="h-3 w-3" />
                                <span>Video Call</span>
                              </>
                            ) : (
                              <>
                                <MapPin className="h-3 w-3" />
                                <span>In-person</span>
                              </>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex gap-2">
                          {isTelemedicine && appointment.location?.meetingLink ? (
                            <Link href={appointment.location.meetingLink} target="_blank">
                              <Button size="sm" variant="outline" className="h-7 px-2 text-xs">
                                <Video className="h-3 w-3 mr-1" />
                                Join
                              </Button>
                            </Link>
                          ) : (
                            <Link href={`/patient/appointments/${appointment._id}`}>
                              <Button size="sm" variant="outline" className="h-7 px-2 text-xs">
                                <ArrowRight className="h-3 w-3" />
                              </Button>
                            </Link>
                          )}
                        </div>
                      </div>

                      {appointment.appointmentType && (
                        <div className="text-xs text-muted-foreground">
                          <span className="px-2 py-1 bg-muted rounded text-xs">
                            {appointment.appointmentType}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}

              {upcomingAppointments.length > 4 && (
                <div className="pt-3 border-t border-border/50">
                  <Link href="/patient/appointments">
                    <Button variant="ghost" size="sm" className="w-full h-8 text-xs">
                      View {upcomingAppointments.length - 4} more appointments
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
