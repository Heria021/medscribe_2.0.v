"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useState, useCallback } from "react";
import {
  useDoctorAuth,
  useDoctorPatients,
  PatientsList,
  PatientFilters,
  PatientsSkeleton,
  AddPatientDialog,
} from "@/app/doctor/_components/patients";

/**
 * Doctor Patients Page - Refactored with performance optimizations
 *
 * Features:
 * - Custom hooks for clean separation of concerns
 * - Performance optimized with React.memo and useCallback
 * - Reusable components for maintainability
 * - Comprehensive error handling
 * - Accessibility support
 */
const DoctorPatientsPage = React.memo(() => {
  const router = useRouter();
  const [showAddDialog, setShowAddDialog] = useState(false);

  // Custom hooks for clean separation of concerns
  const {
    isLoading: authLoading,
    isAuthenticated,
    isDoctor,
    doctorProfile
  } = useDoctorAuth();

  const {
    filteredPatients,
    isLoading: patientsLoading,
    searchTerm,
    setSearchTerm,
  } = useDoctorPatients(doctorProfile);

  // Memoized handlers for performance - MUST be called before any conditional returns
  const handleAddPatient = useCallback(() => {
    setShowAddDialog(true);
  }, []);

  const handlePatientAction = useCallback((action: string, patientId: any) => {
    if (action === "view") {
      router.push(`/doctor/patients/${patientId}`);
    }
    // Additional handling if needed
    console.log(`Patient ${action}:`, patientId);
  }, [router]);

  const handleAddPatientSuccess = useCallback(() => {
    // Optionally refresh the patients list or show a success message
    console.log("Patient added successfully!");
  }, []);

  // Show loading skeleton while data is loading
  if (authLoading || patientsLoading) {
    return <PatientsSkeleton />;
  }

  // Redirect if not authenticated (handled by useDoctorAuth)
  if (!isAuthenticated || !isDoctor) {
    return null;
  }

  return (
    <div className="h-full flex flex-col space-y-4">
      {/* Header */}
      <div className="flex-shrink-0 space-y-1">
        <h1 className="text-xl font-bold tracking-tight">
          My Patients
        </h1>
        <p className="text-muted-foreground text-sm">
          Manage and view all patients under your care
        </p>
      </div>

      {/* Filters */}
      <div className="flex-shrink-0">
        <PatientFilters
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          onAddPatient={handleAddPatient}
        />
      </div>

      {/* Patients List - Takes remaining height */}
      <div className="flex-1 min-h-0">
        <PatientsList
          patients={filteredPatients}
          isLoading={patientsLoading}
          emptyMessage={
            searchTerm
              ? "No patients match your search criteria."
              : "You don't have any assigned patients yet."
          }
          onPatientAction={handlePatientAction}
        />
      </div>

      {/* Add Patient Dialog */}
      <AddPatientDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        onSuccess={handleAddPatientSuccess}
      />
    </div>
  );
});

DoctorPatientsPage.displayName = "DoctorPatientsPage";

export default DoctorPatientsPage;
