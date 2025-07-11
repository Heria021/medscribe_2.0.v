import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";
import type { UseReferralsActionsReturn } from "../types";

/**
 * Custom hook for managing referral actions
 * 
 * Features:
 * - Handles accepting referrals
 * - Manages declining referrals
 * - Provides completing referrals functionality
 * - Handles navigation to SOAP view
 * - Manages response form state
 * - Provides loading states for actions
 * 
 * @returns {UseReferralsActionsReturn} Action handlers and state
 */
export function useReferralsActions(): UseReferralsActionsReturn {
  const router = useRouter();
  const [selectedReferral, setSelectedReferral] = useState<string | null>(null);
  const [responseNotes, setResponseNotes] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  // Mutations
  const acceptReferral = useMutation(api.referrals.accept);
  const declineReferral = useMutation(api.referrals.decline);
  const completeReferral = useMutation(api.referrals.complete);

  /**
   * Handle accepting a referral
   * Shows success message and clears form state
   */
  const handleAcceptReferral = useCallback(async (referralId: string) => {
    setIsProcessing(true);
    try {
      await acceptReferral({
        referralId: referralId as any,
        responseMessage: responseNotes,
      });
      toast.success("Referral accepted! SOAP note has been shared with you.");
      setResponseNotes("");
      setSelectedReferral(null);
    } catch (error) {
      console.error("Error accepting referral:", error);
      toast.error("Failed to accept referral");
    } finally {
      setIsProcessing(false);
    }
  }, [acceptReferral, responseNotes]);

  /**
   * Handle declining a referral
   * Validates response notes are provided and shows appropriate messages
   */
  const handleDeclineReferral = useCallback(async (referralId: string) => {
    if (!responseNotes.trim()) {
      toast.error("Please provide a reason for declining the referral");
      return;
    }

    setIsProcessing(true);
    try {
      await declineReferral({
        referralId: referralId as any,
        responseMessage: responseNotes,
      });
      toast.success("Referral declined. Notifications have been sent.");
      setResponseNotes("");
      setSelectedReferral(null);
    } catch (error) {
      console.error("Error declining referral:", error);
      toast.error("Failed to decline referral");
    } finally {
      setIsProcessing(false);
    }
  }, [declineReferral, responseNotes]);

  /**
   * Handle completing a referral
   * Marks the referral as completed
   */
  const handleCompleteReferral = useCallback(async (referralId: string) => {
    setIsProcessing(true);
    try {
      await completeReferral({ referralId: referralId as any });
      toast.success("Referral marked as completed.");
    } catch (error) {
      console.error("Error completing referral:", error);
      toast.error("Failed to complete referral");
    } finally {
      setIsProcessing(false);
    }
  }, [completeReferral]);

  /**
   * Handle viewing a SOAP note
   * Navigates to the SOAP view page
   */
  const handleViewSOAP = useCallback((soapNoteId: string) => {
    router.push(`/doctor/soap/view/${soapNoteId}`);
  }, [router]);

  /**
   * Clear response form and close selection
   */
  const clearResponseForm = useCallback(() => {
    setResponseNotes("");
    setSelectedReferral(null);
  }, []);

  return {
    selectedReferral,
    responseNotes,
    setSelectedReferral,
    setResponseNotes,
    handleAcceptReferral,
    handleDeclineReferral,
    handleCompleteReferral,
    handleViewSOAP,
    isProcessing,
  };
}
