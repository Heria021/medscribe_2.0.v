import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Activity } from "lucide-react";
import { TreatmentCard } from "./TreatmentCard";
import type { TreatmentListProps } from "../types";

/**
 * Treatment List Component
 * Displays a list of treatments in a sidebar format
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

  const defaultEmptyState = (
    <div className="flex flex-col items-center justify-center py-6 text-center">
      <Activity className="h-6 w-6 text-muted-foreground mb-2" />
      <h3 className="font-medium text-sm mb-1">No treatments found</h3>
      <p className="text-muted-foreground text-xs">
        No treatment plans yet
      </p>
    </div>
  );

  return (
    <Card className={`flex-1 min-h-0 flex flex-col ${className}`}>
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
            {displayTreatments.length === 0 ? (
              emptyState || defaultEmptyState
            ) : (
              <div className="space-y-2">
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
      </CardContent>
    </Card>
  );
});

TreatmentList.displayName = "TreatmentList";
