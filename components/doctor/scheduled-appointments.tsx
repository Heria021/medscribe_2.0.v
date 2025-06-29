"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Calendar, Clock, MapPin, User, Phone, Video, FileText } from "lucide-react";
import Link from "next/link";
import { Id } from "@/convex/_generated/dataModel";
import { cn } from "@/lib/utils";

interface ScheduledAppointmentsGradient {
  from: string;
  to: string;
  border: string;
  iconBg: string;
  textColor: string;
  itemBg?: string;
  itemBorder?: string;
}

interface ScheduledAppointmentsProps {
  doctorId: Id<"doctors">;
  gradient?: ScheduledAppointmentsGradient;
  className?: string;
}

export function ScheduledAppointments({
  doctorId,
  gradient = {
    from: "from-blue-50",
    to: "to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20",
    border: "border-blue-200 dark:border-blue-800",
    iconBg: "bg-blue-500",
    textColor: "text-blue-900 dark:text-blue-100",
    itemBg: "bg-blue-100/50 dark:bg-blue-900/20",
    itemBorder: "border-blue-200 dark:border-blue-700"
  },
  className
}: ScheduledAppointmentsProps) {
  const weekAppointments = useQuery(api.appointments.getWeekByDoctor, {
    doctorId,
  });

  if (weekAppointments === undefined) {
    return (
      <Card className={cn(
        `bg-gradient-to-br ${gradient.from} ${gradient.to}`,
        `border-${gradient.border}`,
        "flex flex-col h-full",
        className
      )}>
        <CardHeader className="pb-2 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={cn(
                "w-8 h-8 rounded-lg flex items-center justify-center",
                gradient.iconBg
              )}>
                <Calendar className="h-4 w-4 text-white" />
              </div>
              <CardTitle className={cn(
                "text-base font-semibold",
                gradient.textColor
              )}>
                This Week's Schedule
              </CardTitle>
            </div>
            <Link href="/doctor/appointments">
              <Button
                variant="outline"
                size="sm"
                className={cn(
                  "h-6 px-2 text-xs bg-white/10 border-white/20 hover:bg-white/20",
                  gradient.textColor
                )}
              >
                <Clock className="h-3 w-3 mr-1" />
                View All
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent className="flex-1 min-h-0 p-0">
          <div className="flex items-center justify-center py-8">
            <div className={cn(
              "animate-spin rounded-full h-5 w-5 border-b-2",
              `border-${gradient.iconBg.replace('bg-', 'border-')}`
            )}></div>
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



  const getAppointmentStatus = (appointmentDateTime: number) => {
    const now = new Date();
    const appointmentDate = new Date(appointmentDateTime);

    // Check if it's today
    const isToday = appointmentDate.toDateString() === now.toDateString();

    if (!isToday) {
      return appointmentDate < now ? "past" : "upcoming";
    }

    // For today's appointments, check time
    const currentTime = now.getTime();
    const appointmentTime = appointmentDate.getTime();
    const timeDiff = Math.abs(appointmentTime - currentTime);

    if (timeDiff <= 30 * 60 * 1000) { // Within 30 minutes
      return "current";
    } else if (appointmentTime < currentTime) {
      return "past";
    } else {
      return "upcoming";
    }
  };

  // Group appointments by day
  const groupAppointmentsByDay = (appointments: any[]) => {
    const grouped: { [key: string]: any[] } = {};

    appointments.forEach(appointment => {
      const date = new Date(appointment.appointmentDateTime);
      const dayKey = date.toDateString();

      if (!grouped[dayKey]) {
        grouped[dayKey] = [];
      }
      grouped[dayKey].push(appointment);
    });

    // Sort appointments within each day by time
    Object.keys(grouped).forEach(day => {
      grouped[day].sort((a, b) =>
        new Date(a.appointmentDateTime).getTime() - new Date(b.appointmentDateTime).getTime()
      );
    });

    return grouped;
  };

  const groupedAppointments = weekAppointments ? groupAppointmentsByDay(weekAppointments) : {};
  const sortedDays = Object.keys(groupedAppointments).sort((a, b) =>
    new Date(a).getTime() - new Date(b).getTime()
  );

  return (
    <Card className={cn(
      `bg-gradient-to-br ${gradient.from} ${gradient.to}`,
      `border-${gradient.border}`,
      "flex flex-col h-full",
      className
    )}>
      <CardHeader className="pb-2 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={cn(
              "w-8 h-8 rounded-lg flex items-center justify-center",
              gradient.iconBg
            )}>
              <Calendar className="h-4 w-4 text-white" />
            </div>
            <CardTitle className={cn(
              "text-base font-semibold",
              gradient.textColor
            )}>
              This Week's Schedule
            </CardTitle>
          </div>
          <Link href="/doctor/appointments">
            <Button
              variant="outline"
              size="sm"
              className={cn(
                "h-6 px-2 text-xs bg-white/10 border-white/20 hover:bg-white/20",
                gradient.textColor
              )}
            >
              <Clock className="h-3 w-3 mr-1" />
              View All
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent className="flex-1 min-h-0 p-0">
        <ScrollArea className="h-full">
          {sortedDays.length === 0 ? (
            <div className="flex items-center justify-center py-8 text-center">
              <div className="space-y-2">
                <div className={cn(
                  "w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3",
                  gradient.itemBg || "bg-white/10"
                )}>
                  <Calendar className={cn("h-6 w-6", gradient.textColor)} />
                </div>
                <p className={cn("text-sm opacity-75", gradient.textColor)}>
                  No appointments this week
                </p>
                <Link href="/doctor/appointments">
                  <Button
                    variant="outline"
                    size="sm"
                    className={cn(
                      "h-6 px-3 text-xs bg-white/10 border-white/20 hover:bg-white/20",
                      gradient.textColor
                    )}
                  >
                    Schedule Appointment
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <div className="p-3 space-y-3">
              {sortedDays.map((dayKey) => {
                const dayDate = new Date(dayKey);
                const isToday = dayDate.toDateString() === new Date().toDateString();
                const dayAppointments = groupedAppointments[dayKey];

                return (
                  <div key={dayKey} className="space-y-2">
                    {/* Day Header */}
                    <div className="flex items-center gap-2 px-1">
                      <div className={cn(
                        "text-xs font-medium",
                        isToday ? gradient.textColor : `${gradient.textColor} opacity-75`
                      )}>
                        {isToday ? 'Today' : dayDate.toLocaleDateString('en-US', {
                          weekday: 'short',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </div>
                      <div className={cn("flex-1 h-px", gradient.itemBorder || "bg-white/20")}></div>
                      <div className={cn("text-xs opacity-75", gradient.textColor)}>
                        {dayAppointments.length} appointment{dayAppointments.length !== 1 ? 's' : ''}
                      </div>
                    </div>

                    {/* Day's Appointments */}
                    <div className="space-y-1">
                      {dayAppointments.slice(0, 8).map((appointment) => {
                        const appointmentTime = new Date(appointment.appointmentDateTime);
                        const timeStatus = getAppointmentStatus(appointment.appointmentDateTime);

                        return (
                          <div
                            key={appointment._id}
                            className={cn(
                              "relative flex items-center gap-2 p-2 rounded transition-colors",
                              gradient.itemBg || "bg-white/10",
                              gradient.itemBorder && `border ${gradient.itemBorder}`,
                              timeStatus === "current" && "ring-2 ring-white/30",
                              timeStatus === "past" && "opacity-75",
                              "hover:bg-white/20"
                            )}
                          >
                            {/* Timeline indicator */}
                            <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                              timeStatus === "current"
                                ? "bg-primary animate-pulse"
                                : timeStatus === "past"
                                ? "bg-green-500"
                                : "bg-muted-foreground"
                            }`} />

                            {/* Patient Avatar */}
                            <Avatar className="h-6 w-6 flex-shrink-0">
                              <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                                {appointment.patient?.firstName?.[0]}{appointment.patient?.lastName?.[0]}
                              </AvatarFallback>
                            </Avatar>

                            {/* Appointment Details */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-1">
                                <h4 className={cn("text-xs font-medium truncate", gradient.textColor)}>
                                  {appointment.patient?.firstName} {appointment.patient?.lastName}
                                </h4>
                                <Badge variant="secondary" className={`${getStatusColor(appointment.status)} text-xs h-4 px-1`}>
                                  {appointment.status.replace('_', ' ')}
                                </Badge>
                              </div>

                              <div className={cn("flex items-center gap-2 text-xs opacity-75", gradient.textColor)}>
                                <div className="flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  {appointmentTime.toLocaleTimeString('en-US', {
                                    hour: '2-digit',
                                    minute: '2-digit',
                                    hour12: true
                                  })}
                                </div>
                                {appointment.location && (
                                  <div className="flex items-center gap-1">
                                    {appointment.location.type === "telemedicine" ? (
                                      <Video className="h-3 w-3" />
                                    ) : (
                                      <MapPin className="h-3 w-3" />
                                    )}
                                    <span className="text-xs">
                                      {appointment.location.type === "telemedicine" ? "Virtual" : "In-person"}
                                    </span>
                                  </div>
                                )}
                                <span>{appointment.duration}min</span>
                              </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex items-center gap-1 flex-shrink-0">
                              {appointment.location?.type === "telemedicine" ? (
                                <Button size="sm" variant="outline" className="h-6 px-1.5 text-xs">
                                  <Video className="h-3 w-3" />
                                </Button>
                              ) : (
                                <Button size="sm" variant="outline" className="h-6 px-1.5 text-xs">
                                  <Phone className="h-3 w-3" />
                                </Button>
                              )}
                              <Button size="sm" variant="ghost" className="h-6 px-1.5 text-xs">
                                <FileText className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}

              {weekAppointments && weekAppointments.length > 20 && (
                <div className="pt-2 border-t">
                  <Link href="/doctor/appointments">
                    <Button variant="ghost" size="sm" className="w-full h-6 text-xs">
                      View all {weekAppointments.length} appointments this week
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
