"use client";

import React from "react";
import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { AddTreatmentForm } from "@/app/doctor/_components/patient-detail/components/AddTreatmentForm";

import { PrescriptionForm } from "@/components/prescriptions/prescription-form";
import { Activity, Pill } from "lucide-react";
import { TreatmentViewer, useTreatmentViewer, type TreatmentPlan } from "@/components/ui/treatment-viewer";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import {
  usePatientDetail,
  useTreatmentManagement,

  PatientHeader,
  PatientChat,
  type ActiveView,
} from "@/app/doctor/_components/patient-detail";

// Import new treatment components
import { TreatmentList, TreatmentDetails } from "@/app/doctor/_components/patient-detail";
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
  // Removed showPrescriptionForm state as it's no longer used



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
    selectedTreatmentId,
    setSelectedTreatmentId,
  } = useTreatmentManagement(patient?._id || null);

  // TreatmentViewer state management
  const treatmentViewer = useTreatmentViewer();

  // Fetch detailed treatment data for viewer
  const selectedTreatmentDetails = useQuery(
    api.treatmentPlans.getWithDetailsById,
    selectedTreatmentId ? { id: selectedTreatmentId as Id<"treatmentPlans"> } : "skip"
  );

  // Note: Medication management now handled through prescription system

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

  // Note: Medication form removed - use prescription form instead

  const handleAddPrescription = useCallback(() => {
    setActiveView("prescription-form");
  }, []);

  const handleBackToOverview = useCallback(() => {
    setActiveView("overview");
  }, []);

  // Treatment viewer handler
  const handleViewTreatment = useCallback(() => {
    if (selectedTreatmentDetails) {
      // Transform the treatment data to match TreatmentViewer interface
      const treatmentForViewer: TreatmentPlan = {
        _id: selectedTreatmentDetails._id,
        title: selectedTreatmentDetails.title,
        diagnosis: selectedTreatmentDetails.diagnosis,
        plan: selectedTreatmentDetails.plan,
        goals: selectedTreatmentDetails.goals,
        status: selectedTreatmentDetails.status,
        startDate: selectedTreatmentDetails.startDate,
        endDate: selectedTreatmentDetails.endDate,
        createdAt: selectedTreatmentDetails.createdAt,
        updatedAt: selectedTreatmentDetails.updatedAt,
        medicationDetails: selectedTreatmentDetails.medicationDetails,
        pharmacy: selectedTreatmentDetails.pharmacy || undefined,
        doctor: selectedTreatmentDetails.doctor || undefined,
        patient: selectedTreatmentDetails.patient || undefined,
        // Note: SOAP note data structure is complex, will be handled in future iteration
        soapNote: undefined,
        patientName: selectedTreatmentDetails.patient
          ? `${selectedTreatmentDetails.patient.firstName} ${selectedTreatmentDetails.patient.lastName}`
          : undefined,
        doctorName: selectedTreatmentDetails.doctor
          ? `Dr. ${selectedTreatmentDetails.doctor.firstName} ${selectedTreatmentDetails.doctor.lastName}`
          : undefined,
      };

      treatmentViewer.openViewer(treatmentForViewer);
    }
  }, [selectedTreatmentDetails, treatmentViewer]);

  // Note: Medication management now handled through prescription system
  // Removed unused functions: handleTreatmentComplete, handleTogglePrescriptionForm


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
          <AddTreatmentForm
            patientId={patient?._id || ""}
            onSuccess={handleBackToOverview}
            onCancel={handleBackToOverview}
          />
        ) : activeView === "prescription-form" ? (
          <Card className="h-full flex flex-col bg-background border-border">
            <CardHeader className="pb-3 flex-shrink-0">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2 text-foreground">
                  <Pill className="h-4 w-4 text-primary" />
                  Add Prescription
                </CardTitle>
                <Button variant="outline" size="sm" onClick={handleBackToOverview}>
                  Cancel
                </Button>
              </div>
            </CardHeader>
            <CardContent className="flex-1 min-h-0 p-0">
              <ScrollArea className="h-full">
                <div className="p-6">
                  {patient && (
                    <PrescriptionForm
                      patientId={patient._id}
                      treatmentPlanId={selectedTreatmentId as any}
                      onSuccess={handleBackToOverview}
                      onCancel={handleBackToOverview}
                    />
                  )}
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
        ) : (activeView as string) === "prescription-form" ? (
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
              {patient && (
                <TreatmentList
                  patientId={patient._id}
                  selectedTreatmentId={selectedTreatmentId || undefined}
                  onSelectTreatment={setSelectedTreatmentId}
                  onViewTreatment={(id: string) => setSelectedTreatmentId(id)}
                  onAddTreatment={handleAddTreatment}
                />
              )}
            </div>

            {/* Right Side: Treatment Details and Chat */}
            <div className="flex-1 min-h-0 order-1 lg:order-2">
              {showChat ? (
                /* When chat is open: Split between Treatment Details and Chat */
                <div className="h-full grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {/* Treatment Details */}
                  <div className="flex flex-col min-h-0">
                    {patient ? (
                      selectedTreatmentId ? (
                        <TreatmentDetails
                          treatmentId={selectedTreatmentId}
                          onEdit={() => handleAddTreatment()}
                          onView={handleViewTreatment}
                          onStatusChange={(status) => {
                            console.log("Status change:", selectedTreatmentId, status);
                          }}
                        />
                      ) : (
                        <Card className="h-full flex flex-col bg-background border-border">
                          <CardContent className="flex-1 flex items-center justify-center">
                            <div className="text-center space-y-4">
                              <Activity className="h-12 w-12 mx-auto text-muted-foreground" />
                              <div className="space-y-2">
                                <h3 className="font-semibold">Select a Treatment</h3>
                                <p className="text-sm text-muted-foreground">
                                  Choose a treatment from the list to view details
                                </p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      )
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
                    selectedTreatmentId ? (
                      <TreatmentDetails
                        treatmentId={selectedTreatmentId}
                        onEdit={() => handleAddTreatment()}
                        onView={handleViewTreatment}
                        onStatusChange={(status) => {
                          console.log("Status change:", selectedTreatmentId, status);
                        }}
                      />
                    ) : (
                      <Card className="h-full flex flex-col bg-background border-border">
                        <CardContent className="flex-1 flex items-center justify-center">
                          <div className="text-center space-y-4">
                            <Activity className="h-12 w-12 mx-auto text-muted-foreground" />
                            <div className="space-y-2">
                              <h3 className="font-semibold">Select a Treatment</h3>
                              <p className="text-sm text-muted-foreground">
                                Choose a treatment from the list to view details
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )
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

      {/* TreatmentViewer for full-screen document view */}
      <TreatmentViewer
        treatment={treatmentViewer.selectedTreatment}
        open={treatmentViewer.isOpen}
        onOpenChange={treatmentViewer.setOpen}
        config={{
          showBackButton: true,
          showActions: true,
          showPatientInfo: true, // Show patient info in doctor context
          showDoctorInfo: true,
          showMetadata: true,
          allowPrint: true,
          allowDownload: true,
          allowShare: true,
          allowCopy: true,
          allowExportPDF: true,
          backButtonText: "Back to Patient Details",
          documentTitle: "Treatment Plan - Doctor View"
        }}
        actions={{
          onBack: treatmentViewer.closeViewer,
          onDownload: (treatment) => {
            console.log("Downloading treatment:", treatment.title);
            // Implement download logic
          },
          onShare: (treatment) => {
            console.log("Sharing treatment:", treatment.title);
            // Implement share logic
          },
        }}
      />
    </div>
  );
});

PatientDetailPage.displayName = "PatientDetailPage";

export default PatientDetailPage;
