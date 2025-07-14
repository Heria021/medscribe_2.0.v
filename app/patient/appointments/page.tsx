"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar, Plus } from "lucide-react";
import Link from "next/link";
import {
  usePatientAuth,
  usePatientAppointments,
  useAppointmentActions,
  useAppointmentDialogs,
  AppointmentList,
  CompactAppointmentList,
  CancelDialog,
  RescheduleDialog,
  QuickActionsGrid,
} from "@/app/patient/_components/appointments";

// Individual skeleton components
const AppointmentListSkeleton = () => (
  <div className="p-4 space-y-3">
    {Array.from({ length: 3 }).map((_, i) => (
      <Card key={i} className="bg-background border-border">
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-32 bg-muted" />
              <Skeleton className="h-3 w-48 bg-muted" />
              <Skeleton className="h-3 w-24 bg-muted" />
            </div>
            <div className="flex gap-2">
              <Skeleton className="h-8 w-16 bg-muted" />
              <Skeleton className="h-8 w-16 bg-muted" />
            </div>
          </div>
        </CardContent>
      </Card>
    ))}
  </div>
);

const CompactAppointmentListSkeleton = () => (
  <div className="p-4 space-y-2">
    {Array.from({ length: 4 }).map((_, i) => (
      <div key={i} className="p-2 space-y-1">
        <Skeleton className="h-3 w-full bg-muted" />
        <Skeleton className="h-3 w-2/3 bg-muted" />
      </div>
    ))}
  </div>
);

const QuickActionsGridSkeleton = () => (
  <Card className="flex-shrink-0 bg-background border-border">
    <CardHeader className="pb-2">
      <Skeleton className="h-4 w-24 bg-muted" />
    </CardHeader>
    <CardContent className="p-3 pt-0">
      <div className="grid grid-cols-3 gap-1">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="p-2 space-y-1">
            <Skeleton className="h-6 w-6 bg-muted mx-auto" />
            <Skeleton className="h-3 w-full bg-muted" />
          </div>
        ))}
      </div>
    </CardContent>
  </Card>
);

/**
 * Patient Appointments Page - Refactored with performance optimizations
 *
 * Features:
 * - Custom hooks for clean separation of concerns
 * - Performance optimized with React.memo and useCallback
 * - Reusable components for maintainability
 * - Comprehensive error handling
 * - Accessibility support
 * - Individual skeleton loading states
 */
