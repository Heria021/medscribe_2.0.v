"use client";

import React from "react";
import { DoctorActionModal } from "@/components/doctor/doctor-action-modal";
import {
  useSharedSOAPAuth,
  useSharedSOAPNotes,
  useSharedSOAPActions,
  SharedSOAPSkeleton,
  SharedSOAPFilters,
  SharedSOAPNotesList,
} from "@/app/doctor/_components/shared-soap";

/**
 * SharedSOAPPage - Refactored with clean separation of concerns
 *
 * Features:
 * - Custom hooks for authentication, data management, and actions
 * - Reusable components for UI elements
 * - Performance optimized with React.memo
 * - Clean error handling and loading states
 * - Comprehensive filtering and search functionality
 */
const SharedSOAPPage = React.memo(() => {
  // Custom hooks for clean separation of concerns
  const {
    isLoading: authLoading,
    isAuthenticated,
    isDoctor,
    doctorProfile,
  } = useSharedSOAPAuth();

  const {
    filteredNotes,
    isLoading: notesLoading,
    filters,
    setSearchTerm,
    setFilterUnread,
    setFilterShareType,
    setFilterDateRange,
    clearAllFilters,
  } = useSharedSOAPNotes(doctorProfile);

  const {
    selectedNote,
    actionModalOpen,
    handleViewSOAP,
    handleTakeAction,
    handleDownloadNote,
    closeActionModal,
  } = useSharedSOAPActions();

  // Date formatting utility
  const formatDate = React.useCallback((timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }, []);

  // Show loading skeleton while authentication or profile is loading
  if (authLoading) {
    return <SharedSOAPSkeleton />;
  }

  // Redirect handled by useSharedSOAPAuth hook
  if (!isAuthenticated || !isDoctor) {
    return null;
  }



  return (
    <div className="h-full flex flex-col space-y-4">
      {/* Header */}
      <div className="flex-shrink-0 space-y-1">
        <h1 className="text-xl font-bold tracking-tight">Shared SOAP Notes</h1>
        <p className="text-muted-foreground text-sm">
          Review and take action on notes shared by patients
        </p>
      </div>

      {/* Search and Filters */}
      <SharedSOAPFilters
        filters={filters}
        onSearchChange={setSearchTerm}
        onUnreadToggle={setFilterUnread}
        onShareTypeChange={setFilterShareType}
        onDateRangeChange={setFilterDateRange}
        onClearFilters={clearAllFilters}
      />

      {/* Notes List - Takes remaining height */}
      <SharedSOAPNotesList
        notes={filteredNotes}
        isLoading={notesLoading}
        onViewSOAP={handleViewSOAP}
        onTakeAction={handleTakeAction}
        onDownloadNote={handleDownloadNote}
        formatDate={formatDate}
        onClearFilters={clearAllFilters}
      />

      {/* Action Modal */}
      {selectedNote && doctorProfile && (
        <DoctorActionModal
          isOpen={actionModalOpen}
          onClose={closeActionModal}
          soapNoteId={selectedNote.soapNote._id}
          patientId={selectedNote.patient._id}
          doctorId={doctorProfile._id}
          patientName={`${selectedNote.patient.firstName} ${selectedNote.patient.lastName}`}
          sharedSoapNoteId={selectedNote._id}
        />
      )}
    </div>
  );
});

SharedSOAPPage.displayName = "SharedSOAPPage";

export default SharedSOAPPage;
