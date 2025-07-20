import * as React from "react";
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
  Eye,
  Clock,
  CheckCircle,
  AlertTriangle,
  Stethoscope,
  Building2,
  Hash,
  Timer,
  RefreshCw,
  Heart,
  User,
  Phone,
} from "lucide-react";
import type { TreatmentDetailsProps } from "../types";
import { cn } from "@/lib/utils";

/**
 * Treatment Details Component
 * Clean, detailed, grid-based treatment details view for patients
 */
export const TreatmentDetails = React.memo<TreatmentDetailsProps>(({
  treatment,
  standaloneMedications = [],
  onViewTreatment,
  className = "",
}) => {
  if (!treatment) {
    return (
      <div className={cn("h-full flex items-center justify-center p-12", className)}>
        <div className="text-center">
          <div className="p-4 bg-muted/30 rounded-full mb-4 mx-auto w-fit">
            <Heart className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="font-semibold text-lg mb-2">Select a Treatment Plan</h3>
          <p className="text-sm text-muted-foreground max-w-sm">
            Choose a treatment from the list to view detailed information about your care plan
          </p>
        </div>
      </div>
    );
  }

  // Helper functions
  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-primary/10 text-primary border-primary/20";
      case "completed":
        return "bg-primary/10 text-primary border-primary/20";
      case "discontinued":
        return "bg-destructive/10 text-destructive border-destructive/20";
      default:
        return "bg-muted text-muted-foreground border-border";
    }
  };

  const formatLongDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className={cn("h-full", className)}>
      <ScrollArea className="h-full">
        <div className="p-6 space-y-6">
          {/* Treatment Header - Patient-Focused */}
          <div className="space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <h1 className="text-2xl font-bold text-foreground mb-2">{treatment.title}</h1>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Started {formatLongDate(treatment.startDate)}
                  </span>
                  {treatment.endDate && (
                    <span className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      Ends {formatLongDate(treatment.endDate)}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Badge
                  variant="outline"
                  className={cn("text-sm px-3 py-1", getStatusColor(treatment.status))}
                >
                  {treatment.status === "active" && <CheckCircle className="h-4 w-4 mr-2" />}
                  {treatment.status === "completed" && <CheckCircle className="h-4 w-4 mr-2" />}
                  {treatment.status === "discontinued" && <AlertTriangle className="h-4 w-4 mr-2" />}
                  <span className="capitalize font-medium">{treatment.status}</span>
                </Badge>

                {onViewTreatment && (
                  <Button variant="outline" size="sm" onClick={() => onViewTreatment(treatment)} className="gap-2">
                    <Eye className="h-4 w-4" />
                    View Full
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Enhanced Information Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Doctor Information */}
            {treatment.doctor && (
              <div className="p-4 bg-muted/30 rounded-lg border border-border">
                <div className="flex items-center gap-2 mb-3">
                  <div className="p-1.5 bg-primary/10 rounded">
                    <Stethoscope className="h-4 w-4 text-primary" />
                  </div>
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Your Doctor</span>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-foreground">
                    Dr. {treatment.doctor.firstName} {treatment.doctor.lastName}
                  </p>
                  {treatment.doctor.primarySpecialty && (
                    <p className="text-xs text-muted-foreground">{treatment.doctor.primarySpecialty}</p>
                  )}
                </div>
              </div>
            )}

            {/* Treatment Goals Count */}
            {treatment.goals && treatment.goals.length > 0 && (
              <div className="p-4 bg-muted/30 rounded-lg border border-border">
                <div className="flex items-center gap-2 mb-3">
                  <div className="p-1.5 bg-primary/10 rounded">
                    <Target className="h-4 w-4 text-primary" />
                  </div>
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Goals</span>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-foreground">{treatment.goals.length} Objectives</p>
                  <p className="text-xs text-muted-foreground">Treatment targets</p>
                </div>
              </div>
            )}

            {/* Medications Count */}
            {treatment.medicationDetails && treatment.medicationDetails.length > 0 && (
              <div className="p-4 bg-muted/30 rounded-lg border border-border">
                <div className="flex items-center gap-2 mb-3">
                  <div className="p-1.5 bg-primary/10 rounded">
                    <Pill className="h-4 w-4 text-primary" />
                  </div>
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Medications</span>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-foreground">{treatment.medicationDetails.length} Prescribed</p>
                  <p className="text-xs text-muted-foreground">Active prescriptions</p>
                </div>
              </div>
            )}
          </div>

          {/* Main Content Sections */}
          <div className="space-y-6">
            {/* Diagnosis & Treatment Plan */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <FileText className="h-5 w-5 text-primary" />
                  </div>
                  <h2 className="text-lg font-semibold text-foreground">Your Diagnosis</h2>
                </div>
                <div className="p-4 bg-muted/30 rounded-lg border border-border">
                  <p className="text-sm text-foreground leading-relaxed">{treatment.diagnosis}</p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Activity className="h-5 w-5 text-primary" />
                  </div>
                  <h2 className="text-lg font-semibold text-foreground">Treatment Plan</h2>
                </div>
                <div className="p-4 bg-muted/30 rounded-lg border border-border">
                  <p className="text-sm text-foreground leading-relaxed">{treatment.plan}</p>
                </div>
              </div>
            </div>

            {/* Treatment Goals */}
            {treatment.goals && treatment.goals.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Target className="h-5 w-5 text-primary" />
                  </div>
                  <h2 className="text-lg font-semibold text-foreground">Your Treatment Goals</h2>
                  <Badge variant="secondary" className="ml-auto">
                    {treatment.goals.length} {treatment.goals.length === 1 ? 'Goal' : 'Goals'}
                  </Badge>
                </div>
                <div className="p-4 bg-muted/30 rounded-lg border border-border">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {treatment.goals.map((goal: string, index: number) => (
                      <div key={index} className="flex items-start gap-3 p-3 bg-background rounded border">
                        <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                          <span className="text-xs font-semibold text-primary">{index + 1}</span>
                        </div>
                        <p className="text-sm text-foreground leading-relaxed">{goal}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Medications - Enhanced Grid Layout */}
            {treatment.medicationDetails && treatment.medicationDetails.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Pill className="h-5 w-5 text-primary" />
                  </div>
                  <h2 className="text-lg font-semibold text-foreground">Your Medications</h2>
                  <Badge variant="secondary" className="ml-auto">
                    {treatment.medicationDetails.length} {treatment.medicationDetails.length === 1 ? 'Medication' : 'Medications'}
                  </Badge>
                </div>
                <div className="space-y-3">
                  {treatment.medicationDetails.map((medication, index: number) => {
                    return (
                      <div key={index} className="p-4 bg-muted/30 rounded-lg border border-border">
                        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                          {/* Medication Name & Generic */}
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                              <Hash className="h-3 w-3" />
                              Medication
                            </div>
                            <p className="font-semibold text-foreground">{medication.name}</p>
                            {medication.genericName && (
                              <p className="text-sm text-muted-foreground">Generic: {medication.genericName}</p>
                            )}
                            <p className="text-xs text-muted-foreground">{medication.dosageForm}</p>
                          </div>

                          {/* Strength & Quantity */}
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                              <Activity className="h-3 w-3" />
                              Dosage
                            </div>
                            <p className="font-semibold text-foreground">{medication.strength}</p>
                            <p className="text-sm text-muted-foreground">Qty: {medication.quantity}</p>
                            {medication.refills > 0 && (
                              <p className="text-xs text-muted-foreground">
                                <RefreshCw className="h-3 w-3 inline mr-1" />
                                {medication.refills} refills
                              </p>
                            )}
                          </div>

                          {/* Frequency & Duration */}
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                              <Timer className="h-3 w-3" />
                              Schedule
                            </div>
                            <p className="font-semibold text-foreground">{medication.frequency}</p>
                            {medication.duration && (
                              <p className="text-sm text-muted-foreground">Duration: {medication.duration}</p>
                            )}
                          </div>

                          {/* Instructions */}
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                              <FileText className="h-3 w-3" />
                              Instructions
                            </div>
                            <p className="text-sm text-foreground leading-relaxed">{medication.instructions}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Doctor Information */}
            {treatment.doctor && (
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <User className="h-5 w-5 text-primary" />
                  </div>
                  <h2 className="text-lg font-semibold text-foreground">Your Doctor</h2>
                </div>
                <div className="p-4 bg-muted/30 rounded-lg border border-border">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-12 w-12">
                      <AvatarFallback className="bg-primary/10 text-primary text-lg">
                        {treatment.doctor.firstName?.[0]}{treatment.doctor.lastName?.[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-foreground">
                        Dr. {treatment.doctor.firstName} {treatment.doctor.lastName}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {treatment.doctor.primarySpecialty}
                      </div>
                    </div>
                    <Button variant="outline" size="sm" className="gap-2">
                      <Phone className="h-4 w-4" />
                      Contact
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Standalone Medications */}
            {standaloneMedications.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Pill className="h-5 w-5 text-primary" />
                  </div>
                  <h2 className="text-lg font-semibold text-foreground">Additional Medications</h2>
                  <Badge variant="secondary" className="ml-auto">
                    {standaloneMedications.length} {standaloneMedications.length === 1 ? 'Medication' : 'Medications'}
                  </Badge>
                </div>
                <div className="space-y-3">
                  {standaloneMedications.map((medication) => {
                    const dosageDisplay = typeof medication.dosage === 'object'
                      ? `${medication.dosage.quantity} • ${medication.dosage.frequency}`
                      : medication.dosage;

                    const frequencyDisplay = typeof medication.dosage === 'object'
                      ? medication.dosage.frequency
                      : medication.frequency;

                    return (
                      <div key={medication._id} className="p-4 bg-muted/30 rounded-lg border border-border">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                              <Hash className="h-3 w-3" />
                              Medication
                            </div>
                            <p className="font-semibold text-foreground">
                              {medication.medicationName || medication.medication?.name}
                            </p>
                            <Badge variant="outline" className={cn("text-xs w-fit",
                              medication.status === 'active' ? 'bg-primary/10 text-primary border-primary/20' :
                              'bg-destructive/10 text-destructive border-destructive/20'
                            )}>
                              {medication.status}
                            </Badge>
                          </div>

                          <div className="space-y-1">
                            <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                              <Activity className="h-3 w-3" />
                              Dosage
                            </div>
                            <p className="font-semibold text-foreground">{dosageDisplay}</p>
                          </div>

                          <div className="space-y-1">
                            <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                              <Timer className="h-3 w-3" />
                              Schedule
                            </div>
                            <p className="font-semibold text-foreground">{frequencyDisplay}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

        </div>
      </ScrollArea>
    </div>
  );
});

TreatmentDetails.displayName = "TreatmentDetails";
