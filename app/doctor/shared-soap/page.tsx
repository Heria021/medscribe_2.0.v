"use client";

import React from "react";
import {
  useSharedSOAPAuth,
  useSharedSOAPNotes,
  useSharedSOAPActions,
  SharedSOAPSkeleton,
  SharedSOAPFilters,
  SharedSOAPNotesList,
  TakeActionDialog,
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
    <div className="h-full flex flex-col space-y-6">
      {/* Modern Header */}
      <div className="flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold tracking-tight">Shared SOAP Notes</h1>
            <p className="text-muted-foreground">
              Review and take action on notes shared by patients
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="text-right">
              <p className="text-sm font-medium">{filteredNotes.length}</p>
              <p className="text-xs text-muted-foreground">Total Notes</p>
            </div>
          </div>
        </div>
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

      {/* NEW: Modern Take Action Dialog */}
      {doctorProfile && (
        <TakeActionDialog
          open={actionModalOpen}
          onOpenChange={closeActionModal}
          note={selectedNote}
          doctorId={doctorProfile._id}
        />
      )}
    </div>
  );
});

SharedSOAPPage.displayName = "SharedSOAPPage";

export default SharedSOAPPage;
