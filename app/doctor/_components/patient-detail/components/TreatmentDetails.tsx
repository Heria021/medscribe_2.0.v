import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import {
  Activity,
  FileText,
  Target,
  Pill,
  Plus,
  CheckCircle,
  Eye,
} from "lucide-react";
import { PrescriptionForm } from "@/components/prescriptions/prescription-form";
import { PrescriptionList } from "@/components/prescriptions/prescription-list";
import { usePatientDetailFormatters } from "../hooks";
import type { TreatmentDetailsProps } from "../types";
import { cn } from "@/lib/utils";

/**
 * TreatmentDetails Component
 * 
 * Displays detailed information about a selected treatment plan
 * Includes medications, goals, and prescription management
 * Optimized for performance with React.memo
 */
export const TreatmentDetails = React.memo<TreatmentDetailsProps & { isLoading?: boolean }>(({
  treatment,
  medications,
  onAddMedication,
  onMedicationComplete,
  onShowPrescriptionForm,
  onAddPrescription,
  showPrescriptionForm,
  patientId,
  isLoading = false,
  className = "",
}) => {
  const { formatDate } = usePatientDetailFormatters();

  // Skeleton loading state
  if (isLoading || !treatment) {
    return (
      <Card className={cn("flex-1 min-h-0 flex flex-col bg-background border-border", className)}>
        <CardHeader className="p-0 flex-shrink-0">
          <div className="relative overflow-hidden rounded-t-lg bg-gradient-to-br from-muted/50 via-muted/30 to-transparent">
            <div className="relative px-4 py-4">
              <div className="flex items-start gap-4">
                <Skeleton className="h-11 w-11 rounded-xl" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4 mb-2">
                    <div className="flex-1 min-w-0 space-y-2">
                      <Skeleton className="h-6 w-48" />
                      <div className="flex items-center gap-2">
                        <Skeleton className="h-3 w-16" />
                        <Skeleton className="h-5 w-32 rounded-md" />
                      </div>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <div className="text-right space-y-1">
                        <Skeleton className="h-3 w-12" />
                        <Skeleton className="h-5 w-20 rounded-md" />
                      </div>
                      <Skeleton className="h-6 w-16 rounded-full" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex-1 min-h-0 p-3 md:p-6">
          <div className="space-y-4 md:space-y-6">
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-3 md:gap-6">
              <div className="space-y-2 md:space-y-3">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-4 w-4" />
                  <Skeleton className="h-4 md:h-5 w-24 md:w-32" />
                </div>
                <Skeleton className="h-16 md:h-24 w-full rounded-lg" />
              </div>
              <div className="space-y-2 md:space-y-3">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-4 w-4" />
                  <Skeleton className="h-4 md:h-5 w-20 md:w-28" />
                </div>
                <div className="space-y-1.5 md:space-y-2">
                  <Skeleton className="h-3 md:h-4 w-full" />
                  <Skeleton className="h-3 md:h-4 w-3/4" />
                  <Skeleton className="h-3 md:h-4 w-1/2" />
                </div>
              </div>
            </div>
            <div className="space-y-3 md:space-y-4">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <Skeleton className="h-4 w-4 flex-shrink-0" />
                  <Skeleton className="h-4 md:h-5 w-20 md:w-24" />
                </div>
                <Skeleton className="h-6 md:h-8 w-12 md:w-20 flex-shrink-0" />
              </div>
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-2 md:gap-3">
                {[1, 2].map((i) => (
                  <Skeleton key={i} className="h-16 md:h-20 w-full rounded-lg" />
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!treatment) {
    return (
      <Card className={cn("h-full flex items-center justify-center bg-background border-border", className)}>
        <div className="text-center p-8">
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
            <Eye className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-2 text-foreground">Select a Treatment Plan</h3>
          <p className="text-sm text-muted-foreground max-w-sm">
            Choose a treatment plan from the list to view detailed information, medications, and goals
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card className={cn("h-full flex flex-col bg-background border-border", className)}>
      <CardHeader className="p-0 flex-shrink-0">
        <div className="relative overflow-hidden rounded-t-lg">
          <div className="relative px-4">
            <div className="flex items-start gap-4">
              <div className="relative flex-shrink-0">
                <div className="absolute inset-0 bg-primary/20 rounded-lg blur-sm"></div>
                <div className="relative p-2 bg-primary/10 rounded-lg border border-primary/20">
                  <Activity className="h-4 w-4 text-primary" />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-4 mb-2">
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-base font-semibold text-foreground leading-tight truncate mb-1">
                      {treatment.title}
                    </CardTitle>
                    <p className="text-xs text-muted-foreground truncate">
                      {treatment.diagnosis}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <div className="text-right">
                      <div className="text-xs font-medium text-muted-foreground mb-1">Duration</div>
                      <div className="text-xs text-foreground bg-muted/50 px-2 py-1 rounded-md">
                        {formatDate(treatment.startDate)}
                        {treatment.endDate && (
                          <span className="mx-1">→ {formatDate(treatment.endDate)}</span>
                        )}
                      </div>
                    </div>
                    <div className="relative">
                      <div className="absolute inset-0 bg-primary/10 rounded-full blur-sm"></div>
                      <Badge
                        variant={treatment.status === 'active' ? 'default' : 'secondary'}
                        className="relative text-xs capitalize px-3 py-1 font-medium shadow-sm"
                      >
                        {treatment.status}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-1 min-h-0 p-0">
        <ScrollArea className="h-full">
          <div className="p-3 md:p-4 space-y-4 md:space-y-5">
            {/* Treatment Plan and Goals - Single Column Layout */}
            <div className="grid grid-cols-1 gap-3 md:gap-4">
              {/* Treatment Plan */}
              <div className="space-y-2 md:space-y-3">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-primary" />
                  <h3 className="font-semibold text-sm md:text-base text-foreground">Treatment Plan</h3>
                </div>
                <div className="bg-muted/50 rounded-lg p-3 md:p-4 border border-border">
                  <p className="text-xs md:text-sm leading-relaxed text-foreground">{treatment.plan}</p>
                </div>
              </div>

              {/* Goals */}
              {treatment.goals && treatment.goals.length > 0 && (
                <div className="space-y-2 md:space-y-3">
                  <div className="flex items-center gap-2">
                    <Target className="h-4 w-4 text-primary" />
                    <h3 className="font-semibold text-sm md:text-base text-foreground">
                      Goals ({treatment.goals.length})
                    </h3>
                  </div>
                  <div className="space-y-1.5 md:space-y-2">
                    {treatment.goals.map((goal: string, index: number) => (
                      <div key={index} className="flex items-start gap-2 md:gap-3 p-2 md:p-3 bg-muted/30 rounded-lg border border-border">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 md:mt-2 flex-shrink-0" />
                        <span className="text-xs md:text-sm leading-relaxed text-foreground">{goal}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <Separator className="my-2" />

            {/* Medications */}
            {medications && medications.length > 0 && (
              <div className="space-y-2 md:space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <Pill className="h-4 w-4 text-primary flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-sm md:text-base text-foreground truncate">
                        Current Medications ({medications.length})
                      </h3>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Active medications for this treatment plan
                      </p>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={onAddMedication}
                    className="h-6 md:h-7 px-2 md:px-3 text-xs flex-shrink-0"
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    <span className="hidden sm:inline">Add</span>
                  </Button>
                </div>
                <div className="grid grid-cols-1 gap-2 md:gap-3">
                  {medications.map((medication) => (
                    <div key={medication._id} className="p-3 md:p-4 bg-background rounded-lg border border-border hover:shadow-sm transition-shadow">
                      <div className="flex items-start justify-between mb-2 gap-2">
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-xs md:text-sm text-foreground mb-1 truncate">{medication.medicationName}</h4>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground flex-wrap">
                            <span className="bg-muted/50 px-1.5 md:px-2 py-0.5 rounded text-xs">{medication.dosage}</span>
                            <span className="hidden sm:inline">•</span>
                            <span className="bg-muted/50 px-1.5 md:px-2 py-0.5 rounded text-xs">{medication.frequency}</span>
                          </div>
                        </div>
                        <Badge
                          variant={medication.status === 'active' ? 'default' : 'secondary'}
                          className="text-xs capitalize flex-shrink-0"
                        >
                          {medication.status}
                        </Badge>
                      </div>
                      {medication.instructions && (
                        <div className="mb-2 p-2 bg-muted/30 rounded text-xs text-foreground">
                          <p className="line-clamp-2">{medication.instructions}</p>
                        </div>
                      )}
                      <div className="flex items-center justify-between pt-2 border-t border-border gap-2">
                        <span className="text-xs text-muted-foreground truncate">
                          {new Date(medication.startDate).toLocaleDateString()}
                        </span>
                        <div className="flex items-center gap-1">
                          {medication.status === 'active' && (
                            <>
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-5 md:h-6 px-1.5 md:px-2 text-xs flex-shrink-0"
                                onClick={() => onAddPrescription ? onAddPrescription() : onShowPrescriptionForm()}
                                title="Create prescription from this medication"
                              >
                                <Pill className="h-3 w-3 mr-1" />
                                <span className="hidden sm:inline">Prescribe</span>
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-5 md:h-6 px-1.5 md:px-2 text-xs flex-shrink-0"
                                onClick={() => onMedicationComplete(medication._id)}
                              >
                                <CheckCircle className="h-3 w-3 mr-1" />
                                <span className="hidden sm:inline">Complete</span>
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <Separator className="my-2" />

            {/* Add Medication Button if no medications */}
            {(!medications || medications.length === 0) && (
              <div className="text-center py-4 md:py-6 bg-muted/30 rounded-lg border border-dashed border-border">
                <div className="w-10 md:w-12 h-10 md:h-12 rounded-full bg-muted flex items-center justify-center mx-auto mb-2 md:mb-3">
                  <Pill className="h-5 md:h-6 w-5 md:w-6 text-muted-foreground" />
                </div>
                <h3 className="font-medium mb-1 text-foreground text-sm md:text-base">No Current Medications</h3>
                <p className="text-xs md:text-sm text-muted-foreground mb-3 md:mb-4 px-4">
                  Add medications that the patient is currently taking
                </p>
                <Button
                  size="sm"
                  onClick={onAddMedication}
                  className="h-7 md:h-8 px-3 md:px-4 text-xs"
                >
                  <Plus className="h-3 w-3 mr-1 md:mr-2" />
                  Add Medication
                </Button>
              </div>
            )}

            <Separator className="my-2" />

            {/* E-Prescribing Section */}
            <div className="space-y-2 md:space-y-3">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <Pill className="h-4 w-4 text-primary flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-sm md:text-base text-foreground truncate">
                      E-Prescribing
                    </h3>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Send electronic prescriptions to pharmacy
                    </p>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={onAddPrescription || onShowPrescriptionForm}
                  className="h-6 md:h-7 px-2 md:px-3 text-xs flex-shrink-0"
                >
                  <Plus className="h-3 w-3 mr-1" />
                  <span className="hidden sm:inline">Add</span>
                </Button>
              </div>

              {showPrescriptionForm && (
                <div className="p-3 md:p-4 bg-background rounded-lg border border-border hover:shadow-sm transition-shadow">
                  <PrescriptionForm
                    patientId={patientId}
                    treatmentPlanId={treatment._id as any}
                    onSuccess={(_prescriptionId) => {
                      onShowPrescriptionForm();
                    }}
                    onCancel={onShowPrescriptionForm}
                  />
                </div>
              )}

              <div className="grid grid-cols-1 gap-2 md:gap-3">
                <PrescriptionList patientId={patientId} />
              </div>
            </div>
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
});

TreatmentDetails.displayName = "TreatmentDetails";