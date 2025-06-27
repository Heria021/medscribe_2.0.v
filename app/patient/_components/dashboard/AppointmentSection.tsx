"use client";

import * as React from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
    <Card className={cn(
      "h-full",
      `bg-gradient-to-br ${gradient.from} ${gradient.to}`,
      `border-${gradient.border}`,
      className
    )}>
      <CardHeader className="p-4 pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={cn(
              "w-8 h-8 rounded-lg flex items-center justify-center",
              gradient.iconBg
            )}>
              {icon}
            </div>
            <div>
              <h3 className={cn(
                "font-semibold text-base",
                gradient.textColor
              )}>
                {title}
              </h3>
              <p className={cn(
                "text-xs",
                gradient.textColor
              )}>
                {description}
              </p>
            </div>
          </div>
          <Link href={viewAllHref}>
            <Button
              variant="outline"
              size="sm"
              className={cn(
                `border-${gradient.border.replace('border-', '')} ${gradient.textColor}`,
                `hover:bg-${gradient.from.split(' ')[1]?.replace('from-', '') || 'gray'}/50`
              )}
            >
              <Calendar className="h-3 w-3 mr-2" />
              View All
            </Button>
          </Link>
        </div>
      </CardHeader>
      
      <CardContent className="px-4 pt-0 pb-4">
        {!hasAppointments ? (
          <div className="text-center py-6">
            <div className={cn(
              "h-8 w-8 mx-auto mb-2",
              gradient.textColor.replace('text-', 'text-').replace('900', '400').replace('100', '400')
            )}>
              {emptyState.icon}
            </div>
            <p className={cn(
              "text-sm mb-3",
              gradient.textColor
            )}>
              {emptyState.message}
            </p>
            <Link href={emptyState.actionHref}>
              <Button 
                size="sm" 
                className={cn(
                  "text-white",
                  gradient.iconBg.replace('bg-', 'bg-').replace('500', '600'),
                  `hover:${gradient.iconBg.replace('bg-', 'bg-').replace('500', '700')}`
                )}
              >
                {emptyState.actionLabel}
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {appointments.slice(0, maxItems).map((appointment) => (
              <div
                key={appointment._id}
                className={cn(
                  "p-3 rounded-lg border",
                  gradient.itemBg,
                  gradient.itemBorder
                )}
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
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
