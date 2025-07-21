"use client";

import React, { useState, useMemo, useCallback } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card } from "@/components/ui/card";
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
  Filter,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { Id } from "@/convex/_generated/dataModel";
import { VirtualizedList, useDebouncedSearch, useOptimizedFilter } from "@/components/ui/virtualized-list";

interface TreatmentListProps {
  patientId: string;
  selectedTreatmentId?: string | null;
  onSelectTreatment?: (treatmentId: string | null) => void;
  onViewTreatment?: (treatmentId: string) => void;
  onAddTreatment?: () => void;
  onStatusChange?: (treatmentId: string, status: string) => void;
  className?: string;
}

// Treatment Card Component - Redesigned for modern UI
const TreatmentCard = React.memo<{
  treatment: any;
  isSelected?: boolean;
  onSelect?: () => void;
  onView?: () => void;
  onStatusChange?: (status: string) => void;
}>(({ treatment, isSelected, onSelect, onView, onStatusChange }) => {
  const getStatusConfig = (status: string) => {
    switch (status) {
      case "active":
        return {
          icon: <CheckCircle className="h-4 w-4" />,
          className: "bg-primary/10 text-primary border-primary/20",
          label: "Active"
        };
      case "completed":
        return {
          icon: <CheckCircle className="h-4 w-4" />,
          className: "bg-primary/10 text-primary border-primary/20",
          label: "Completed"
        };
      case "discontinued":
        return {
          icon: <AlertTriangle className="h-4 w-4" />,
          className: "bg-destructive/10 text-destructive border-destructive/20",
          label: "Discontinued"
        };
      default:
        return {
          icon: <Clock className="h-4 w-4" />,
          className: "bg-muted text-muted-foreground border-border",
          label: "Unknown"
        };
    }
  };

  const statusConfig = getStatusConfig(treatment.status);

  return (
    <div
      className={cn(
        "group relative p-4 border rounded-lg cursor-pointer transition-all duration-200",
        "hover:bg-muted/50 hover:border-primary/50",
        isSelected
          ? "border-primary bg-primary/5 shadow-sm"
          : "border-border"
      )}
      onClick={onSelect}
    >
      <div className="space-y-3">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <h4 className="font-medium text-sm text-foreground group-hover:text-primary transition-colors line-clamp-1">
              {treatment.title}
            </h4>
            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
              {treatment.diagnosis}
            </p>
          </div>
          <Badge variant="outline" className={cn("px-2 flex items-center gap-1", statusConfig.className)}>
            {statusConfig.icon}
            <span className="ml-1">{statusConfig.label}</span>
          </Badge>
        </div>

        {/* Metrics */}
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <Pill className="h-4 w-4" />
              {treatment.medicationDetails?.length || 0} medications
            </span>
          </div>
          <div className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            <span>{new Date(treatment.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
          </div>
        </div>

        {/* Actions - Show on selection */}
        {isSelected && (
          <div className="flex items-center justify-between pt-3 border-t border-border">
            <div className="flex gap-2">
              {onView && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={(e) => {
                    e.stopPropagation();
                    onView();
                  }}
                >
                  <FileText className="h-4 w-4 mr-2" />
                  View
                </Button>
              )}

            </div>

            {/* Status Actions */}
            {onStatusChange && treatment.status === "active" && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
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
 * Enhanced treatment list with search and filter functionality,
 * following the SOAP history pattern.
 */
export const TreatmentList = React.memo<TreatmentListProps>(({
  patientId,
  selectedTreatmentId,
  onSelectTreatment,
  onViewTreatment,
  onStatusChange,
  className,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFilter, setSelectedFilter] = useState<"all" | "active" | "completed">("all");

  // Debounced search for better performance
  const debouncedSearchTerm = useDebouncedSearch(searchTerm, 300);

  // Fetch treatments for the patient
  const treatments = useQuery(
    api.treatmentPlans.getWithDetailsByPatientId,
    patientId ? { patientId: patientId as Id<"patients"> } : "skip"
  );

  // Optimized filter function
  const filterTreatments = useCallback((treatment: any) => {
    // Apply status filter
    if (selectedFilter !== "all" && treatment.status !== selectedFilter) {
      return false;
    }

    // Apply search filter
    if (debouncedSearchTerm.trim()) {
      const search = debouncedSearchTerm.toLowerCase();
      return (
        (treatment.title?.toLowerCase().includes(search)) ||
        (treatment.diagnosis?.toLowerCase().includes(search)) ||
        (treatment.plan?.toLowerCase().includes(search))
      );
    }

    return true;
  }, [selectedFilter, debouncedSearchTerm]);

  // Use optimized filter hook
  const filteredTreatments = useOptimizedFilter(
    treatments || [],
    filterTreatments,
    [selectedFilter, debouncedSearchTerm]
  );

  // Loading state
  if (!treatments) {
    return (
      <Card className={cn("h-full flex flex-col", className)}>
        {/* Loading Skeleton */}
        <div className="p-0 flex-shrink-0">
          <div className="relative overflow-hidden rounded-t-lg bg-gradient-to-r from-muted/50 via-muted/30 to-transparent">
            <div className="relative px-4 py-3 flex items-center gap-3">
              <Skeleton className="w-8 h-8 rounded-lg" />
              <div className="flex-1">
                <Skeleton className="h-5 w-40 mb-1" />
                <Skeleton className="h-3 w-32" />
              </div>
              <Skeleton className="h-6 w-8 rounded-full" />
            </div>
          </div>
        </div>

        <div className="p-4 border-b border-border bg-muted/20 flex-shrink-0">
          <Skeleton className="h-10 w-full rounded-md" />
        </div>

        <div className="flex-1 min-h-0 p-4">
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="p-4 border border-border rounded-lg space-y-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-5 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                  <Skeleton className="h-6 w-20 rounded-full" />
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex gap-4">
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                  <Skeleton className="h-4 w-20" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className={cn("h-full flex flex-col gap-0 py-0", className)}>
      {/* Header */}
      <div className="p-0 flex-shrink-0">
        <div className="relative overflow-hidden rounded-t-lg bg-gradient-to-r from-muted/50 via-muted/30 to-transparent">
          <div className="relative px-4 py-3 flex items-center gap-3">
            <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
              <Activity className="h-4 w-4 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="text-base font-semibold tracking-tight text-foreground">
                Treatment Plans
              </h3>
              <p className="text-xs text-muted-foreground">
                Active and completed treatments
              </p>
            </div>
            <Badge variant="secondary">
              {filteredTreatments.length}
            </Badge>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="px-4 pb-4 border-b border-border bg-muted/20 flex-shrink-0">
        <div className="space-y-4">
          {/* Filter Buttons */}
          <div className="flex gap-2">
            {[
              { key: "all", label: "All", icon: <Activity className="h-4 w-4" /> },
              { key: "active", label: "Active", icon: <CheckCircle className="h-4 w-4" /> },
              { key: "completed", label: "Completed", icon: <Target className="h-4 w-4" /> }
            ].map((filter) => (
              <Button
                key={filter.key}
                size="sm"
                variant={selectedFilter === filter.key ? "default" : "ghost"}
                className="px-3"
                onClick={() => setSelectedFilter(filter.key as any)}
              >
                {filter.icon}
                <span className="ml-2">{filter.label}</span>
              </Button>
            ))}
          </div>
          
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search treatments..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
      </div>

      <div className="flex-1 min-h-0 p-0">
        <ScrollArea className="h-full">
          <div className="p-4">
            {filteredTreatments.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center mb-4">
                  <Activity className="h-8 w-8 text-muted-foreground" />
                </div>
                <h4 className="font-medium text-base mb-2 text-foreground">
                  {searchTerm ? "No matching treatments" : "No treatments found"}
                </h4>
                <p className="text-sm text-muted-foreground">
                  {searchTerm
                    ? "Try adjusting your search terms"
                    : "No treatment plans have been created yet"
                  }
                </p>
              </div>
            ) : (
              filteredTreatments.length > 20 ? (
                // Use virtualization for large lists
                <VirtualizedList
                  items={filteredTreatments}
                  height={400}
                  itemHeight={120}
                  renderItem={({ item: treatment, style }) => {
                    const isSelected = selectedTreatmentId === treatment._id;
                    return (
                      <div style={style} className="px-1 py-2">
                        <TreatmentCard
                          key={treatment._id}
                          treatment={treatment}
                          isSelected={isSelected}
                          onSelect={() => onSelectTreatment?.(isSelected ? null : treatment._id)}
                          onView={() => onViewTreatment?.(treatment._id)}
                          onStatusChange={(status) => onStatusChange?.(treatment._id, status)}
                        />
                      </div>
                    );
                  }}
                />
              ) : (
                // Regular rendering for smaller lists
                <div className="space-y-4">
                  {filteredTreatments.map((treatment) => {
                    const isSelected = selectedTreatmentId === treatment._id;
                    return (
                      <TreatmentCard
                        key={treatment._id}
                        treatment={treatment}
                        isSelected={isSelected}
                        onSelect={() => onSelectTreatment?.(isSelected ? null : treatment._id)}
                        onView={() => onViewTreatment?.(treatment._id)}
                        onStatusChange={(status) => onStatusChange?.(treatment._id, status)}
                      />
                    );
                  })}
                </div>
              )
            )}
          </div>
        </ScrollArea>
      </div>
    </Card>
  );
});

TreatmentList.displayName = "TreatmentList";
