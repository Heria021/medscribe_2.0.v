"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar, Plus } from "lucide-react";
import Link from "next/link";
import { useMutation } from "convex/react";
import { toast } from "sonner";
import { api } from "@/convex/_generated/api";
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
  <div className="p-4 space-y-2">
    {Array.from({ length: 3 }).map((_, i) => (
      <div key={i} className="border rounded-lg bg-card p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-48" />
            <Skeleton className="h-3 w-24" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-8 w-16" />
            <Skeleton className="h-8 w-16" />
          </div>
        </div>
      </div>
    ))}
  </div>
);

const CompactAppointmentListSkeleton = () => (
  <div className="p-4 space-y-2">
    {Array.from({ length: 4 }).map((_, i) => (
      <div key={i} className="p-2 space-y-1">
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-2/3" />
      </div>
    ))}
  </div>
);

const QuickActionsGridSkeleton = () => (
  <div className="space-y-2">
    <Skeleton className="h-4 w-24" />
    <div className="grid grid-cols-3 gap-2">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="p-2 space-y-1">
          <Skeleton className="h-6 w-6 mx-auto" />
          <Skeleton className="h-3 w-full" />
        </div>
      ))}
    </div>
  </div>
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

  // Reschedule request mutation
  const createRescheduleRequest = useMutation(api.appointmentRescheduleRequests.createRescheduleRequest);

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

  const handleRescheduleAppointment = React.useCallback(async (requestData: any) => {
    if (!requestData.appointmentId || !requestData.reason) return;

    try {
      // Submit reschedule request instead of direct reschedule
      await createRescheduleRequest({
        appointmentId: requestData.appointmentId,
        requestedSlotId: requestData.requestedSlotId,
        reason: requestData.reason,
      });

      // Show success message
      toast.success("Reschedule request submitted successfully! The doctor's office will review your request.");
      closeRescheduleDialog();
    } catch (error) {
      console.error("Failed to submit reschedule request:", error);
      toast.error("Failed to submit reschedule request. Please try again.");
    }
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
      <div className="h-full flex flex-col p-4 space-y-3">
        {/* Header */}
        <div className="flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h1 className="text-xl font-bold tracking-tight text-foreground">My Appointments</h1>
              <p className="text-muted-foreground text-sm">View and manage your medical appointments</p>
            </div>
            <Link href="/patient/appointments/book">
              <Button size="sm" className="flex items-center gap-2 h-8 px-3">
                <Plus className="h-4 w-4" />
                Book Appointment
              </Button>
            </Link>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-3 gap-3">
          {/* Upcoming Appointments - Takes 2 columns */}
          <div className="lg:col-span-2 flex flex-col min-h-0">
            <Card className="h-full flex flex-col overflow-hidden">
              <div className="flex-shrink-0 p-4 border-b border-border/50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-primary">
                      <Calendar className="h-4 w-4 text-primary-foreground" />
                    </div>
                    <div>
                      <h2 className="text-base font-semibold text-foreground">Upcoming Appointments</h2>
                      <p className="text-xs text-muted-foreground">Your scheduled medical visits</p>
                    </div>
                  </div>
                  {upcomingAppointments && upcomingAppointments.length > 0 && (
                    <Badge variant="outline" className="text-xs">
                      {upcomingAppointments.length} scheduled
                    </Badge>
                  )}
                </div>
              </div>
              <ScrollArea className="flex-1 overflow-hidden">
                <div className="divide-y overflow-hidden">
                  {appointmentsLoading ? (
                    <AppointmentListSkeleton />
                  ) : !upcomingAppointments || upcomingAppointments.length === 0 ? (
                    <div className="flex items-center justify-center h-full">
                      <div className="text-center">
                        <div className="w-12 h-12 rounded-full flex items-center justify-center mb-3 bg-muted mx-auto">
                          <Calendar className="h-6 w-6 text-muted-foreground" />
                        </div>
                        <h3 className="font-medium text-sm mb-1 text-foreground">No upcoming appointments</h3>
                        <p className="text-muted-foreground text-xs mb-3 max-w-[180px]">
                          Schedule your next appointment with your healthcare provider
                        </p>
                        <Link href="/patient/appointments/book">
                          <Button size="sm" className="gap-2 h-7 px-3 text-xs">
                            <Plus className="h-3 w-3" />
                            Book Appointment
                          </Button>
                        </Link>
                      </div>
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
                </div>
              </ScrollArea>
            </Card>
          </div>

          {/* Right Sidebar - Past Appointments & Quick Actions */}
          <div className="flex flex-col space-y-3 min-h-0">
            {/* Past Appointments */}
            <Card className="h-full flex flex-col overflow-hidden">
              <div className="flex-shrink-0 p-4 border-b border-border/50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-primary">
                      <Calendar className="h-4 w-4 text-primary-foreground" />
                    </div>
                    <div>
                      <h2 className="text-base font-semibold text-foreground">Past Appointments</h2>
                      <p className="text-xs text-muted-foreground">Your completed medical visits</p>
                    </div>
                  </div>
                  {pastAppointments && pastAppointments.length > 0 && (
                    <Badge variant="outline" className="text-xs">
                      {pastAppointments.length} completed
                    </Badge>
                  )}
                </div>
              </div>
              <ScrollArea className="flex-1 overflow-hidden">
                <div className="divide-y overflow-hidden">
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
                        <div className="pt-3 border-t border-border">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="w-full text-xs h-8 hover:bg-muted/50"
                            onClick={() => window.location.href = "/patient/appointments/history"}
                          >
                            View all {pastAppointments.length} appointments
                          </Button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </ScrollArea>
            </Card>

            {/* Quick Actions */}
            <Card className="p-4">
              {appointmentsLoading ? (
                <QuickActionsGridSkeleton />
              ) : (
                <QuickActionsGrid variant="compact" />
              )}
            </Card>
          </div>
        </div>
      </div>

      {/* Dialogs */}
      <CancelDialog
        open={cancelDialog.open}
        onOpenChange={closeCancelDialog}
        appointmentId={cancelDialog.appointmentId}
        appointment={
          cancelDialog.appointmentId
            ? [...(upcomingAppointments || []), ...(pastAppointments || [])]
                .find(apt => apt._id === cancelDialog.appointmentId)
            : undefined
        }
        onConfirm={handleCancelAppointment}
        isLoading={cancelDialog.appointmentId ? loadingStates.cancel[cancelDialog.appointmentId.toString()] : false}
      />

      <RescheduleDialog
        open={rescheduleDialog.open}
        onOpenChange={closeRescheduleDialog}
        appointmentId={rescheduleDialog.appointmentId}
        appointment={
          rescheduleDialog.appointmentId
            ? [...(upcomingAppointments || []), ...(pastAppointments || [])]
                .find(apt => apt._id === rescheduleDialog.appointmentId)
            : undefined
        }
        onConfirm={handleRescheduleAppointment}
        isLoading={rescheduleDialog.appointmentId ? loadingStates.reschedule[rescheduleDialog.appointmentId.toString()] : false}
      />
    </>
  );
});

PatientAppointmentsPage.displayName = "PatientAppointmentsPage";

export default PatientAppointmentsPage;
