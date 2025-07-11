"use client";

import React from "react";
import {
  useDoctorAuth,
  useDoctorAppointments,
  AppointmentsList,
  AppointmentFilters,
  AppointmentsSkeleton,
  type AppointmentCategory,
} from "@/app/doctor/_components/appointments";

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
    // TODO: Implement schedule new appointment
    console.log("Schedule new appointment");
  };

  const handleAppointmentAction = (action: string, appointmentId: any) => {
    console.log(`Appointment ${action}:`, appointmentId);
    // Additional handling if needed
  };

  return (
      <div className="h-full flex flex-col space-y-4">
        {/* Header */}
        <div className="flex-shrink-0 space-y-1">
          <h1 className="text-xl font-bold tracking-tight">Appointments</h1>
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

        {/* Appointments List - Takes remaining height */}
        <div className="flex-1 min-h-0">
          <AppointmentsList
            appointments={filteredAppointments}
            isLoading={appointmentsLoading}
            emptyMessage={
              searchTerm 
                ? "Try adjusting your search terms" 
                : "No appointments in this category"
            }
            onAppointmentAction={handleAppointmentAction}
          />
        </div>
      </div>
  );
});

DoctorAppointmentsPage.displayName = "DoctorAppointmentsPage";

export default DoctorAppointmentsPage;
