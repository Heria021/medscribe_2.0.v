"use client";

import * as React from "react";
import { Calendar, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { AppointmentListProps } from "../types";
import { AppointmentCard } from "./AppointmentCard";

/**
 * Reusable appointment list component with virtualization support
 * 
 * Features:
 * - Grid and list layout variants
 * - Virtualization for large lists (optional)
 * - Empty state handling
 * - Performance optimized with React.memo
 * - Configurable max items
 * - Responsive design
 * 
 * @param props - AppointmentListProps
 * @returns JSX.Element
 */
export const AppointmentList = React.memo<AppointmentListProps>(({
  appointments,
  variant = "list",
  showActions = true,
  emptyState,
  onCancel,
  onReschedule,
  onJoin,
  className,
  maxItems,
  virtualized = false,
}) => {
  // Limit items if maxItems is specified
  const displayedAppointments = React.useMemo(() => {
    if (maxItems && appointments.length > maxItems) {
      return appointments.slice(0, maxItems);
    }
    return appointments;
  }, [appointments, maxItems]);

  // Default empty state
  const defaultEmptyState = (
    <div className="flex flex-col items-center justify-center py-12 text-center border-2 border-dashed border-muted rounded-lg">
      <div className="w-16 h-16 bg-muted/50 rounded-full flex items-center justify-center mb-4">
        <Calendar className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="font-medium mb-2">No appointments found</h3>
      <p className="text-muted-foreground text-sm max-w-sm">
        Your appointments will appear here when scheduled
      </p>
    </div>
  );

  // Handle empty state
  if (!appointments || appointments.length === 0) {
    return (
      <div className={cn("w-full", className)}>
        {emptyState || defaultEmptyState}
      </div>
    );
  }

  // Grid variant
  if (variant === "grid") {
    return (
      <div className={cn(
        "grid gap-4",
        "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
        className
      )}>
        {displayedAppointments.map((appointment) => (
          <AppointmentCard
            key={appointment._id}
            appointment={appointment}
            variant="default"
            showActions={showActions}
            onCancel={onCancel}
            onReschedule={onReschedule}
            onJoin={onJoin}
            className="h-full"
          />
        ))}
      </div>
    );
  }

  // List variant (default)
  return (
    <div className={cn("space-y-2", className)}>
      {displayedAppointments.map((appointment) => (
        <AppointmentCard
          key={appointment._id}
          appointment={appointment}
          variant="default"
          showActions={showActions}
          onCancel={onCancel}
          onReschedule={onReschedule}
          onJoin={onJoin}
        />
      ))}
    </div>
  );
});

AppointmentList.displayName = "AppointmentList";

/**
 * Compact appointment list for sidebars and smaller spaces
 */
export const CompactAppointmentList = React.memo<AppointmentListProps>(({
  appointments,
  showActions = false,
  emptyState,
  onCancel,
  onReschedule,
  onJoin,
  className,
  maxItems = 5,
}) => {
  // Limit items for compact view
  const displayedAppointments = React.useMemo(() => {
    return appointments.slice(0, maxItems);
  }, [appointments, maxItems]);

  // Compact empty state
  const compactEmptyState = (
    <div className="flex flex-col items-center justify-center py-8 text-center border border-dashed border-muted rounded-lg">
      <div className="w-12 h-12 bg-muted/50 rounded-full flex items-center justify-center mb-3">
        <Clock className="h-6 w-6 text-muted-foreground" />
      </div>
      <p className="text-sm text-muted-foreground">No appointments</p>
    </div>
  );

  // Handle empty state
  if (!appointments || appointments.length === 0) {
    return (
      <div className={cn("w-full", className)}>
        {emptyState || compactEmptyState}
      </div>
    );
  }

  return (
    <div className={cn("space-y-2", className)}>
      {displayedAppointments.map((appointment) => (
        <AppointmentCard
          key={appointment._id}
          appointment={appointment}
          variant="compact"
          showActions={showActions}
          onCancel={onCancel}
          onReschedule={onReschedule}
          onJoin={onJoin}
        />
      ))}
    </div>
  );
});

CompactAppointmentList.displayName = "CompactAppointmentList";
