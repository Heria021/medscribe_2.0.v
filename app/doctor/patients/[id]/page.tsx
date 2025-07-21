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
// import { TreatmentViewer, useTreatmentViewer, type TreatmentPlan } from "@/components/ui/treatment-viewer";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { cn } from "@/lib/utils";
import { useTreatmentViewer, TreatmentViewer } from "@/components/ui/treatment-viewer";
import ErrorBoundary from "@/components/error/error-boundary";
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
import { PatientSOAPHistory } from "@/app/doctor/_components/patient-detail/components/PatientSOAPHistory";




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
  const [showSOAPHistory, setShowSOAPHistory] = useState(false);
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
    handleTreatmentStatusUpdate,
  } = useTreatmentManagement(patient?._id || null);

  // TreatmentViewer state management
  const treatmentViewer = useTreatmentViewer();

  // Fetch detailed treatment data for viewer
  const selectedTreatmentDetails = useQuery(
    api.treatmentPlans.getWithDetailsById,
    selectedTreatmentId ? { id: selectedTreatmentId as Id<"treatmentPlans"> } : "skip"
  );

  // Note: Medication management now handled through prescription system

  // Memoized handlers for performance with mutual exclusivity
  const handleChatToggle = useCallback(() => {
    setShowChat(prev => {
      const newShowChat = !prev;
      // If opening chat, close SOAP history
      if (newShowChat) {
        setShowSOAPHistory(false);
      }
      return newShowChat;
    });
  }, []);

  const handleSOAPHistoryToggle = useCallback(() => {
    setShowSOAPHistory(prev => {
      const newShowSOAPHistory = !prev;
      // If opening SOAP history, close chat
      if (newShowSOAPHistory) {
        setShowChat(false);
      }
      return newShowSOAPHistory;
    });
  }, []);

  const handleAppointmentClick = useCallback(() => {
    setActiveView("appointment-form");
  }, []);

  const handleAddTreatment = useCallback(() => {
    setActiveView("treatment-form");
  }, []);

  // Note: Medication form removed - use prescription form instead

  const handleBackToOverview = useCallback(() => {
    setActiveView("overview");
  }, []);

  // Treatment viewer handler
  const handleViewTreatment = useCallback(() => {
    if (selectedTreatmentId && selectedTreatmentDetails) {
      treatmentViewer.openViewer(selectedTreatmentDetails);
    }
  }, [selectedTreatmentId, selectedTreatmentDetails, treatmentViewer]);

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
        onSOAPHistoryToggle={handleSOAPHistoryToggle}
        showChat={showChat}
        showSOAPHistory={showSOAPHistory}
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
                <ErrorBoundary context="Treatment List">
                  <TreatmentList
                    patientId={patient._id}
                    selectedTreatmentId={selectedTreatmentId || undefined}
                    onSelectTreatment={setSelectedTreatmentId}
                    onViewTreatment={handleViewTreatment}
                    onStatusChange={(treatmentId: string, status: string) => {
                      handleTreatmentStatusUpdate(treatmentId, status, selectedTreatmentDetails);
                    }}
                  />
                </ErrorBoundary>
              )}
            </div>

            {/* Right Side: Treatment Details, Chat, and SOAP History */}
            <div className="flex-1 min-h-0 order-1 lg:order-2">
              {showChat || showSOAPHistory ? (
                /* When chat or SOAP history is open: Split layout */
                <div className={cn(
                  "h-full grid gap-4",
                  showChat && showSOAPHistory
                    ? "grid-cols-1 lg:grid-cols-3"
                    : "grid-cols-1 lg:grid-cols-2"
                )}>
                  {/* Treatment Details */}
                  <div className="flex flex-col min-h-0">
                    {patient ? (
                      selectedTreatmentId ? (
                        <ErrorBoundary context="Treatment Details">
                          <TreatmentDetails
                            treatmentId={selectedTreatmentId}
                            onView={handleViewTreatment}
                            onStatusChange={(status) => {
                              if (selectedTreatmentId) {
                                handleTreatmentStatusUpdate(selectedTreatmentId, status, selectedTreatmentDetails);
                              }
                            }}
                          />
                        </ErrorBoundary>
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
                  {showChat && (
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
                  )}

                  {/* SOAP History Interface */}
                  {showSOAPHistory && patient && doctorProfile && (
                    <div className="h-full flex flex-col">
                      <PatientSOAPHistory
                        patientId={patient._id}
                        doctorId={doctorProfile._id}
                        onClose={() => setShowSOAPHistory(false)}
                      />
                    </div>
                  )}
                </div>
              ) : (
                /* When chat is closed: Full width Treatment Details */
                <div className="h-full">
                  {patient ? (
                    selectedTreatmentId ? (
                      <TreatmentDetails
                        treatmentId={selectedTreatmentId}
                        onView={handleViewTreatment}
                        onStatusChange={(status) => {
                          if (selectedTreatmentId) {
                            handleTreatmentStatusUpdate(selectedTreatmentId, status, selectedTreatmentDetails);
                          }
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
      {/* <TreatmentViewer
        treatmentId={selectedTreatmentId}
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
      /> */}

      {/* Treatment Viewer */}
      <TreatmentViewer
        treatment={treatmentViewer.selectedTreatment}
        open={treatmentViewer.isOpen}
        onOpenChange={treatmentViewer.setOpen}
        config={{
          showBackButton: true,
          showActions: true,
          showPatientInfo: true,
          showDoctorInfo: true,
          showMetadata: true,
          allowPrint: true,
          allowDownload: true,
          allowShare: true,
          allowCopy: true,
          allowExportPDF: true,
          backButtonText: "Back to Patient",
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
