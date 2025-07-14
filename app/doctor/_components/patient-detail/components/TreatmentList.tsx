import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
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

  // Skeleton loading state
  if (isLoading) {
    return (
      <Card className={cn("h-full flex flex-col bg-background border-border", className)}>
        <CardHeader className="p-0 flex-shrink-0">
          <div className="relative overflow-hidden rounded-t-lg bg-gradient-to-r from-muted/50 via-muted/30 to-transparent">
            <div className="relative px-4 py-3 flex items-center gap-3">
              <Skeleton className="h-8 w-8 rounded-lg" />
              <div className="flex-1">
                <Skeleton className="h-5 w-32 mb-1" />
                <Skeleton className="h-3 w-24" />
              </div>
              <Skeleton className="h-6 w-8 rounded-full" />
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex-1 min-h-0 p-3">
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="p-3 border border-border rounded-lg bg-background">
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <Skeleton className="h-4 w-32 flex-1" />
                    <Skeleton className="h-5 w-16" />
                  </div>
                  <Skeleton className="h-3 w-full" />
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-3 w-8" />
                      <Skeleton className="h-3 w-8" />
                    </div>
                    <Skeleton className="h-3 w-16" />
                  </div>
                  <Skeleton className="h-6 w-full" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("h-full flex flex-col bg-background border-border", className)}>
      <CardHeader className="p-0 flex-shrink-0">
        <div className="relative overflow-hidden rounded-t-lg">
          <div className="relative px-4 flex items-center gap-3">
            <div className="relative">
              <div className="absolute inset-0 bg-primary/20 rounded-lg blur-sm"></div>
              <div className="relative p-2 bg-primary/10 rounded-lg border border-primary/20">
                <Activity className="h-4 w-4 text-primary" />
              </div>
            </div>
            <div className="flex-1">
              <CardTitle className="text-base font-semibold text-foreground tracking-tight">
                Treatment Plans
              </CardTitle>
              <p className="text-xs text-muted-foreground mt-0.5">
                Active treatment protocols
              </p>
            </div>
          </div>
        </div>
      </CardHeader>
        <CardContent className="flex-1 min-h-0 p-0">
          <ScrollArea className="h-full">
            <div className="p-3">
              {(treatments?.length || 0) === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="relative mb-6">
                    <div className="w-16 h-16 bg-gradient-to-br from-primary/20 to-primary/10 rounded-2xl flex items-center justify-center">
                      <Activity className="h-8 w-8 text-primary" />
                    </div>
                    <div className="absolute -top-1 -right-1 w-6 h-6 bg-secondary rounded-full flex items-center justify-center">
                      <Plus className="h-3 w-3 text-secondary-foreground" />
                    </div>
                  </div>
                  <h3 className="font-semibold text-lg mb-2 text-foreground">Start Treatment Planning</h3>
                  <p className="text-sm text-muted-foreground mb-6 max-w-xs">
                    Create comprehensive treatment plans to track patient progress and medical interventions
                  </p>
                  <Button
                    onClick={onAddTreatment}
                    className="h-10 px-6 font-medium shadow-sm hover:shadow-md transition-shadow"
                    disabled={isLoading}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Create First Plan
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  {(treatments || []).map((treatment) => {
                    const treatmentMedicationCount = (activeMedications || []).filter(
                      med => med.treatmentPlan?._id === treatment._id
                    ).length;

                    return (
                      <div
                        key={treatment._id}
                        className={cn(
                          "group p-3 border rounded-lg cursor-pointer transition-all duration-200 hover:bg-muted/30 hover:shadow-sm",
                          selectedTreatmentId === treatment._id
                            ? 'border-primary bg-primary/5 shadow-sm'
                            : 'border-border hover:border-primary/30',
                          isLoading && "opacity-50 pointer-events-none"
                        )}
                        onClick={() => onTreatmentSelect(treatment._id)}
                      >
                        <div className="space-y-2">
                          <div className="flex items-center justify-between gap-2">
                            <h4 className="font-medium text-sm truncate flex-1 text-foreground group-hover:text-primary transition-colors">
                              {treatment.title}
                            </h4>
                            <Badge
                              variant={treatment.status === 'active' ? 'default' : 'secondary'}
                              className="text-xs h-5 px-2 flex-shrink-0"
                            >
                              {treatment.status}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground truncate">
                            {treatment.diagnosis}
                          </p>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Pill className="h-3 w-3" />
                                {treatmentMedicationCount}
                              </span>
                              <span>•</span>
                              <span className="flex items-center gap-1">
                                <Target className="h-3 w-3" />
                                {treatment.goals?.length || 0}
                              </span>
                            </div>
                            <span className="text-xs text-muted-foreground">
                              {formatCompactDate(treatment.startDate)}
                            </span>
                          </div>
                          {treatment.status === 'active' && (
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
                              Complete
                            </Button>
                          )}
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
  );
});

TreatmentList.displayName = "TreatmentList";
