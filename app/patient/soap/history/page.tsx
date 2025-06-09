"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useQuery } from "convex/react";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { ShareSOAPDialog } from "@/components/patient/share-soap-dialog";
import {
  SOAPHistoryHeader,
  SOAPSearchBar,
  SOAPEmptyState,
  SOAPNotesGrid,
  SOAPNoteDetailView,
  useSOAPHistory,
} from "./_components";
import { api } from "@/convex/_generated/api";

export default function SOAPHistoryPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // Get patient profile
  const patientProfile = useQuery(
    api.patients.getPatientByUserId,
    session?.user?.id ? { userId: session.user.id as any } : "skip"
  );

  // Use the custom hook for all SOAP history logic
  const {
    filteredNotes,
    stats,
    sharedNotesMap,
    referrals,
    searchTerm,
    selectedNote,
    shareDialogOpen,
    selectedSoapNoteId,
    setSearchTerm,
    setSelectedNote,
    setShareDialogOpen,
    handleShareNote,
    handleShareSuccess,
    handleDownloadNote,
    handleClearSearch,
    formatDate,
    getQualityColor,
  } = useSOAPHistory(patientProfile?._id || "");

  // Redirect if not authenticated
  useEffect(() => {
    if (status === "loading") return;
    if (!session) {
      router.push("/auth/signin");
      return;
    }
    if (session.user.role !== "patient") {
      router.push("/auth/signin");
      return;
    }
  }, [session, status, router]);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/20">
        <div className="text-lg text-foreground animate-pulse">Loading...</div>
      </div>
    );
  }

  if (!session || session.user.role !== "patient") {
    return null;
  }

  // Show detailed view if a note is selected
  if (selectedNote) {
    const note = filteredNotes.find(n => n._id === selectedNote);
    if (note) {
      return (
        <DashboardLayout>
          <SOAPNoteDetailView
            note={note}
            onBack={() => setSelectedNote(null)}
            formatDate={formatDate}
            getQualityColor={getQualityColor}
          />
        </DashboardLayout>
      );
    }
  }

  return (
    <DashboardLayout>
      <div className="h-full flex flex-col space-y-4">
        {/* Header */}
        <div className="flex-shrink-0 space-y-1">
          <SOAPHistoryHeader patientProfile={patientProfile} />
        </div>

        {/* Search Bar */}
        <div className="flex-shrink-0">
          <SOAPSearchBar
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            filteredCount={filteredNotes.length}
            totalCount={stats.totalNotes}
          />
        </div>

        {/* SOAP Notes Grid - Scrollable */}
        <div className="flex-1 min-h-0">
          {filteredNotes.length === 0 ? (
            <SOAPEmptyState
              searchTerm={searchTerm}
              onClearSearch={handleClearSearch}
            />
          ) : (
            <SOAPNotesGrid
              notes={filteredNotes}
              sharedNotesMap={sharedNotesMap}
              referrals={referrals || []}
              onDownload={handleDownloadNote}
              onShare={handleShareNote}
              formatDate={formatDate}
              getQualityColor={getQualityColor}
            />
          )}
        </div>

        {/* Share Dialog */}
        {selectedSoapNoteId && (
          <ShareSOAPDialog
            open={shareDialogOpen}
            onOpenChange={setShareDialogOpen}
            soapNoteId={selectedSoapNoteId}
            onSuccess={handleShareSuccess}
          />
        )}
      </div>
    </DashboardLayout>
  );
}