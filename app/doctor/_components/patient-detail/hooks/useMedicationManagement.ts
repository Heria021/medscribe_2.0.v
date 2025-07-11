import { useMemo, useCallback } from "react";
import { useQuery, useMutation } from "convex/react";
import { toast } from "sonner";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import type { UseMedicationManagementReturn, Medication, TreatmentPlan } from "../types";

/**
 * Custom hook for managing medications
 * 
 * Features:
 * - Fetches medications for a patient
 * - Filters medications by treatment plan
 * - Handles medication status updates
 * - Provides active medications list
 * 
 * @param patientId - The patient's ID
 * @param selectedTreatment - Currently selected treatment plan
 * @returns {UseMedicationManagementReturn} Medication management data and utilities
 */
export function useMedicationManagement(
  patientId: Id<"patients"> | null,
  selectedTreatment: TreatmentPlan | null
): UseMedicationManagementReturn {
  const updateMedication = useMutation(api.medications.update);

  // Get medications
  const medications = useQuery(
    api.medications.getWithDetailsByPatientId,
    patientId ? { patientId } : "skip"
  );

  // Filter active medications
  const activeMedications = useMemo((): Medication[] => {
    return medications?.filter(med => med.status === "active") || [];
  }, [medications]);

  // Get medications for selected treatment
  const selectedTreatmentMedications = useMemo((): Medication[] => {
    if (!selectedTreatment || !activeMedications.length) return [];
    return activeMedications.filter(med => 
      med.treatmentPlan?._id === selectedTreatment._id
    );
  }, [selectedTreatment, activeMedications]);

  // Handle medication status update
  const handleMedicationStatusUpdate = useCallback(async (
    medicationId: string, 
    status: string
  ): Promise<void> => {
    try {
      await updateMedication({
        id: medicationId as any,
        status: status as "active" | "completed" | "discontinued"
      });
      toast.success(`Medication ${status} successfully`);
    } catch (error) {
      console.error("Failed to update medication status:", error);
      toast.error("Failed to update medication status");
    }
  }, [updateMedication]);

  return {
    medications,
    activeMedications,
    selectedTreatmentMedications,
    handleMedicationStatusUpdate,
    isLoading: medications === undefined,
  };
}
