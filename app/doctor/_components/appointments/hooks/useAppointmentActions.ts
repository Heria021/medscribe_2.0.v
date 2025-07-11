import { useState, useCallback } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import type { UseAppointmentActionsReturn, Appointment } from "../types";

/**
 * Custom hook for handling appointment actions
 * 
 * Features:
 * - Appointment status updates (cancel, confirm, start, complete)
 * - Rescheduling functionality
 * - Video call joining
 * - Loading states for each action
 * - Error handling and reporting
 * 
 * @returns {UseAppointmentActionsReturn} Action handlers and state
 */
export function useAppointmentActions(): UseAppointmentActionsReturn {
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Convex mutations
  const updateAppointmentStatus = useMutation(api.appointments.updateStatus);
  const updateAppointmentDateTime = useMutation(api.appointments.updateDateTime);

  // Helper function to manage loading state
  const withLoading = useCallback(async <T,>(
    appointmentId: Id<"appointments">,
    action: string,
    fn: () => Promise<T>
  ): Promise<T> => {
    const key = `${appointmentId}-${action}`;
    
    try {
      setLoadingStates(prev => ({ ...prev, [key]: true }));
      setErrors(prev => ({ ...prev, [key]: "" }));
      
      const result = await fn();
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "An error occurred";
      setErrors(prev => ({ ...prev, [key]: errorMessage }));
      throw error;
    } finally {
      setLoadingStates(prev => ({ ...prev, [key]: false }));
    }
  }, []);

  // Cancel appointment
  const cancelAppointment = useCallback(async (appointmentId: Id<"appointments">) => {
    await withLoading(appointmentId, "cancel", async () => {
      await updateAppointmentStatus({
        appointmentId,
        status: "cancelled"
      });
    });
  }, [updateAppointmentStatus, withLoading]);

  // Confirm appointment
  const confirmAppointment = useCallback(async (appointmentId: Id<"appointments">) => {
    await withLoading(appointmentId, "confirm", async () => {
      await updateAppointmentStatus({
        appointmentId,
        status: "confirmed"
      });
    });
  }, [updateAppointmentStatus, withLoading]);

  // Start appointment
  const startAppointment = useCallback(async (appointmentId: Id<"appointments">) => {
    await withLoading(appointmentId, "start", async () => {
      await updateAppointmentStatus({
        appointmentId,
        status: "in_progress"
      });
    });
  }, [updateAppointmentStatus, withLoading]);

  // Complete appointment
  const completeAppointment = useCallback(async (appointmentId: Id<"appointments">) => {
    await withLoading(appointmentId, "complete", async () => {
      await updateAppointmentStatus({
        appointmentId,
        status: "completed"
      });
    });
  }, [updateAppointmentStatus, withLoading]);

  // Reschedule appointment
  const rescheduleAppointment = useCallback(async (
    appointmentId: Id<"appointments">, 
    newDateTime: number
  ) => {
    await withLoading(appointmentId, "reschedule", async () => {
      await updateAppointmentDateTime({
        appointmentId,
        newDateTime
      });
    });
  }, [updateAppointmentDateTime, withLoading]);

  // Join video call
  const joinCall = useCallback((appointment: Appointment) => {
    if (appointment.location?.type === "telemedicine" && appointment.location.meetingLink) {
      window.open(appointment.location.meetingLink, "_blank");
    } else {
      // Fallback to a generic meeting room or show error
      console.warn("No meeting link available for this appointment");
    }
  }, []);

  return {
    cancelAppointment,
    confirmAppointment,
    startAppointment,
    completeAppointment,
    rescheduleAppointment,
    joinCall,
    loadingStates,
    errors,
  };
}
