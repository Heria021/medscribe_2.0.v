"use client";

import { useState, useMemo } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useToast } from "@/hooks/use-toast";
import {
  filterNotes,
  calculateStats,
  createSharedNotesMap,
  downloadNote,
  formatDate,
  getQualityColor,
} from "./soap-history-utils";

export function useSOAPHistory(patientId: string) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedNote, setSelectedNote] = useState<string | null>(null);
  const [selectedSoapNoteId, setSelectedSoapNoteId] = useState<string | null>(null);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const { toast } = useToast();

  // Data fetching - only if patientId is provided
  const soapNotes = useQuery(
    api.soapNotes.getByPatientId,
    patientId ? { patientId: patientId as any } : "skip"
  );
  const sharedNotes = useQuery(
    api.sharedSoapNotes.getSharedSOAPNotesByPatient,
    patientId ? { patientId: patientId as any } : "skip"
  );
  const referrals = useQuery(
    api.referrals.getByPatient,
    patientId ? { patientId: patientId as any } : "skip"
  );
  const patientProfile = useQuery(
    api.patients.getPatientById,
    patientId ? { patientId: patientId as any } : "skip"
  );

  // Memoized calculations
  const sharedNotesMap = useMemo(() => createSharedNotesMap(sharedNotes || []), [sharedNotes]);
  
  const filteredNotes = useMemo(() => 
    filterNotes(soapNotes || [], searchTerm), 
    [soapNotes, searchTerm]
  );

  const stats = useMemo(() => 
    calculateStats(filteredNotes, sharedNotes || []), 
    [filteredNotes, sharedNotes]
  );

  // Event handlers
  const handleShareNote = (soapNoteId: string) => {
    setSelectedSoapNoteId(soapNoteId);
    setShareDialogOpen(true);
  };

  const handleShareSuccess = () => {
    toast({
      title: "SOAP Note Shared Successfully",
      description: "The SOAP note has been shared with the selected doctor.",
    });
    setSelectedSoapNoteId(null);
  };

  const handleDownloadNote = (note: any) => {
    downloadNote(note);
  };

  const handleClearSearch = () => {
    setSearchTerm("");
  };

  return {
    // Data
    soapNotes,
    sharedNotes,
    referrals,
    patientProfile,
    filteredNotes,
    sharedNotesMap,
    stats,
    
    // State
    searchTerm,
    selectedNote,
    selectedSoapNoteId,
    shareDialogOpen,
    
    // Actions
    setSearchTerm,
    setSelectedNote,
    setShareDialogOpen,
    handleShareNote,
    handleShareSuccess,
    handleDownloadNote,
    handleClearSearch,
    
    // Utils
    formatDate,
    getQualityColor,
  };
}
