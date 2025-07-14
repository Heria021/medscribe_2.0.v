import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Activity,
  Pill,
  Calendar,
  Target,
  FileText,
} from "lucide-react";
import type { TreatmentDetailsProps } from "../types";

/**
 * Treatment Details Component
 * Displays detailed information about a selected treatment
 */
export const TreatmentDetails = React.memo<TreatmentDetailsProps>(({
  treatment,
  standaloneMedications = [],
  className = "",
}) => {
  if (!treatment) {
    return (
      <Card className={`flex-1 min-h-0 flex flex-col ${className}`}>
        <div className="h-full flex items-center justify-center">
          <div className="text-center">
            <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-semibold mb-2">Select a Treatment</h3>
            <p className="text-sm text-muted-foreground">
              Choose a treatment from the list to view detailed information
            </p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className={`flex-1 min-h-0 flex flex-col ${className}`}>
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
                <span>Started {new Date(treatment.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                {treatment.endDate && (
                  <>
                    <span>•</span>
                    <span>Ends {new Date(treatment.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
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
            {/* Medications - Top Priority */}
            {treatment.medications && treatment.medications.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Pill className="h-4 w-4 text-muted-foreground" />
                  <h3 className="font-semibold text-base">Medications ({treatment.medications.length})</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {treatment.medications.map((med: any) => (
                    <div key={med._id} className="p-3 bg-muted/50 rounded-lg border border-border">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-sm text-foreground">{med.medicationName}</h4>
                          <p className="text-xs text-muted-foreground">{med.dosage} • {med.frequency}</p>
                        </div>
                        <Badge variant="outline" className="text-xs ml-2">
                          {med.status}
                        </Badge>
                      </div>
                      {med.instructions && (
                        <p className="text-xs text-muted-foreground mt-2">{med.instructions}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

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

            {/* Doctor Info */}
            {treatment.doctor && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <h3 className="font-semibold text-base">Prescribing Doctor</h3>
                </div>
                <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {treatment.doctor.firstName?.[0]}{treatment.doctor.lastName?.[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm">
                      Dr. {treatment.doctor.firstName} {treatment.doctor.lastName}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {treatment.doctor.primarySpecialty}
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    Contact
                  </Button>
                </div>
              </div>
            )}

            {/* Standalone Medications */}
            {standaloneMedications.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Pill className="h-4 w-4 text-primary" />
                  <h3 className="font-semibold text-base">Independent Medications</h3>
                  <Badge variant="outline">{standaloneMedications.length}</Badge>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {standaloneMedications.map((medication) => (
                    <div key={medication._id} className="p-3 bg-muted/50 rounded-lg border border-border">
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm text-foreground">
                            {medication.medicationName}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {medication.dosage} • {medication.frequency}
                          </div>
                        </div>
                        <Badge variant="outline" className="text-xs ml-2">
                          {medication.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
});

TreatmentDetails.displayName = "TreatmentDetails";
