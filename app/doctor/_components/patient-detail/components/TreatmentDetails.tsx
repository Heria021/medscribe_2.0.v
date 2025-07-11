import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Activity,
  Calendar,
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
export const TreatmentDetails = React.memo<TreatmentDetailsProps>(({
  treatment,
  medications,
  onAddMedication,
  onMedicationComplete,
  onShowPrescriptionForm,
  showPrescriptionForm,
  patientId,
  className = "",
}) => {
  const { formatDate } = usePatientDetailFormatters();

  if (!treatment) {
    return (
      <div className={cn("h-full flex items-center justify-center", className)}>
        <div className="text-center">
          <Eye className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="font-semibold mb-2">Select a Treatment</h3>
          <p className="text-sm text-muted-foreground">
            Choose a treatment from the list to view detailed information
          </p>
        </div>
      </div>
    );
  }

  return (
    <Card className={cn("flex-1 min-h-0 flex flex-col", className)}>
      <CardHeader className="pb-3 flex-shrink-0">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3 flex-1">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Activity className="h-4 w-4 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <CardTitle className="text-lg mb-1">{treatment.title}</CardTitle>
              <p className="text-sm text-muted-foreground">
                <span className="font-medium">Diagnosis:</span> {treatment.diagnosis}
              </p>
              <div className="flex items-center gap-2 text-xs text-muted-foreground mt-2">
                <Calendar className="h-3 w-3" />
                <span>Started {formatDate(treatment.startDate)}</span>
                {treatment.endDate && (
                  <>
                    <span>•</span>
                    <span>Ends {formatDate(treatment.endDate)}</span>
                  </>
                )}
              </div>
            </div>
          </div>
          <Badge variant="outline" className="text-sm">
            {treatment.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="flex-1 min-h-0 p-0">
        <ScrollArea className="h-full scrollbar-hide">
          <div className="p-4 space-y-5">
            {/* Treatment Plan and Goals - Adjacent Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Treatment Plan */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <h3 className="font-semibold text-base">Treatment Plan</h3>
                </div>
                <div className="bg-muted/50 rounded-lg p-4">
                  <p className="text-sm leading-relaxed">{treatment.plan}</p>
                </div>
              </div>

              {/* Goals */}
              {treatment.goals && treatment.goals.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Target className="h-4 w-4 text-muted-foreground" />
                    <h3 className="font-semibold text-base">Treatment Goals</h3>
                  </div>
                  <div className="space-y-2">
                    {treatment.goals.map((goal: string, index: number) => (
                      <div key={index} className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
                        <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                        <span className="text-sm leading-relaxed">{goal}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Medications */}
            {medications && medications.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Pill className="h-4 w-4 text-muted-foreground" />
                  <h3 className="font-semibold text-base">Medications ({medications.length})</h3>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={onAddMedication}
                    className="ml-auto h-7 px-3 text-xs"
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    Add
                  </Button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {medications.map((medication) => (
                    <div key={medication._id} className="p-3 bg-blue-50/50 dark:bg-blue-950/10 rounded-lg border border-blue-200/50 dark:border-blue-800/50">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-sm text-foreground">{medication.medicationName}</h4>
                          <p className="text-xs text-muted-foreground">{medication.dosage} • {medication.frequency}</p>
                        </div>
                        <Badge variant="outline" className="text-xs ml-2">
                          {medication.status}
                        </Badge>
                      </div>
                      {medication.instructions && (
                        <p className="text-xs text-muted-foreground mt-2">{medication.instructions}</p>
                      )}
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs text-muted-foreground">
                          Started: {new Date(medication.startDate).toLocaleDateString()}
                        </span>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-6 px-2 text-xs"
                          onClick={() => onMedicationComplete(medication._id)}
                        >
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Complete
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Add Medication Button if no medications */}
            {(!medications || medications.length === 0) && (
              <div className="text-center py-6">
                <Pill className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
                <h3 className="font-medium mb-2">No Medications</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Add medications for this treatment plan
                </p>
                <Button
                  size="sm"
                  onClick={onAddMedication}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Medication
                </Button>
              </div>
            )}

            {/* E-Prescribing Section */}
            <div className="border rounded-xl p-4 bg-blue-50 dark:bg-blue-950/20">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Pill className="h-4 w-4 text-blue-600" />
                  <h3 className="font-semibold text-base text-blue-900 dark:text-blue-100">E-Prescribing</h3>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={onShowPrescriptionForm}
                  className="h-8"
                >
                  <Plus className="h-3 w-3 mr-1" />
                  {showPrescriptionForm ? "Hide Form" : "Add Prescription"}
                </Button>
              </div>

              {showPrescriptionForm && (
                <div className="mt-4">
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

              {!showPrescriptionForm && (
                <div className="space-y-3">
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    Create electronic prescriptions for this treatment plan
                  </p>
                  <PrescriptionList patientId={patientId} />
                </div>
              )}
            </div>
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
});

TreatmentDetails.displayName = "TreatmentDetails";
