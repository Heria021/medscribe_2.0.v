import React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Calendar,
  XCircle,
  Video,
  MapPin,
  User,
  Phone,
} from "lucide-react";
import { useAppointmentFormatters } from "../hooks";
import type { AppointmentCardProps } from "../types";
import { cn } from "@/lib/utils";

/**
 * AppointmentCard Component
 * 
 * Displays a single appointment with patient info, timing, and action buttons
 * Optimized for performance with React.memo
 */
export const AppointmentCard = React.memo<AppointmentCardProps>(({
  appointment,
  onCancel,
  onConfirm,
  onStart,
  onComplete,
  onJoinCall,
  isLoading = false,
  className = "",
}) => {
  const { formatTime, formatDate, getStatusColor, getStatusIcon } = useAppointmentFormatters();

  const handleCancel = () => {
    onCancel?.(appointment._id);
  };

  const handleConfirm = () => {
    onConfirm?.(appointment._id);
  };

  const handleStart = () => {
    onStart?.(appointment._id);
  };

  const handleComplete = () => {
    onComplete?.(appointment._id);
  };

  const handleJoinCall = () => {
    onJoinCall?.(appointment);
  };

  const patientAge = appointment.patient?.dateOfBirth 
    ? new Date().getFullYear() - new Date(appointment.patient.dateOfBirth).getFullYear()
    : 'N/A';

  return (
    <div
      className={cn(
        "p-3 hover:bg-muted/30 transition-colors border-l-2 border-l-transparent hover:border-l-primary/20",
        isLoading && "opacity-50 pointer-events-none",
        className
      )}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Time and Date - Compact */}
          <div className="flex flex-col items-center min-w-[60px]">
            <div className="text-sm font-semibold">
              {formatTime(appointment.appointmentDateTime)}
            </div>
            <div className="text-xs text-muted-foreground">
              {formatDate(appointment.appointmentDateTime).split(',')[0]}
            </div>
            <div className="text-xs text-muted-foreground">
              {appointment.duration}m
            </div>
          </div>

          {/* Patient Info - Compact */}
          <div className="flex items-center gap-3">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="bg-primary/10 text-primary text-xs">
                {appointment.patient?.firstName?.[0]}{appointment.patient?.lastName?.[0]}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <h4 className="font-medium text-sm truncate">
                {appointment.patient?.firstName} {appointment.patient?.lastName}
              </h4>
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <User className="h-3 w-3" />
                  {appointment.patient?.gender}, {patientAge}y
                </span>
                {appointment.patient?.primaryPhone && (
                  <span className="flex items-center gap-1">
                    <Phone className="h-3 w-3" />
                    {appointment.patient.primaryPhone}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Appointment Details - Compact */}
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <p className="font-medium text-xs capitalize text-muted-foreground">
                {appointment.appointmentType.replace('_', ' ')}
              </p>
              <div className="flex items-center gap-1">
                {appointment.location?.type === "telemedicine" ? (
                  <Video className="h-3 w-3 text-blue-600" />
                ) : (
                  <MapPin className="h-3 w-3 text-green-600" />
                )}
                <span className="text-xs text-muted-foreground">
                  {appointment.location?.type === "telemedicine" ? "Virtual" : "In-person"}
                </span>
              </div>
            </div>
            {appointment.visitReason && (
              <p className="text-xs text-muted-foreground truncate max-w-[200px]">
                {appointment.visitReason}
              </p>
            )}
          </div>
        </div>

        {/* Status and Actions - Compact */}
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className={`${getStatusColor(appointment.status)} flex items-center gap-1 text-xs h-5`}>
            {getStatusIcon(appointment.status)}
            {appointment.status.replace('_', ' ')}
          </Badge>

          <div className="flex gap-1">
            {/* Reschedule Button */}
            <Button size="sm" variant="ghost" className="h-7 px-2 text-xs">
              <Calendar className="h-3 w-3" />
            </Button>
            
            {/* Cancel Button */}
            {appointment.status !== "cancelled" && appointment.status !== "completed" && (
              <Button 
                size="sm" 
                variant="ghost" 
                className="h-7 px-2 text-xs"
                onClick={handleCancel}
                disabled={isLoading}
              >
                <XCircle className="h-3 w-3" />
              </Button>
            )}
            
            {/* Primary Action Button */}
            {appointment.status === "scheduled" && (
              <Button 
                size="sm" 
                className="h-7 px-3 text-xs"
                onClick={handleConfirm}
                disabled={isLoading}
              >
                Confirm
              </Button>
            )}
            
            {appointment.status === "confirmed" && (
              <Button 
                size="sm" 
                className="h-7 px-3 text-xs"
                onClick={appointment.location?.type === "telemedicine" ? handleJoinCall : handleStart}
                disabled={isLoading}
              >
                {appointment.location?.type === "telemedicine" ? "Join" : "Start"}
              </Button>
            )}
            
            {appointment.status === "in_progress" && (
              <Button 
                size="sm" 
                className="h-7 px-3 text-xs"
                onClick={handleComplete}
                disabled={isLoading}
              >
                Complete
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
});

AppointmentCard.displayName = "AppointmentCard";
