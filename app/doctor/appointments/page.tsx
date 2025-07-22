"use client";

import React, { useState, useEffect } from "react";
import {
  useDoctorAuth,
  useDoctorAppointments,
  AppointmentsList,
  AppointmentFilters,
  AppointmentsSkeleton,
  AppointmentDetails,
  type AppointmentCategory,
  type Appointment,
} from "@/app/doctor/_components/appointments";
import { useAppointmentActions } from "@/app/doctor/_components/appointments/hooks/useAppointmentActions";
import { RescheduleDialog } from "@/app/doctor/_components/appointments/components/RescheduleDialog";
import { ScheduleAppointmentDialog } from "@/app/doctor/_components/appointments/components/ScheduleAppointmentDialog";

/**
 * Doctor Appointments Page - Refactored with performance optimizations
 *
 * Features:
 * - Custom hooks for clean separation of concerns
 * - Performance optimized with React.memo and useCallback
 * - Reusable components for maintainability
 * - Comprehensive error handling
 * - Accessibility support
 */
const DoctorAppointmentsPage = React.memo(() => {
  // State for selected appointment and dialogs
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [showScheduleDialog, setShowScheduleDialog] = useState(false);

  // Custom hooks for clean separation of concerns
  const {
    isLoading: authLoading,
    isAuthenticated,
    isDoctor,
    doctorProfile
  } = useDoctorAuth();

  const {
    appointments,
    categorizedAppointments,
    filteredAppointments,
    isLoading: appointmentsLoading,
    searchTerm,
    selectedCategory,
    setSearchTerm,
    setSelectedCategory,
  } = useDoctorAppointments(doctorProfile) as any; // Extended return type

  // Additional state management
  const [showRescheduleDialog, setShowRescheduleDialog] = useState(false);

  // Appointment actions hook
  const { rescheduleAppointmentWithSlot } = useAppointmentActions();

  // Auto-update selected appointment when appointments data changes
  useEffect(() => {
    if (selectedAppointment && appointments) {
      const updatedAppointment = appointments.find((apt: Appointment) => apt._id === selectedAppointment._id);
      if (updatedAppointment && updatedAppointment.status !== selectedAppointment.status) {
        setSelectedAppointment(updatedAppointment);
      }
    }
  }, [appointments, selectedAppointment]);

  // Show loading skeleton while data is loading
  if (authLoading || appointmentsLoading) {
    return <AppointmentsSkeleton />;
  }

  // Redirect if not authenticated (handled by useDoctorAuth)
  if (!isAuthenticated || !isDoctor) {
    return null;
  }



  // Prepare category data for filters
  const categories = [
    { key: "all" as AppointmentCategory, label: "All", count: appointments?.length || 0 },
    { key: "today" as AppointmentCategory, label: "Today", count: categorizedAppointments.today?.length || 0 },
    { key: "tomorrow" as AppointmentCategory, label: "Tomorrow", count: categorizedAppointments.tomorrow?.length || 0 },
    { key: "thisWeek" as AppointmentCategory, label: "This Week", count: categorizedAppointments.thisWeek?.length || 0 },
    { key: "upcoming" as AppointmentCategory, label: "Upcoming", count: categorizedAppointments.upcoming?.length || 0 },
    { key: "past" as AppointmentCategory, label: "Past", count: categorizedAppointments.past?.length || 0 },
  ];

  const handleScheduleNew = () => {
    setShowScheduleDialog(true);
  };

  const handleAppointmentAction = (action: string, appointmentId: any) => {
    console.log(`Appointment ${action}:`, appointmentId);

    // If the selected appointment was updated, refresh it
    if (selectedAppointment && selectedAppointment._id === appointmentId) {
      // Find the updated appointment from the appointments list
      const updatedAppointment = appointments?.find((apt: Appointment) => apt._id === appointmentId);
      if (updatedAppointment) {
        setSelectedAppointment(updatedAppointment);
      }
    }

    // Handle specific actions
    switch (action) {
      case "reschedule":
        setShowRescheduleDialog(true);
        console.log("Opening reschedule dialog for:", appointmentId);
        break;
      default:
        // For other actions, the appointment status should be updated automatically
        // via the real-time Convex subscription
        break;
    }
  };

  const handleAppointmentSelect = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
  };

  const handleReschedule = async (appointmentId: string, newSlotId: string, reason?: string) => {
    try {
      // Call the slot-based reschedule function
      await rescheduleAppointmentWithSlot(
        appointmentId as any,
        newSlotId as any,
        reason
      );

    } catch (error) {
      console.error("Error rescheduling appointment:", error);
      throw error; // Re-throw so the dialog can handle it
    }
  };

  return (
    <div className="h-full flex flex-col p-4 space-y-3">
      {/* Header */}
      <div className="flex-shrink-0 space-y-1">
        <h1 className="text-xl font-bold tracking-tight text-foreground">Appointments</h1>
        <p className="text-muted-foreground text-sm">
          Manage your schedule and upcoming appointments
        </p>
      </div>

      {/* Filters */}
      <div className="flex-shrink-0">
        <AppointmentFilters
          searchTerm={searchTerm}
          selectedCategory={selectedCategory}
          categories={categories}
          onSearchChange={setSearchTerm}
          onCategoryChange={setSelectedCategory}
          onScheduleNew={handleScheduleNew}
        />
      </div>

      {/* Split Layout - Appointments List & Details */}
      <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-3 gap-3">
        {/* Left Side - Appointments List */}
        <div className="lg:col-span-2 min-h-0">
          <AppointmentsList
            appointments={filteredAppointments}
            isLoading={appointmentsLoading}
            emptyMessage={
              searchTerm
                ? "Try adjusting your search terms"
                : "No appointments in this category"
            }
            onAppointmentAction={handleAppointmentAction}
            onAppointmentSelect={handleAppointmentSelect}
            selectedAppointmentId={selectedAppointment?._id}
          />
        </div>

        {/* Right Side - Selected Appointment Details */}
        <div className="lg:col-span-1 min-h-0">
          <AppointmentDetails
            appointment={selectedAppointment}
            onStatusChange={handleAppointmentAction}
          />
        </div>
      </div>

      {/* Reschedule Dialog */}
      <RescheduleDialog
        appointment={selectedAppointment}
        open={showRescheduleDialog}
        onOpenChange={setShowRescheduleDialog}
        onReschedule={handleReschedule}
      />

      {/* Schedule New Appointment Dialog */}
      {doctorProfile && (
        <ScheduleAppointmentDialog
          open={showScheduleDialog}
          onOpenChange={setShowScheduleDialog}
          doctorProfile={doctorProfile}
        />
      )}
    </div>
  );
});

DoctorAppointmentsPage.displayName = "DoctorAppointmentsPage";

export default DoctorAppointmentsPage;
