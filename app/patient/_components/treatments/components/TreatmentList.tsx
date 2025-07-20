import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Activity, Heart, Calendar } from "lucide-react";
import { TreatmentCard } from "./TreatmentCard";
import type { TreatmentListProps } from "../types";
import { cn } from "@/lib/utils";

/**
 * Treatment List Component
 * Clean, header-less list of treatments with enhanced visual design
 */
export const TreatmentList = React.memo<TreatmentListProps>(({
  treatments,
  selectedTreatment,
  onSelectTreatment,
  variant = "list",
  emptyState,
  className = "",
  maxItems,
}) => {
  const displayTreatments = maxItems ? treatments.slice(0, maxItems) : treatments;

  // Enhanced empty state
  const defaultEmptyState = (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="p-4 bg-muted/30 rounded-full mb-4">
        <Heart className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="font-semibold text-lg mb-2">No Treatment Plans</h3>
      <p className="text-muted-foreground text-sm max-w-sm">
        Your treatment plans will appear here once your doctor creates them for you.
      </p>
    </div>
  );

  // Get active treatments count
  const activeTreatments = treatments.filter(t => t.status === 'active').length;
  const completedTreatments = treatments.filter(t => t.status === 'completed').length;

  return (
    <div className={cn("h-full flex flex-col", className)}>
      {/* Enhanced Header Section */}
      <div className="p-6 border-b border-border">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold text-foreground">My Treatments</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Track your ongoing and completed treatment plans
            </p>
          </div>
          {treatments.length > 0 && (
            <Badge variant="secondary" className="text-sm px-3 py-1">
              {treatments.length} Total
            </Badge>
          )}
        </div>

        {/* Treatment Stats */}
        {treatments.length > 0 && (
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-primary/5 rounded-lg border border-primary/10">
              <div className="flex items-center gap-2">
                <div className="p-1 bg-primary/10 rounded">
                  <Activity className="h-3 w-3 text-primary" />
                </div>
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Active</span>
              </div>
              <p className="text-lg font-bold text-foreground mt-1">{activeTreatments}</p>
            </div>
            <div className="p-3 bg-muted/30 rounded-lg border border-border">
              <div className="flex items-center gap-2">
                <div className="p-1 bg-muted rounded">
                  <Calendar className="h-3 w-3 text-muted-foreground" />
                </div>
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Completed</span>
              </div>
              <p className="text-lg font-bold text-foreground mt-1">{completedTreatments}</p>
            </div>
          </div>
        )}
      </div>

      {/* Treatment List */}
      <div className="flex-1 min-h-0">
        <ScrollArea className="h-full">
          <div className="p-6">
            {displayTreatments.length === 0 ? (
              emptyState || defaultEmptyState
            ) : (
              <div className="space-y-3">
                {displayTreatments.map((treatment) => (
                  <TreatmentCard
                    key={treatment._id}
                    treatment={treatment}
                    isSelected={selectedTreatment?._id === treatment._id}
                    onClick={() => onSelectTreatment?.(treatment)}
                  />
                ))}
              </div>
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
});

TreatmentList.displayName = "TreatmentList";
