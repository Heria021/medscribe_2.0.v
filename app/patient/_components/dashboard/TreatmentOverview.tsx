"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Activity,
  Pill,
  Calendar,
  Clock,
  Plus,
  Loader2,
  ChevronDown,
  Info
} from "lucide-react";
import { api } from "@/convex/_generated/api";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface TreatmentOverviewProps {
  patientId: string;
  gradient?: {
    from: string;
    to: string;
    border: string;
    iconBg: string;
    textColor: string;
    itemBg: string;
    itemBorder: string;
  };
}

export function TreatmentOverview({ patientId, gradient }: TreatmentOverviewProps) {
  const [expandedTreatments, setExpandedTreatments] = useState<Set<string>>(new Set());

  const toggleTreatmentExpansion = (treatmentId: string) => {
    setExpandedTreatments(prev => {
      const newSet = new Set(prev);
      if (newSet.has(treatmentId)) {
        newSet.delete(treatmentId);
      } else {
        newSet.add(treatmentId);
      }
      return newSet;
    });
  };

  const activeTreatments = useQuery(
    api.treatmentPlans.getWithDetailsByPatientId,
    { patientId: patientId as any }
  );

  const activeMedications = useQuery(
    api.medications.getActiveByPatientId,
    { patientId: patientId as any }
  );

  // Group medications by treatment plan
  const medicationsByTreatment = new Map();
  const standaloneMedications: any[] = [];

  if (activeMedications) {
    activeMedications.forEach((med: any) => {
      if (med.treatmentPlanId) {
        if (!medicationsByTreatment.has(med.treatmentPlanId)) {
          medicationsByTreatment.set(med.treatmentPlanId, []);
        }
        medicationsByTreatment.get(med.treatmentPlanId).push(med);
      } else {
        standaloneMedications.push(med);
      }
    });
  }

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

  const hasActiveTreatments = activeTreatments && activeTreatments.length > 0;
  const hasStandaloneMedications = standaloneMedications.length > 0;
  const hasAnyActive = hasActiveTreatments || hasStandaloneMedications;

  // Filter treatments that have medications or are active
  const activeFilteredTreatments = activeTreatments?.filter((treatment: any) => 
    treatment.status === 'active' || medicationsByTreatment.has(treatment._id)
  ) || [];

  return (
    <Card className={cn(
      "h-full flex flex-col gap-0",
      gradient && `bg-gradient-to-br ${gradient.from} ${gradient.to}`,
      gradient && `border-${gradient.border}`
    )}>
      <CardHeader className="flex-shrink-0">
        <div className="flex items-center justify-between">
          <CardTitle className={cn(
            "text-base flex items-center gap-2",
            gradient?.textColor
          )}>
            <div className={cn(
              "w-4 h-4 rounded flex items-center justify-center",
              gradient?.iconBg
            )}>
              <Activity className="h-3 w-3 text-white" />
            </div>
            Active Treatments
          </CardTitle>
          <Link href="/patient/treatments">
            <Button
              variant="outline"
              size="sm"
              className={cn(
                "h-7 px-3 text-xs",
                gradient && `border-${gradient.border.replace('border-', '')} ${gradient.textColor}`,
                gradient && `hover:bg-black/5 dark:hover:bg-white/5`
              )}
            >
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
              <div className={cn(
                "w-16 h-16 rounded-full flex items-center justify-center mb-4",
                gradient ? gradient.iconBg.replace('bg-', 'bg-').replace('500', '100') + ' dark:' + gradient.iconBg.replace('bg-', 'bg-').replace('500', '900/30') : "bg-muted"
              )}>
                <Activity className={cn(
                  "h-8 w-8",
                  gradient ? gradient.iconBg.replace('bg-', 'text-').replace('500', '600') + ' dark:' + gradient.iconBg.replace('bg-', 'text-').replace('500', '400') : "text-muted-foreground"
                )} />
              </div>
              <h3 className={cn(
                "font-medium text-sm mb-2",
                gradient?.textColor
              )}>
                No Active Treatments
              </h3>
              <p className={cn(
                "text-xs mb-4 max-w-[200px]",
                gradient?.textColor || "text-muted-foreground"
              )}>
                You don't have any active treatments at the moment.
              </p>
              <Link href="/patient/appointments/book">
                <Button
                  size="sm"
                  className={cn(
                    "h-8 px-3 text-xs text-white",
                    gradient ? gradient.iconBg.replace('bg-', 'bg-').replace('500', '600') + ' hover:' + gradient.iconBg.replace('bg-', 'bg-').replace('500', '700') : ""
                  )}
                >
                  <Plus className="h-3 w-3 mr-1" />
                  Book Appointment
                </Button>
              </Link>
            </div>
          ) : (
            <div className="p-4 space-y-3">
              {hasActiveTreatments && activeFilteredTreatments.map((treatment) => {
                const treatmentMedications = medicationsByTreatment.get(treatment._id) || [];
                const isExpanded = expandedTreatments.has(treatment._id);

                return (
                  <div
                    key={treatment._id}
                    className={cn(
                      "p-3 rounded-lg border",
                      gradient ? `${gradient.itemBg} ${gradient.itemBorder}` : "border-border/50"
                    )}
                  >
                    <div className="space-y-2">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <h4 className={cn(
                            "font-medium text-sm truncate",
                            gradient?.textColor
                          )}>
                            {treatment.title}
                          </h4>
                          <p className={cn(
                            "text-xs mt-1 line-clamp-2",
                            gradient?.textColor || "text-muted-foreground"
                          )}>
                            {treatment.description}
                          </p>
                        </div>
                        <Badge
                          variant="secondary"
                          className={cn(
                            "text-xs ml-2 flex-shrink-0",
                            gradient ? `${gradient.itemBg} ${gradient.itemBorder}` : ""
                          )}
                        >
                          {treatment.status}
                        </Badge>
                      </div>

                      <div className="flex items-center gap-2 text-xs">
                        <div className="flex items-center gap-1">
                          <Calendar className={cn(
                            "h-3 w-3",
                            gradient ? gradient.iconBg.replace('bg-', 'text-').replace('500', '600') + ' dark:' + gradient.iconBg.replace('bg-', 'text-').replace('500', '400') : "text-muted-foreground"
                          )} />
                          <span className={cn(
                            gradient?.textColor || "text-muted-foreground"
                          )}>
                            {new Date(treatment.startDate).toLocaleDateString()}
                          </span>
                        </div>
                        {treatment.endDate && (
                          <>
                            <span className={cn(
                              gradient?.textColor || "text-muted-foreground"
                            )}>-</span>
                            <span className={cn(
                              gradient?.textColor || "text-muted-foreground"
                            )}>
                              {new Date(treatment.endDate).toLocaleDateString()}
                            </span>
                          </>
                        )}
                      </div>

                      {treatmentMedications.length > 0 && (
                        <div className="border-t border-border/50 pt-3 mt-3">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-1">
                              <Pill className={cn(
                                "h-3 w-3",
                                gradient ? gradient.iconBg.replace('bg-', 'text-').replace('500', '600') + ' dark:' + gradient.iconBg.replace('bg-', 'text-').replace('500', '400') : "text-primary"
                              )} />
                              <span className={cn(
                                "text-xs font-medium",
                                gradient?.textColor || "text-muted-foreground"
                              )}>
                                Medications ({treatmentMedications.length})
                              </span>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => toggleTreatmentExpansion(treatment._id)}
                              className={cn(
                                "h-6 px-2 text-xs",
                                gradient?.textColor || "text-muted-foreground",
                                "hover:bg-black/5 dark:hover:bg-white/5"
                              )}
                            >
                              {expandedTreatments.has(treatment._id) ? (
                                <>
                                  <ChevronDown className="h-3 w-3 mr-1 rotate-180 transition-transform" />
                                  Hide
                                </>
                              ) : (
                                <>
                                  <ChevronDown className="h-3 w-3 mr-1 transition-transform" />
                                  Show
                                </>
                              )}
                            </Button>
                          </div>
                          {expandedTreatments.has(treatment._id) && (
                            <div className="space-y-2">
                              {treatmentMedications.map((med: any, index: number) => (
                                <div
                                  key={index}
                                  className={cn(
                                    "p-2 rounded border",
                                    gradient ? `${gradient.itemBg} ${gradient.itemBorder}` : "bg-muted/30 border-border/30"
                                  )}
                                >
                                  <div className="flex items-start justify-between">
                                    <div className="flex-1 min-w-0">
                                      <div className={cn(
                                        "font-medium text-xs truncate",
                                        gradient?.textColor
                                      )}>
                                        {med.medicationName}
                                      </div>
                                      <div className={cn(
                                        "text-xs mt-1 space-y-0.5",
                                        gradient?.textColor || "text-muted-foreground"
                                      )}>
                                        <div>Dosage: {med.dosage}</div>
                                        <div>Frequency: {med.frequency}</div>
                                        {med.instructions && (
                                          <div className="text-xs">Instructions: {med.instructions}</div>
                                        )}
                                      </div>
                                    </div>
                                    <Badge
                                      variant="outline"
                                      className={cn(
                                        "text-xs h-4 ml-2 flex-shrink-0",
                                        gradient && `border-${gradient.border.replace('border-', '').replace('200', '300')} ${gradient.textColor}`
                                      )}
                                    >
                                      Active
                                    </Badge>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}

              {!hasActiveTreatments && hasStandaloneMedications && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Pill className={cn(
                        "h-4 w-4",
                        gradient ? gradient.iconBg.replace('bg-', 'text-').replace('500', '600') + ' dark:' + gradient.iconBg.replace('bg-', 'text-').replace('500', '400') : "text-primary"
                      )} />
                      <h3 className={cn(
                        "font-medium text-sm",
                        gradient?.textColor
                      )}>
                        Current Medications
                      </h3>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className={cn(
                            "h-6 px-2 text-xs",
                            gradient?.textColor || "text-muted-foreground",
                            "hover:bg-black/5 dark:hover:bg-white/5"
                          )}
                        >
                          <Info className="h-3 w-3 mr-1" />
                          View All ({standaloneMedications.length})
                          <ChevronDown className="h-3 w-3 ml-1" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-64">
                        {standaloneMedications.map((medication) => (
                          <DropdownMenuItem key={medication._id} className="flex-col items-start p-3">
                            <div className="font-medium text-sm">{medication.medicationName}</div>
                            <div className="text-xs text-muted-foreground mt-1">
                              <div>Dosage: {medication.dosage}</div>
                              <div>Frequency: {medication.frequency}</div>
                              {medication.instructions && (
                                <div className="mt-1">Instructions: {medication.instructions}</div>
                              )}
                            </div>
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  <div className={cn(
                    "p-3 rounded-lg border text-center",
                    gradient ? `${gradient.itemBg} ${gradient.itemBorder}` : "border-border/50"
                  )}>
                    <p className={cn(
                      "text-xs",
                      gradient?.textColor || "text-muted-foreground"
                    )}>
                      {standaloneMedications.length} active medication{standaloneMedications.length > 1 ? 's' : ''} • Click "View All" for details
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
