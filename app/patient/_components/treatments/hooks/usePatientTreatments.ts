import { useMemo } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { UsePatientTreatmentsReturn, TreatmentStats, Id } from "../types";

/**
 * Custom hook for managing patient treatments and medications
 * Handles data fetching, filtering, and statistics calculation
 */
export function usePatientTreatments(patientId?: Id<"patients">): UsePatientTreatmentsReturn {
  // Fetch treatment plans with details
  const treatmentPlans = useQuery(
    api.treatmentPlans.getWithDetailsByPatientId,
    patientId ? { patientId } : "skip"
  );

  // Fetch medications with details
  const medications = useQuery(
    api.medications.getWithDetailsByPatientId,
    patientId ? { patientId } : "skip"
  );

  // Memoized loading state
  const isLoading = useMemo(() => {
    return treatmentPlans === undefined || medications === undefined;
  }, [treatmentPlans, medications]);

  // Create treatment plans with their associated medications
  const treatmentsWithMedications = useMemo(() => {
    if (!treatmentPlans || !medications) return [];
    
    return treatmentPlans.map(treatment => {
      const relatedMedications = medications.filter(med =>
        med.treatmentPlan?._id === treatment._id
      );
      return {
        ...treatment,
        medications: relatedMedications
      };
    });
  }, [treatmentPlans, medications]);

  // Get standalone medications (not associated with any treatment)
  const standaloneMedications = useMemo(() => {
    if (!medications) return [];
    return medications.filter(med => !med.treatmentPlan);
  }, [medications]);

  // Calculate statistics
  const stats = useMemo((): TreatmentStats => {
    const totalTreatments = treatmentPlans?.length || 0;
    const activeTreatments = treatmentPlans?.filter(t => t.status === "active").length || 0;
    const completedTreatments = treatmentPlans?.filter(t => t.status === "completed").length || 0;
    const discontinuedTreatments = treatmentPlans?.filter(t => t.status === "discontinued").length || 0;
    
    const totalMedications = medications?.length || 0;
    const activeMedications = medications?.filter(m => m.status === "active").length || 0;

    return {
      total: totalTreatments,
      active: activeTreatments,
      completed: completedTreatments,
      discontinued: discontinuedTreatments,
      activeMedications,
      totalMedications,
    };
  }, [treatmentPlans, medications]);

  // Refetch function (placeholder for now)
  const refetch = useMemo(() => () => {
    // In a real implementation, this would trigger a refetch of the queries
    console.log("Refetching treatments and medications...");
  }, []);

  return {
    treatmentPlans,
    medications,
    treatmentsWithMedications,
    standaloneMedications,
    isLoading,
    error: null, // Convex queries don't expose errors in the same way
    refetch,
    stats,
  };
}
