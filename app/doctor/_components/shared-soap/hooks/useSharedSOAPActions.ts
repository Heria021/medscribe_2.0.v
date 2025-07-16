import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useSOAPViewer } from "@/components/ui/soap-viewer";
import type { UseSharedSOAPActionsReturn, SharedSOAPNote } from "../types";

/**
 * Custom hook for managing shared SOAP note actions
 * 
 * Features:
 * - Handles viewing SOAP notes
 * - Manages action modal state
 * - Provides download functionality
 * - Marks notes as read when actions are taken
 * - Handles navigation to SOAP view
 * 
 * @returns {UseSharedSOAPActionsReturn} Action handlers and state
 */
export function useSharedSOAPActions(): UseSharedSOAPActionsReturn {
  const router = useRouter();
  const [selectedNote, setSelectedNote] = useState<SharedSOAPNote | null>(null);
  const [actionModalOpen, setActionModalOpen] = useState(false);

  // SOAP Viewer state
  const soapViewer = useSOAPViewer();

  // Mark as read mutation
  const markAsRead = useMutation(api.sharedSoapNotes.markAsRead);

  /**
   * Handle viewing a SOAP note
   * Marks the note as read and opens the SOAP viewer
   */
  const handleViewSOAP = useCallback(async (note: SharedSOAPNote) => {
    try {
      // Mark as read
      await markAsRead({ sharedSoapNoteId: note._id as any });
    } catch (error) {
      console.error("Error marking as read:", error);
    }

    // Convert SharedSOAPNote to SOAPNote format for viewer
    const soapNote = {
      _id: note.soapNote._id,
      subjective: note.soapNote.subjective,
      objective: note.soapNote.objective,
      assessment: note.soapNote.assessment,
      plan: note.soapNote.plan,
      qualityScore: note.soapNote.qualityScore,
      createdAt: note.createdAt,
      updatedAt: note.createdAt, // Use createdAt as fallback
      patientName: `${note.patient.firstName} ${note.patient.lastName}`,
      patientId: note.patient._id,
    };

    // Open SOAP viewer
    soapViewer.openViewer(soapNote);
  }, [markAsRead, soapViewer]);

  /**
   * Handle taking action on a SOAP note
   * Marks the note as read and opens the action modal
   */
  const handleTakeAction = useCallback(async (note: SharedSOAPNote) => {
    try {
      // Mark as read
      await markAsRead({ sharedSoapNoteId: note._id as any });
    } catch (error) {
      console.error("Error marking as read:", error);
    }

    setSelectedNote(note);
    setActionModalOpen(true);
  }, [markAsRead]);

  /**
   * Handle downloading a SOAP note
   * Creates a text file with the SOAP note content and triggers download
   */
  const handleDownloadNote = useCallback((note: SharedSOAPNote) => {
    const content = `SOAP Note - ${note.patient?.firstName} ${note.patient?.lastName}

Date: ${new Date(note.createdAt).toLocaleDateString()}
Patient: ${note.patient?.firstName} ${note.patient?.lastName}
MRN: ${note.patient?.mrn || 'N/A'}
Gender: ${note.patient?.gender}
DOB: ${note.patient?.dateOfBirth}

${note.message ? `Message: "${note.message}"` : ''}

SUBJECTIVE:
${note.soapNote?.subjective}

OBJECTIVE:
${note.soapNote?.objective}

ASSESSMENT:
${note.soapNote?.assessment}

PLAN:
${note.soapNote?.plan}

${note.soapNote?.qualityScore ? `Quality Score: ${note.soapNote.qualityScore}%` : ''}
Share Type: ${note.shareType === "direct_share" ? "Direct Share" : "Referral Share"}
Shared On: ${new Date(note.createdAt).toLocaleString()}`;

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `soap-note-${note.patient?.firstName}-${note.patient?.lastName}-${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }, []);

  /**
   * Close the action modal and clear selected note
   */
  const closeActionModal = useCallback(() => {
    setActionModalOpen(false);
    setSelectedNote(null);
  }, []);

  return {
    selectedNote,
    actionModalOpen,
    handleViewSOAP,
    handleTakeAction,
    handleDownloadNote,
    closeActionModal,
    soapViewer, // Expose SOAP viewer state
  };
}
