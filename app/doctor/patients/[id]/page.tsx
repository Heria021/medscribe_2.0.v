"use client";

import React from "react";
import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AddTreatmentForm } from "@/components/treatments/add-treatment-form";
import { AddMedicationForm } from "@/components/medications/add-medication-form";
import { Activity, Pill } from "lucide-react";
import {
  usePatientDetail,
  useTreatmentManagement,
  useMedicationManagement,
  PatientHeader,
  TreatmentList,
  TreatmentDetails,
  AppointmentForm,
  PatientChat,
  PatientDetailSkeleton,
  type ActiveView,
} from "@/app/doctor/_components/patient-detail";
import { cn } from "@/lib/utils";

interface PatientDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

/**
 * Patient Detail Page - Refactored with performance optimizations
 *
 * Features:
 * - Custom hooks for clean separation of concerns
 * - Performance optimized with React.memo and useCallback
 * - Reusable components for maintainability
 * - Comprehensive error handling
 * - Accessibility support
 */
const PatientDetailPage = React.memo<PatientDetailPageProps>(({ params }) => {
  const router = useRouter();
  const [activeView, setActiveView] = useState<ActiveView>("overview");
  const [showChat, setShowChat] = useState(false);
  const [showPrescriptionForm, setShowPrescriptionForm] = useState(false);

  // Custom hooks for clean separation of concerns
  const {
    patient,
    doctorProfile,
    currentDoctorPatient,
    isLoading: patientLoading,
    error: patientError,
  } = usePatientDetail(params);

  // Redirect if invalid patient ID (like "add")
  useEffect(() => {
    if (patientError === "Invalid patient ID") {
      router.replace("/doctor/patients");
    }
  }, [patientError, router]);

  const {
    activeTreatments,
    selectedTreatmentId,
    selectedTreatment,
    setSelectedTreatmentId,
    handleTreatmentStatusUpdate,
    isLoading: treatmentsLoading,
  } = useTreatmentManagement(patient?._id || null);

  const {
    activeMedications,
    selectedTreatmentMedications,
    handleMedicationStatusUpdate,
    isLoading: medicationsLoading,
  } = useMedicationManagement(patient?._id || null, selectedTreatment);

  // Memoized handlers for performance
  const handleChatToggle = useCallback(() => {
    setShowChat(prev => !prev);
  }, []);

  const handleAppointmentClick = useCallback(() => {
    setActiveView("appointment-form");
  }, []);

  const handleAddTreatment = useCallback(() => {
    setActiveView("treatment-form");
  }, []);

  const handleAddMedication = useCallback(() => {
    setActiveView("medication-form");
  }, []);

  const handleBackToOverview = useCallback(() => {
    setActiveView("overview");
  }, []);

  const handleTreatmentComplete = useCallback((treatmentId: string) => {
    handleTreatmentStatusUpdate(treatmentId, "completed");
  }, [handleTreatmentStatusUpdate]);

  const handleMedicationComplete = useCallback((medicationId: string) => {
    handleMedicationStatusUpdate(medicationId, "completed");
  }, [handleMedicationStatusUpdate]);

  const handleTogglePrescriptionForm = useCallback(() => {
    setShowPrescriptionForm(prev => !prev);
  }, []);

  // Show loading skeleton while data is loading
  const isLoading = patientLoading || treatmentsLoading || medicationsLoading;
  
  if (isLoading) {
    return <PatientDetailSkeleton />;
  }

  // Handle authentication and data availability
  if (patientError || !patient || !doctorProfile || !currentDoctorPatient) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-sm text-muted-foreground">
            {patientError || "Loading patient details..."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col space-y-4">
      {/* Patient Header */}
      <PatientHeader
        patient={patient}
        activeTreatments={activeTreatments}
        activeMedications={activeMedications}
        onChatToggle={handleChatToggle}
        onAppointmentClick={handleAppointmentClick}
        onAddTreatment={handleAddTreatment}
        showChat={showChat}
      />

      {/* Main Content */}
      <div className="flex-1 min-h-0">
        {activeView === "treatment-form" ? (
          <Card className="h-full flex flex-col">
            <CardHeader className="pb-3 flex-shrink-0">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <Activity className="h-4 w-4 text-blue-600" />
                  Add Treatment Plan
                </CardTitle>
                <Button variant="outline" size="sm" onClick={handleBackToOverview}>
                  Cancel
                </Button>
              </div>
            </CardHeader>
            <CardContent className="flex-1 min-h-0 p-0">
              <ScrollArea className="h-full">
                <div className="p-4">
                  <AddTreatmentForm
                    doctorPatientId={currentDoctorPatient._id}
                    patientId={patient._id}
                    onSuccess={handleBackToOverview}
                    onCancel={handleBackToOverview}
                  />
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        ) : activeView === "medication-form" ? (
          <Card className="h-full flex flex-col">
            <CardHeader className="pb-3 flex-shrink-0">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <Pill className="h-4 w-4 text-purple-600" />
                  Add Medication
                </CardTitle>
                <Button variant="outline" size="sm" onClick={handleBackToOverview}>
                  Cancel
                </Button>
              </div>
            </CardHeader>
            <CardContent className="flex-1 min-h-0 p-0">
              <ScrollArea className="h-full">
                <div className="p-4">
                  <AddMedicationForm
                    treatmentPlanId={selectedTreatmentId as any}
                    onSuccess={handleBackToOverview}
                    onCancel={handleBackToOverview}
                  />
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        ) : activeView === "appointment-form" ? (
          <AppointmentForm
            patientId={patient._id}
            currentDoctorPatient={currentDoctorPatient}
            patient={patient}
            doctorProfile={doctorProfile}
            onCancel={handleBackToOverview}
            onSuccess={handleBackToOverview}
          />
        ) : (
          <div className={cn(
            "h-full grid gap-4",
            showChat
              ? "grid-cols-1 lg:grid-cols-6"
              : "grid-cols-1 lg:grid-cols-4"
          )}>
            {/* Treatment List */}
            <div className={cn(
              "flex flex-col min-h-0",
              showChat
                ? "lg:col-span-1 lg:order-1 order-2"
                : "lg:col-span-1 lg:order-1 order-2"
            )}>
              <TreatmentList
                treatments={activeTreatments}
                selectedTreatmentId={selectedTreatmentId}
                onTreatmentSelect={setSelectedTreatmentId}
                onTreatmentComplete={handleTreatmentComplete}
                onAddTreatment={handleAddTreatment}
                activeMedications={activeMedications}
                isLoading={treatmentsLoading}
              />
            </div>

            {/* Treatment Details */}
            <div className={cn(
              "flex flex-col min-h-0",
              showChat
                ? "lg:col-span-3 lg:order-2 order-1"
                : "lg:col-span-3 lg:order-2 order-1"
            )}>
              <TreatmentDetails
                treatment={selectedTreatment}
                medications={selectedTreatmentMedications}
                onAddMedication={handleAddMedication}
                onMedicationComplete={handleMedicationComplete}
                onShowPrescriptionForm={handleTogglePrescriptionForm}
                showPrescriptionForm={showPrescriptionForm}
                patientId={patient._id}
              />
            </div>

            {/* Chat Interface */}
            {showChat && (
              <div className="lg:col-span-2 lg:order-3 order-3 flex flex-col min-h-0">
                <PatientChat
                  doctorId={doctorProfile._id}
                  patientId={patient._id}
                  patientName={`${patient.firstName} ${patient.lastName}`}
                  onClose={() => setShowChat(false)}
                />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
});

PatientDetailPage.displayName = "PatientDetailPage";

export default PatientDetailPage;
