"use client";

import React, { useState, useMemo } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Activity,
  Search,
  MoreHorizontal,
  Calendar,
  CheckCircle,
  AlertTriangle,
  Pill,
  Target,
  FileText,
  Edit,
  Clock,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { Id } from "@/convex/_generated/dataModel";

interface TreatmentListProps {
  patientId: string;
  selectedTreatmentId?: string | null;
  onSelectTreatment?: (treatmentId: string | null) => void;
  onViewTreatment?: (treatmentId: string) => void;
  onAddTreatment?: () => void;
  onEditTreatment?: (treatmentId: string) => void;
  onStatusChange?: (treatmentId: string, status: string) => void;
  className?: string;
}

// Treatment Card Component - Redesigned for modern UI
const TreatmentCard = React.memo<{
  treatment: any;
  isSelected?: boolean;
  onSelect?: () => void;
  onView?: () => void;
  onEdit?: () => void;
  onStatusChange?: (status: string) => void;
}>(({ treatment, isSelected, onSelect, onView, onEdit, onStatusChange }) => {
  const getStatusConfig = (status: string) => {
    switch (status) {
      case "active":
        return {
          icon: <CheckCircle className="h-3 w-3" />,
          className: "bg-primary/10 text-primary border-primary/20",
          label: "Active"
        };
      case "completed":
        return {
          icon: <CheckCircle className="h-3 w-3" />,
          className: "bg-primary/10 text-primary border-primary/20",
          label: "Completed"
        };
      case "discontinued":
        return {
          icon: <AlertTriangle className="h-3 w-3" />,
          className: "bg-destructive/10 text-destructive border-destructive/20",
          label: "Discontinued"
        };
      default:
        return {
          icon: <Clock className="h-3 w-3" />,
          className: "bg-muted text-muted-foreground border-border",
          label: "Unknown"
        };
    }
  };

  const statusConfig = getStatusConfig(treatment.status);

  return (
    <div
      className={cn(
        "group relative p-3 border rounded-lg cursor-pointer transition-all duration-200",
        "hover:bg-muted/50 hover:border-primary/50",
        isSelected
          ? "border-primary bg-primary/5 shadow-sm"
          : "border-border"
      )}
      onClick={onSelect}
    >
      <div className="space-y-2">
        {/* Header */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h4 className="font-medium text-sm truncate">{treatment.title}</h4>
            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
              {treatment.diagnosis}
            </p>
          </div>
          <Badge variant="outline" className={cn("text-xs h-5 px-2 flex items-center gap-1", statusConfig.className)}>
            {statusConfig.icon}
            <span className="hidden sm:inline">{statusConfig.label}</span>
          </Badge>
        </div>

        {/* Metrics */}
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <Pill className="h-3 w-3" />
              {treatment.medicationDetails?.length || 0} meds
            </span>
            <span className="flex items-center gap-1">
              <Target className="h-3 w-3" />
              {treatment.goals?.length || 0} goals
            </span>
          </div>
          <div className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            <span>{new Date(treatment.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
          </div>
        </div>

        {/* Actions - Show on selection */}
        {isSelected && (
          <div className="flex items-center justify-between pt-2 border-t border-border">
            <div className="flex gap-2">
              {onView && (
                <Button
                  size="sm"
                  variant="outline"
                  className="h-7 text-xs"
                  onClick={(e) => {
                    e.stopPropagation();
                    onView();
                  }}
                >
                  <FileText className="h-3 w-3 mr-1" />
                  View
                </Button>
              )}
              {onEdit && (
                <Button
                  size="sm"
                  variant="outline"
                  className="h-7 text-xs"
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit();
                  }}
                >
                  <Edit className="h-3 w-3 mr-1" />
                  Edit
                </Button>
              )}
            </div>

            {/* Status Actions */}
            {onStatusChange && treatment.status === "active" && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation();
                      onStatusChange("completed");
                    }}
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Mark as Completed
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation();
                      onStatusChange("discontinued");
                    }}
                  >
                    <AlertTriangle className="h-4 w-4 mr-2" />
                    Discontinue Treatment
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        )}
      </div>
    </div>
  );
});

TreatmentCard.displayName = "TreatmentCard";

/**
 * TreatmentList Component
 *
 * Simplified treatment list with search functionality only.
 */
export const TreatmentList = React.memo<TreatmentListProps>(({
  patientId,
  selectedTreatmentId,
  onSelectTreatment,
  onViewTreatment,
  onAddTreatment,
  onEditTreatment,
  onStatusChange,
  className,
}) => {
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch treatments for the patient
  const treatments = useQuery(
    api.treatmentPlans.getWithDetailsByPatientId,
    patientId ? { patientId: patientId as Id<"patients"> } : "skip"
  );

  // Filter and sort treatments
  const filteredTreatments = useMemo(() => {
    if (!treatments) return [];

    let filtered = treatments;

    // Apply search filter
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (treatment) =>
          treatment.title.toLowerCase().includes(term) ||
          treatment.diagnosis.toLowerCase().includes(term) ||
          treatment.plan.toLowerCase().includes(term)
      );
    }

    // Sort by newest first
    filtered.sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());

    return filtered;
  }, [treatments, searchTerm]);

  // Loading skeleton
  if (treatments === undefined) {
    return (
      <Card className={cn("h-full flex flex-col", className)}>
        <CardContent className="flex-1 min-h-0 space-y-4 p-3">
          {/* Search skeleton */}
          <Skeleton className="h-9 w-full rounded-md" />

          {/* Treatment cards skeleton */}
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="p-4 border border-border rounded-lg space-y-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                  <Skeleton className="h-6 w-16 rounded-full" />
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex gap-4">
                    <Skeleton className="h-3 w-12" />
                    <Skeleton className="h-3 w-12" />
                  </div>
                  <Skeleton className="h-3 w-16" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("h-full flex flex-col", className)}>
      {/* Search */}
      <CardContent className="px-3 pb-2 pt-3 flex-shrink-0">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search treatments..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </CardContent>

      <CardContent className="flex-1 min-h-0 p-0">
        <ScrollArea className="h-full scrollbar-hide">
          <div className="px-3 pb-2">
            {filteredTreatments.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-4 text-center">
                <Activity className="h-6 w-6 text-muted-foreground mb-2" />
                <h3 className="font-medium text-sm mb-1">
                  {searchTerm ? "No matching treatments" : "No treatments found"}
                </h3>
                <p className="text-muted-foreground text-xs">
                  {searchTerm
                    ? "Try adjusting your search"
                    : "No treatment plans yet"
                  }
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {filteredTreatments.map((treatment) => {
                  const isSelected = selectedTreatmentId === treatment._id;
                  return (
                    <TreatmentCard
                      key={treatment._id}
                      treatment={treatment}
                      isSelected={isSelected}
                      onSelect={() => onSelectTreatment?.(isSelected ? null : treatment._id)}
                      onView={() => onViewTreatment?.(treatment._id)}
                      onEdit={() => onEditTreatment?.(treatment._id)}
                      onStatusChange={(status) => onStatusChange?.(treatment._id, status)}
                    />
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