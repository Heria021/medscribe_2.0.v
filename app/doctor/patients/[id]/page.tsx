"use client";

import React from "react";
import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { AddTreatmentForm } from "@/components/treatments/add-treatment-form";
import { AddMedicationForm } from "@/components/medications/add-medication-form";
import { PrescriptionForm } from "@/components/prescriptions/prescription-form";
import { Activity, Pill } from "lucide-react";
import {
  usePatientDetail,
  useTreatmentManagement,
  useMedicationManagement,
  PatientHeader,
  TreatmentList,
  TreatmentDetails,
  PatientChat,
  type ActiveView,
} from "@/app/doctor/_components/patient-detail";
import { SlotBasedAppointmentForm } from "@/app/doctor/_components/patient-detail/components/SlotBasedAppointmentForm";




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

  const handleAddPrescription = useCallback(() => {
    setActiveView("prescription-form");
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


  return (
    <div className="h-full flex flex-col p-4 space-y-4">
      {/* Patient Header */}
      <PatientHeader
        patient={patient}
        onChatToggle={handleChatToggle}
        onAppointmentClick={handleAppointmentClick}
        onAddTreatment={handleAddTreatment}
        onAddPrescription={handleAddPrescription}
        showChat={showChat}
        isLoading={patientLoading || !patient || !doctorProfile || !currentDoctorPatient}
      />

      {/* Main Content */}
      <div className="flex-1 min-h-0">
        {activeView === "treatment-form" ? (
          <Card className="h-full flex flex-col bg-background border-border">
            <CardHeader className="pb-3 flex-shrink-0">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2 text-foreground">
                  <Activity className="h-4 w-4 text-primary" />
                  Add Treatment Plan
                </CardTitle>
                <Button variant="outline" size="sm" onClick={handleBackToOverview}>
                  Cancel
                </Button>
              </div>
            </CardHeader>
            <CardContent className="flex-1 min-h-0 p-0">
              <ScrollArea className="h-full">
                <div className="p-6">
                  {patient && currentDoctorPatient ? (
                    <AddTreatmentForm
                      doctorPatientId={currentDoctorPatient._id}
                      patientId={patient._id}
                      onSuccess={handleBackToOverview}
                      onCancel={handleBackToOverview}
                    />
                  ) : (
                    <div className="space-y-4">
                      <Skeleton className="h-10 w-full" />
                      <Skeleton className="h-20 w-full" />
                      <Skeleton className="h-10 w-full" />
                    </div>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        ) : activeView === "medication-form" ? (
          <Card className="h-full flex flex-col bg-background border-border">
            <CardHeader className="pb-3 flex-shrink-0">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2 text-foreground">
                  <Pill className="h-4 w-4 text-primary" />
                  Add Current Medication
                </CardTitle>
                <Button variant="outline" size="sm" onClick={handleBackToOverview}>
                  Cancel
                </Button>
              </div>
            </CardHeader>
            <CardContent className="flex-1 min-h-0 p-0">
              <ScrollArea className="h-full">
                <div className="p-6">
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
          <div className="h-full flex flex-col">
            <ScrollArea className="h-full">
              <div className="p-6">
                {patient && currentDoctorPatient && doctorProfile ? (
                  <SlotBasedAppointmentForm
                    patientId={patient._id}
                    currentDoctorPatient={currentDoctorPatient}
                    patient={patient}
                    doctorProfile={doctorProfile}
                    onCancel={handleBackToOverview}
                    onSuccess={handleBackToOverview}
                  />
                ) : (
                  <div className="flex items-center justify-center min-h-[400px]">
                    <div className="text-center space-y-4">
                      <div className="space-y-2">
                        <Skeleton className="h-8 w-8 rounded-full mx-auto" />
                        <Skeleton className="h-4 w-48 mx-auto" />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>
        ) : activeView === "prescription-form" ? (
          <Card className="h-full flex flex-col bg-background border-border">
            <CardHeader className="pb-3 flex-shrink-0">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2 text-foreground">
                  <Pill className="h-4 w-4 text-primary" />
                  Create E-Prescription
                </CardTitle>
                <Button variant="outline" size="sm" onClick={handleBackToOverview}>
                  Cancel
                </Button>
              </div>
            </CardHeader>
            <CardContent className="flex-1 min-h-0 p-0">
              <ScrollArea className="h-full">
                <div className="p-6">
                  {patient ? (
                    <PrescriptionForm
                      patientId={patient._id}
                      onSuccess={handleBackToOverview}
                      onCancel={handleBackToOverview}
                    />
                  ) : (
                    <div className="text-center space-y-4">
                      <div className="space-y-2">
                        <Skeleton className="h-8 w-8 rounded-full mx-auto" />
                        <Skeleton className="h-4 w-48 mx-auto" />
                      </div>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        ) : (
          <div className="h-full flex flex-col lg:flex-row gap-4">
            {/* Left Side: Treatment List - Fixed width on large screens */}
            <div className="flex flex-col min-h-0 lg:w-80 lg:flex-shrink-0 order-2 lg:order-1">
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

            {/* Right Side: Treatment Details and Chat */}
            <div className="flex-1 min-h-0 order-1 lg:order-2">
              {showChat ? (
                /* When chat is open: Split between Treatment Details and Chat */
                <div className="h-full grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {/* Treatment Details */}
                  <div className="flex flex-col min-h-0">
                    {patient ? (
                      <TreatmentDetails
                        treatment={selectedTreatment}
                        medications={selectedTreatmentMedications}
                        onAddMedication={handleAddMedication}
                        onMedicationComplete={handleMedicationComplete}
                        onShowPrescriptionForm={handleTogglePrescriptionForm}
                        onAddPrescription={handleAddPrescription}
                        showPrescriptionForm={showPrescriptionForm}
                        patientId={patient._id}
                        isLoading={treatmentsLoading || medicationsLoading}
                      />
                    ) : (
                      <Card className="h-full flex flex-col bg-background border-border">
                        <CardContent className="flex-1 flex items-center justify-center">
                          <div className="text-center space-y-4">
                            <div className="space-y-2">
                              <Skeleton className="h-8 w-8 rounded-full mx-auto" />
                              <Skeleton className="h-4 w-48 mx-auto" />
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </div>

                  {/* Chat Interface */}
                  <div className="h-full flex flex-col">
                    {patient && doctorProfile && (
                      <PatientChat
                        doctorId={doctorProfile._id}
                        patientId={patient._id}
                        patientName={`${patient.firstName} ${patient.lastName}`}
                        onClose={() => setShowChat(false)}
                      />
                    )}
                  </div>
                </div>
              ) : (
                /* When chat is closed: Full width Treatment Details */
                <div className="h-full">
                  {patient ? (
                    <TreatmentDetails
                      treatment={selectedTreatment}
                      medications={selectedTreatmentMedications}
                      onAddMedication={handleAddMedication}
                      onMedicationComplete={handleMedicationComplete}
                      onShowPrescriptionForm={handleTogglePrescriptionForm}
                      onAddPrescription={handleAddPrescription}
                      showPrescriptionForm={showPrescriptionForm}
                      patientId={patient._id}
                      isLoading={treatmentsLoading || medicationsLoading}
                    />
                  ) : (
                    <Card className="h-full flex flex-col bg-background border-border">
                      <CardContent className="flex-1 flex items-center justify-center">
                        <div className="text-center space-y-4">
                          <div className="space-y-2">
                            <Skeleton className="h-8 w-8 rounded-full mx-auto" />
                            <Skeleton className="h-4 w-48 mx-auto" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
});

PatientDetailPage.displayName = "PatientDetailPage";

export default PatientDetailPage;
