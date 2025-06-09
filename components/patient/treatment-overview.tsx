"use client";

import { useQuery } from "convex/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Activity,
  Pill,
  Calendar,
  Clock,
  Plus,
  Loader2
} from "lucide-react";
import { api } from "@/convex/_generated/api";
import Link from "next/link";

interface TreatmentOverviewProps {
  patientId: string;
}

export function TreatmentOverview({ patientId }: TreatmentOverviewProps) {
  const activeTreatments = useQuery(
    api.treatmentPlans.getWithDetailsByPatientId,
    { patientId: patientId as any }
  );

  const activeMedications = useQuery(
    api.medications.getActiveByPatientId,
    { patientId: patientId as any }
  );

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric"
    });
  };

  const isLoading = activeTreatments === undefined || activeMedications === undefined;

  if (isLoading) {
    return (
      <Card className="h-full flex flex-col">
        <CardHeader className="pb-3 flex-shrink-0">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Current Treatment</CardTitle>
            <Link href="/patient/treatments">
              <Button variant="outline" size="sm" className="h-7 px-3 text-xs">
                <Activity className="h-3 w-3 mr-1" />
                View All
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent className="flex-1 flex items-center justify-center">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span className="text-sm">Loading treatments...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  const medicationsByTreatment = new Map();
  if (activeMedications) {
    activeMedications.forEach((medication) => {
      if (medication.treatmentPlanId) {
        if (!medicationsByTreatment.has(medication.treatmentPlanId)) {
          medicationsByTreatment.set(medication.treatmentPlanId, []);
        }
        medicationsByTreatment.get(medication.treatmentPlanId).push(medication);
      }
    });
  }

  const activeFilteredTreatments = activeTreatments?.filter(t => t.status === 'active') || [];
  const standaloneMedications = activeMedications?.filter(m => !m.treatmentPlanId) || [];

  const hasActiveTreatments = activeFilteredTreatments.length > 0;
  const hasStandaloneMedications = standaloneMedications.length > 0;
  const hasAnyActive = hasActiveTreatments || hasStandaloneMedications;

  return (
    <Card className="h-full flex flex-col gap-1">
      <CardHeader className="pb-3 flex-shrink-0">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Current Treatment</CardTitle>
          <Link href="/patient/treatments">
            <Button variant="outline" size="sm" className="h-7 px-3 text-xs">
              <Activity className="h-3 w-3 mr-1" />
              View All
            </Button>
          </Link>
        </div>
      </CardHeader>

      <CardContent className="flex-1 min-h-0 p-0">
        <ScrollArea className="h-full">
          {!hasAnyActive ? (
            <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                <Activity className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="font-medium text-sm mb-2">No Active Treatments</h3>
              <p className="text-xs text-muted-foreground mb-4 max-w-[200px]">
                You don't have any active treatments at the moment.
              </p>
              <Link href="/patient/appointments/book">
                <Button size="sm" className="h-8 px-3 text-xs">
                  <Plus className="h-3 w-3 mr-1" />
                  Book Appointment
                </Button>
              </Link>
            </div>
          ) : (
            <div className="p-4 space-y-3">
              {hasActiveTreatments && activeFilteredTreatments.map((treatment) => {
                const treatmentMedications = medicationsByTreatment.get(treatment._id) || [];
                
                return (
                  <div
                    key={treatment._id}
                    className="p-4 rounded-lg border border-border/50 hover:border-border transition-colors"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                            <Activity className="h-4 w-4 text-green-600 dark:text-green-400" />
                          </div>
                          <div>
                            <h3 className="font-medium text-sm">{treatment.title}</h3>
                            <p className="text-xs text-muted-foreground">
                              Dr. {treatment.doctor?.firstName} {treatment.doctor?.lastName}
                            </p>
                          </div>
                        </div>
                      </div>
                      <Badge variant="secondary" className="text-xs h-5">
                        Active
                      </Badge>
                    </div>

                    <div className="space-y-2 mb-3">
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          <span>Started {formatDate(treatment.startDate)}</span>
                        </div>
                        {treatment.endDate && (
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            <span>Until {formatDate(treatment.endDate)}</span>
                          </div>
                        )}
                      </div>
                      {treatment.plan && (
                        <p className="text-xs text-muted-foreground bg-muted/50 p-2 rounded">
                          {treatment.plan}
                        </p>
                      )}
                    </div>

                    {treatmentMedications.length > 0 && (
                      <div className="border-t border-border/50 pt-3">
                        <div className="flex items-center gap-2 mb-2">
                          <Pill className="h-3 w-3 text-primary" />
                          <span className="text-xs font-medium">Medications ({treatmentMedications.length})</span>
                        </div>
                        <div className="grid grid-cols-1 gap-2">
                          {treatmentMedications.slice(0, 3).map((medication: any, medIndex: number) => (
                            <div
                              key={medication._id}
                              className="flex items-center justify-between p-2 bg-muted/30 rounded text-xs"
                            >
                              <div className="flex items-center gap-2">
                                <div className="w-5 h-5 bg-primary/10 rounded-full flex items-center justify-center">
                                  <span className="text-xs font-medium text-primary">
                                    {medIndex + 1}
                                  </span>
                                </div>
                                <div>
                                  <div className="font-medium">{medication.medicationName}</div>
                                  <div className="text-muted-foreground">
                                    {medication.dosage} • {medication.frequency}
                                  </div>
                                </div>
                              </div>
                              <Badge variant="outline" className="text-xs h-4">
                                Active
                              </Badge>
                            </div>
                          ))}
                          {treatmentMedications.length > 3 && (
                            <div className="text-xs text-muted-foreground text-center py-1">
                              +{treatmentMedications.length - 3} more medications
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}

              {!hasActiveTreatments && hasStandaloneMedications && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 mb-3">
                    <Pill className="h-4 w-4 text-primary" />
                    <h3 className="font-medium text-sm">Current Medications</h3>
                  </div>
                  {standaloneMedications.map((medication) => (
                    <div
                      key={medication._id}
                      className="p-3 rounded-lg border border-border/50 hover:border-border transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                            <Pill className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                          </div>
                          <div>
                            <div className="font-medium text-sm">{medication.medicationName}</div>
                            <div className="text-xs text-muted-foreground">
                              {medication.dosage} • {medication.frequency}
                            </div>
                          </div>
                        </div>
                        <Badge variant="secondary" className="text-xs h-5">
                          Active
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
