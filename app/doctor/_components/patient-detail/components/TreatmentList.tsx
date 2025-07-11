import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Activity,
  Plus,
  Pill,
  Target,
  CheckCircle,
} from "lucide-react";
import { usePatientDetailFormatters } from "../hooks";
import type { TreatmentListProps } from "../types";
import { cn } from "@/lib/utils";

/**
 * TreatmentList Component
 * 
 * Displays a list of treatment plans with selection and actions
 * Optimized for performance with React.memo
 */
export const TreatmentList = React.memo<TreatmentListProps>(({
  treatments,
  selectedTreatmentId,
  onTreatmentSelect,
  onTreatmentComplete,
  onAddTreatment,
  activeMedications,
  isLoading = false,
  className = "",
}) => {
  const { formatCompactDate } = usePatientDetailFormatters();

  return (
    <div className={cn("flex flex-col min-h-0", className)}>
      <Card className="flex-1 min-h-0 flex flex-col">
        <CardHeader className="pb-2 flex-shrink-0">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-semibold">Treatments</CardTitle>
            {treatments.length > 0 && (
              <Badge variant="outline" className="text-xs h-5">
                {treatments.length}
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="flex-1 min-h-0 p-0">
          <ScrollArea className="h-full scrollbar-hide">
            <div className="p-3">
              {treatments.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-6 text-center">
                  <Activity className="h-6 w-6 text-muted-foreground mb-2" />
                  <h3 className="font-medium text-sm mb-1">No Active Treatments</h3>
                  <p className="text-xs text-muted-foreground mb-3">
                    Start by adding a treatment plan
                  </p>
                  <Button 
                    size="sm" 
                    onClick={onAddTreatment} 
                    className="h-7 px-3 text-xs"
                    disabled={isLoading}
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    Add Treatment
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  {treatments.map((treatment) => {
                    const treatmentMedicationCount = activeMedications.filter(
                      med => med.treatmentPlan?._id === treatment._id
                    ).length;

                    return (
                      <div
                        key={treatment._id}
                        className={cn(
                          "p-3 border rounded-lg cursor-pointer transition-all duration-200 hover:bg-muted/50",
                          selectedTreatmentId === treatment._id
                            ? 'border-primary bg-primary/5'
                            : 'border-border hover:border-primary/50',
                          isLoading && "opacity-50 pointer-events-none"
                        )}
                        onClick={() => onTreatmentSelect(treatment._id)}
                      >
                        <div className="space-y-2">
                          <div className="flex items-start justify-between gap-2">
                            <h4 className="font-medium text-sm truncate flex-1">
                              {treatment.title}
                            </h4>
                            <Badge variant="outline" className="text-xs h-5 px-2">
                              {treatment.status}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground truncate">
                            {treatment.diagnosis}
                          </p>
                          <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <div className="flex items-center gap-3">
                              <span className="flex items-center gap-1">
                                <Pill className="h-3 w-3" />
                                {treatmentMedicationCount}
                              </span>
                              <span className="flex items-center gap-1">
                                <Target className="h-3 w-3" />
                                {treatment.goals?.length || 0}
                              </span>
                            </div>
                            <span className="text-xs">
                              {formatCompactDate(treatment.startDate)}
                            </span>
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-6 w-full text-xs"
                            onClick={(e) => {
                              e.stopPropagation();
                              onTreatmentComplete(treatment._id);
                            }}
                            disabled={isLoading}
                          >
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Mark Complete
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
});

TreatmentList.displayName = "TreatmentList";
