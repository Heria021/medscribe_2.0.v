"use client";

import * as React from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Calendar, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

export interface Appointment {
  _id: string;
  doctor?: {
    firstName: string;
    lastName: string;
  };
  appointmentDateTime: string;
  status: string;
  reason?: string;
}

export interface AppointmentSectionProps {
  appointments: Appointment[];
  title: string;
  description: string;
  icon: React.ReactNode;
  gradient: {
    from: string;
    to: string;
    border: string;
    iconBg: string;
    textColor: string;
    itemBg: string;
    itemBorder: string;
  };
  emptyState: {
    icon: React.ReactNode;
    message: string;
    actionLabel: string;
    actionHref: string;
  };
  viewAllHref: string;
  maxItems?: number;
  className?: string;
}

export function AppointmentSection({
  appointments,
  title,
  description,
  icon,
  gradient,
  emptyState,
  viewAllHref,
  maxItems = 3,
  className,
}: AppointmentSectionProps) {
  const hasAppointments = appointments && appointments.length > 0;
  
  return (
    <Card className="h-full flex flex-col overflow-hidden">
      <div className="flex-shrink-0 p-4 border-b border-border/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-primary">
              {icon}
            </div>
            <div>
              <h3 className="text-base font-semibold text-foreground">{title}</h3>
              <p className="text-xs text-muted-foreground">{description}</p>
            </div>
          </div>
          <Link href={viewAllHref}>
            <Button variant="outline" size="sm" className="h-7 px-3 text-xs">
              <Calendar className="h-3 w-3 mr-1" />
              View All
            </Button>
          </Link>
        </div>
      </div>

      <ScrollArea className="flex-1 overflow-hidden">
        <div className="divide-y overflow-hidden">
        {!hasAppointments ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="w-12 h-12 rounded-full flex items-center justify-center mb-3 bg-muted mx-auto">
                <Calendar className="h-6 w-6 text-muted-foreground" />
              </div>
              <h3 className="font-medium text-sm mb-1 text-foreground">No Upcoming Appointments</h3>
              <p className="text-xs mb-3 max-w-[180px] text-muted-foreground">
                You don't have any scheduled appointments.
              </p>
              <Link href={emptyState.actionHref}>
                <Button size="sm" className="h-7 px-3 text-xs">
                  {emptyState.actionLabel}
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          appointments.slice(0, maxItems).map((appointment) => (
            <div
              key={appointment._id}
              className="p-4 bg-muted/30 hover:bg-muted/50 transition-all duration-200"
            >
                <div className="flex items-center justify-between mb-1">
                  <div className={cn(
                    "font-medium text-sm",
                    gradient.textColor
                  )}>
                    Dr. {appointment.doctor?.firstName} {appointment.doctor?.lastName}
                  </div>
                  <Badge 
                    variant="outline" 
                    className={cn(
                      "text-xs h-5",
                      `border-${gradient.border.replace('border-', '').replace('200', '300')} ${gradient.textColor}`
                    )}
                  >
                    {appointment.status}
                  </Badge>
                </div>
                <div className={cn(
                  "text-xs flex items-center gap-1",
                  gradient.textColor
                )}>
                  <Clock className="h-3 w-3" />
                  {(() => {
                    try {
                      const date = new Date(appointment.appointmentDateTime);
                      return `${date.toLocaleDateString()} at ${date.toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}`;
                    } catch (error) {
                      return 'Invalid date';
                    }
                  })()}
                </div>
                {appointment.reason && (
                  <p className={cn(
                    "text-xs mt-1",
                    gradient.textColor.replace('700', '600').replace('300', '400')
                  )}>
                    {appointment.reason}
                  </p>
                )}
              </div>
            ))
        )}
        </div>
      </ScrollArea>
    </Card>
  );
}
