import React from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Users, UserPlus } from "lucide-react";
import { PatientCard } from "./PatientCard";
import { usePatientActions } from "../hooks";
import type { PatientsListProps } from "../types";
import { cn } from "@/lib/utils";

/**
 * PatientsList Component
 * 
 * Displays a list of patients with empty state handling
 * Integrates with patient actions automatically
 */
export const PatientsList = React.memo<PatientsListProps>(({
  patients,
  isLoading = false,
  emptyMessage = "No patients found",
  onPatientAction,
  className = "",
}) => {
  const {
    removePatient,
    loadingStates,
  } = usePatientActions();

  // Handle patient actions
  const handleView = (patientId: string) => {
    onPatientAction?.("view", patientId as any);
  };

  const handleRemove = async (doctorPatientId: string) => {
    try {
      await removePatient(doctorPatientId as any);
      onPatientAction?.("remove", doctorPatientId as any);
    } catch (error) {
      console.error("Failed to remove patient:", error);
    }
  };

  if (isLoading) {
    return (
      <div className={cn("h-full border rounded-xl flex flex-col", className)}>
        <div className="divide-y">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  {/* Avatar Skeleton */}
                  <div className="h-10 w-10 bg-muted rounded-full animate-pulse" />

                  {/* Patient Info Skeleton */}
                  <div className="space-y-2">
                    {/* Name and Badge */}
                    <div className="flex items-center gap-2">
                      <div className="h-4 w-32 bg-muted rounded animate-pulse" />
                      <div className="h-5 w-16 bg-muted rounded animate-pulse" />
                    </div>

                    {/* Details Row */}
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1">
                        <div className="h-3 w-3 bg-muted rounded animate-pulse" />
                        <div className="h-3 w-12 bg-muted rounded animate-pulse" />
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="h-3 w-3 bg-muted rounded animate-pulse" />
                        <div className="h-3 w-24 bg-muted rounded animate-pulse" />
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="h-3 w-3 bg-muted rounded animate-pulse" />
                        <div className="h-3 w-32 bg-muted rounded animate-pulse" />
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="h-3 w-3 bg-muted rounded animate-pulse" />
                        <div className="h-3 w-16 bg-muted rounded animate-pulse" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Button Skeleton */}
                <div className="flex gap-2">
                  <div className="h-7 w-8 bg-muted rounded animate-pulse" />
                  <div className="h-7 w-16 bg-muted rounded animate-pulse" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (patients.length === 0) {
    return (
      <div className={cn("h-full border rounded-xl flex items-center justify-center p-8", className)}>
        <div className="text-center">
          <Users className="h-10 w-10 text-muted-foreground mb-3 mx-auto" />
          <h3 className="font-semibold mb-1">No Patients Found</h3>
          <p className="text-muted-foreground text-sm mb-3">
            {emptyMessage}
          </p>
          <Button className="rounded-lg" size="sm">
            <UserPlus className="h-4 w-4 mr-2" />
            Add Patient
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("h-full border rounded-xl flex flex-col", className)}>
      <ScrollArea className="flex-1">
        <div className="divide-y">
          {patients.map((relationship) => {
            const relationshipId = relationship._id;
            const isActionLoading = Object.keys(loadingStates).some(key => 
              key.includes(relationshipId) && loadingStates[key]
            );

            return (
              <PatientCard
                key={relationshipId}
                relationship={relationship}
                onView={handleView}
                onRemove={handleRemove}
                isLoading={isActionLoading}
              />
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
});

PatientsList.displayName = "PatientsList";