const PatientAppointmentsPage = React.memo(() => {
  // Custom hooks for clean separation of concerns
  const {
    isLoading: authLoading,
    isAuthenticated,
    isPatient,
    patientProfile
  } = usePatientAuth();

  const {
    upcomingAppointments,
    pastAppointments,
    isLoading: appointmentsLoading,
  } = usePatientAppointments(patientProfile?._id);

  const {
    cancelAppointment,
    joinCall,
    loadingStates,
  } = useAppointmentActions();

  const {
    cancelDialog,
    rescheduleDialog,
    openCancelDialog,
    closeCancelDialog,
    openRescheduleDialog,
    closeRescheduleDialog,
  } = useAppointmentDialogs();

  // Memoized authentication check
  const isAuthorized = React.useMemo(() =>
    isAuthenticated && isPatient,
    [isAuthenticated, isPatient]
  );

  // Memoized action handlers for performance
  const handleCancelAppointment = React.useCallback(async (appointmentId: any) => {
    await cancelAppointment(appointmentId);
    closeCancelDialog();
  }, [cancelAppointment, closeCancelDialog]);

  const handleRescheduleAppointment = React.useCallback(async () => {
    // For now, just close the dialog and redirect to booking
    closeRescheduleDialog();
    window.location.href = '/patient/appointments/book';
  }, [closeRescheduleDialog]);

  // Memoized handlers for dialog actions
  const memoizedOpenCancelDialog = React.useCallback(openCancelDialog, [openCancelDialog]);
  const memoizedOpenRescheduleDialog = React.useCallback(openRescheduleDialog, [openRescheduleDialog]);
  const memoizedJoinCall = React.useCallback(joinCall, [joinCall]);

  // Authentication check
  if (authLoading || !isAuthorized) {
    return null;
  }

  return (
    <>
      <div className="h-full flex flex-col space-y-4">
        {/* Header */}
        <div className="flex-shrink-0 space-y-1">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold tracking-tight">My Appointments</h1>
              <p className="text-muted-foreground text-sm">View and manage your medical appointments</p>
            </div>
            <Link href="/patient/appointments/book">
              <Button size="sm" className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Book Appointment
              </Button>
            </Link>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Upcoming Appointments - Takes 2 columns */}
          <div className="lg:col-span-2 flex flex-col min-h-0">
            <Card className="flex-1 min-h-0 flex flex-col">
              <CardHeader className="pb-3 flex-shrink-0">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">Upcoming Appointments</CardTitle>
                  {upcomingAppointments && upcomingAppointments.length > 0 && (
                    <Badge variant="outline" className="text-xs">
                      {upcomingAppointments.length} scheduled
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="flex-1 min-h-0 p-0">
                <ScrollArea className="h-full scrollbar-hide">
                  {appointmentsLoading ? (
                    <AppointmentListSkeleton />
                  ) : !upcomingAppointments || upcomingAppointments.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-8 text-center">
                      <Calendar className="h-8 w-8 text-muted-foreground mb-3" />
                      <h3 className="font-medium mb-2">No upcoming appointments</h3>
                      <p className="text-muted-foreground text-sm mb-3">
                        Schedule your next appointment with your healthcare provider
                      </p>
                      <Link href="/patient/appointments/book">
                        <Button size="sm" className="gap-2">
                          <Plus className="h-4 w-4" />
                          Book Appointment
                        </Button>
                      </Link>
                    </div>
                  ) : (
                    <div className="p-4">
                      <AppointmentList
                        appointments={upcomingAppointments}
                        showActions={true}
                        onCancel={memoizedOpenCancelDialog}
                        onReschedule={memoizedOpenRescheduleDialog}
                        onJoin={memoizedJoinCall}
                      />
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>
          </div>

          {/* Right Sidebar - Past Appointments & Quick Actions */}
          <div className="flex flex-col space-y-4 min-h-0">
            {/* Past Appointments */}
            <Card className="flex-1 min-h-0 flex flex-col">
              <CardHeader className="pb-3 flex-shrink-0">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">Past Appointments</CardTitle>
                  {pastAppointments && pastAppointments.length > 0 && (
                    <Badge variant="outline" className="text-xs">
                      {pastAppointments.length} completed
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="flex-1 min-h-0 p-0">
                <ScrollArea className="h-full scrollbar-hide">
                  {appointmentsLoading ? (
                    <CompactAppointmentListSkeleton />
                  ) : (
                    <div className="p-4">
                      <CompactAppointmentList
                        appointments={pastAppointments || []}
                        maxItems={8}
                        showActions={false}
                      />
                      {pastAppointments && pastAppointments.length > 8 && (
                        <div className="pt-2 border-t border-border">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="w-full h-6 text-xs"
                            onClick={() => window.location.href = "/patient/appointments/history"}
                          >
                            View all {pastAppointments.length} appointments
                          </Button>
                        </div>
                      )}
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            {appointmentsLoading ? (
              <QuickActionsGridSkeleton />
            ) : (
              <QuickActionsGrid variant="compact" />
            )}
          </div>
        </div>
      </div>

      {/* Dialogs */}
      <CancelDialog
        open={cancelDialog.open}
        onOpenChange={closeCancelDialog}
        appointmentId={cancelDialog.appointmentId}
        onConfirm={handleCancelAppointment}
        isLoading={cancelDialog.appointmentId ? loadingStates.cancel[cancelDialog.appointmentId.toString()] : false}
      />

      <RescheduleDialog
        open={rescheduleDialog.open}
        onOpenChange={closeRescheduleDialog}
        appointmentId={rescheduleDialog.appointmentId}
        onConfirm={handleRescheduleAppointment}
        isLoading={rescheduleDialog.appointmentId ? loadingStates.reschedule[rescheduleDialog.appointmentId.toString()] : false}
      />
    </>
  );
});

PatientAppointmentsPage.displayName = "PatientAppointmentsPage";

export default PatientAppointmentsPage;
