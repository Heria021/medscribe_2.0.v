"use client";

import React, { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SOAPViewer, useSOAPViewer } from "@/components/ui/soap-viewer";
import {
  FileText,
  Eye,
  Calendar,
  Brain,
  Shield,
  Stethoscope,
  Share,
  UserCheck,
  Clock,
  ChevronRight,
  Search
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { Id } from "@/convex/_generated/dataModel";

interface PatientSOAPHistoryProps {
  patientId: Id<"patients">;
  doctorId: Id<"doctors">;
  className?: string;
}

/**
 * PatientSOAPHistory Component
 * 
 * Comprehensive SOAP notes viewer showing all shared and referred SOAP notes
 * for a patient that came to this doctor. Similar to chat component structure
 * but focused on clinical documentation and referral history.
 */
export const PatientSOAPHistory: React.FC<PatientSOAPHistoryProps> = ({
  patientId,
  doctorId,
  className,
}) => {
  // Early return if required props are missing
  if (!patientId || !doctorId) {
    return (
      <div className={cn("h-full flex flex-col bg-background border border-border rounded-lg", className)}>
        <div className="p-4 text-center text-muted-foreground">
          Invalid patient or doctor ID
        </div>
      </div>
    );
  }

  const [selectedFilter, setSelectedFilter] = React.useState<"all" | "shared" | "referral">("all");
  const [searchQuery, setSearchQuery] = React.useState("");

  // SOAP viewer hook
  const soapViewer = useSOAPViewer();

  // Fetch all shared SOAP notes for this patient to this doctor
  const sharedSoapNotes = useQuery(
    api.sharedSoapNotes.getSharedNotesForDoctor,
    { patientId, doctorId }
  );



  // Fetch patient details
  const patient = useQuery(api.patients.getPatientById, { patientId });

  // Loading state
  const isLoading = sharedSoapNotes === undefined || patient === undefined;

  // Filter and search SOAP notes
  const filteredNotes = React.useMemo(() => {
    if (!sharedSoapNotes || !Array.isArray(sharedSoapNotes)) return [];

    let filtered = [...sharedSoapNotes];

    // Apply filter
    if (selectedFilter !== "all") {
      filtered = filtered.filter(note => {
        if (selectedFilter === "shared") return note?.shareType === "direct_share";
        if (selectedFilter === "referral") return note?.shareType === "referral_share";
        return true;
      });
    }

    // Apply search
    if (searchQuery && searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(note => {
        if (!note?.soapNote) return false;

        try {
          // Search in SOAP note data
          const searchableText = [
            note.soapNote.status || '',
            JSON.stringify(note.soapNote.data || {})
          ].join(' ').toLowerCase();

          return searchableText.includes(query);
        } catch (error) {
          return false;
        }
      });
    }

    return filtered.sort((a, b) => (b?.createdAt || 0) - (a?.createdAt || 0));
  }, [sharedSoapNotes, selectedFilter, searchQuery]);

  // Handle SOAP note viewing
  const handleViewSOAP = React.useCallback((soapNote: any) => {
    if (soapNote && soapViewer?.openViewer) {
      soapViewer.openViewer(soapNote);
    }
  }, [soapViewer]);

  // Get status color for SOAP note
  const getSOAPStatusColor = (note: any) => {
    if (note.shareType === "referral_share") {
      return "border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950";
    }
    return "border-border bg-background";
  };

  // Get share type info
  const getShareTypeInfo = (shareType: string) => {
    switch (shareType) {
      case "referral_share":
        return {
          icon: <UserCheck className="h-3 w-3" />,
          label: "Referral",
          color: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800"
        };
      case "direct_share":
        return {
          icon: <Share className="h-3 w-3" />,
          label: "Shared",
          color: "bg-green-50 text-green-700 border-green-200 dark:bg-green-950 dark:text-green-300 dark:border-green-800"
        };
      default:
        return {
          icon: <FileText className="h-3 w-3" />,
          label: "Note",
          color: "bg-muted text-muted-foreground border-border"
        };
    }
  };

  // Loading skeleton
  if (isLoading) {
    return (
      <div className={cn("h-full flex flex-col bg-background border border-border rounded-lg", className)}>
        <div className="p-0 flex-shrink-0">
          <div className="relative overflow-hidden rounded-t-lg bg-gradient-to-r from-muted/50 via-muted/30 to-transparent">
            <div className="relative px-4 flex items-center gap-3">
              <Skeleton className="h-8 w-8 rounded-lg" />
              <div className="flex-1">
                <Skeleton className="h-5 w-40 mb-1" />
                <Skeleton className="h-3 w-32" />
              </div>
              <Skeleton className="h-6 w-8 rounded-full" />
            </div>
          </div>
        </div>
        <div className="flex-1 min-h-0 p-0">
          <div className="space-y-3 p-3">
            <div className="flex gap-2">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-8 w-16 rounded-full" />
              ))}
            </div>
            <Skeleton className="h-9 w-full rounded-lg" />
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="p-3 border border-border rounded-lg bg-background">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <Skeleton className="h-4 w-32 flex-1" />
                      <Skeleton className="h-5 w-16" />
                    </div>
                    <Skeleton className="h-3 w-full" />
                    <div className="flex items-center justify-between">
                      <Skeleton className="h-3 w-16" />
                      <Skeleton className="h-6 w-12" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className={cn("h-full flex flex-col bg-background border border-border rounded-lg", className)}>
        <div className="p-0 flex-shrink-0">
          <div className="relative overflow-hidden rounded-t-lg bg-gradient-to-r from-muted/50 via-muted/30 to-transparent">
            <div className="relative px-4 py-3 flex items-center gap-3">
              <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                <Stethoscope className="h-4 w-4 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-foreground">
                  SOAP History
                </h3>
                <p className="text-xs text-muted-foreground">
                  {patient?.firstName} {patient?.lastName} - Clinical Records
                </p>
              </div>
              <Badge variant="secondary" className="text-xs h-6 px-2">
                {filteredNotes.length}
              </Badge>
            </div>
          </div>
        </div>

        <div className="flex-1 min-h-0 p-0">
          {/* Filters and Search */}
          <div className="p-3 border-b border-border bg-muted/20">
            <div className="space-y-3">
              {/* Filter Buttons */}
              <div className="flex gap-1">
                {[
                  { key: "all", label: "All", icon: <FileText className="h-3 w-3" /> },
                  { key: "shared", label: "Shared", icon: <Share className="h-3 w-3" /> },
                  { key: "referral", label: "Referrals", icon: <UserCheck className="h-3 w-3" /> }
                ].map((filter) => (
                  <Button
                    key={filter.key}
                    size="sm"
                    variant={selectedFilter === filter.key ? "default" : "ghost"}
                    className="h-7 px-2 text-xs"
                    onClick={() => setSelectedFilter(filter.key as any)}
                  >
                    {filter.icon}
                    <span className="ml-1">{filter.label}</span>
                  </Button>
                ))}
              </div>
              
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-3 w-3 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search SOAP notes..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-8 pl-7 pr-3 text-xs bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>
            </div>
          </div>

          <ScrollArea className="h-full">
            <div className="p-3">
              {filteredNotes.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <div className="w-12 h-12 bg-muted/30 rounded-lg flex items-center justify-center mb-3">
                    <Stethoscope className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <h4 className="font-medium text-sm mb-1 text-foreground">
                    {searchQuery ? "No matching SOAP notes" : "No SOAP History"}
                  </h4>
                  <p className="text-xs text-muted-foreground">
                    {searchQuery
                      ? "Try adjusting your search terms"
                      : "Patient hasn't shared any clinical records yet"
                    }
                  </p>
                  {/* Test Button for Demo */}
                  <button
                    onClick={() => {
                      const testNote = {
                        _id: "test-soap-1",
                        subjective: "Patient reports feeling better after treatment. No side effects noted.",
                        objective: "Vital signs stable. Temperature 98.6°F, BP 120/80, HR 72.",
                        assessment: "Responding well to current treatment plan.",
                        plan: "Continue current medication. Follow up in 2 weeks.",
                        data: {
                          chiefComplaint: "Follow-up visit",
                          primaryDiagnosis: "Hypertension, controlled",
                          hasEnhancedData: true,
                          safetyStatus: true,
                          specialty_detection: { specialty: "Internal Medicine" }
                        }
                      };
                      handleViewSOAP(testNote);
                    }}
                    className="mt-3 px-3 py-1 text-xs bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
                  >
                    Test SOAP Viewer
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredNotes.map((note) => {
                    const shareTypeInfo = getShareTypeInfo(note.shareType);
                    
                    return (
                      <div
                        key={note._id}
                        className={cn(
                          "p-3 border rounded-lg transition-all cursor-pointer group hover:shadow-sm",
                          getSOAPStatusColor(note)
                        )}
                        onClick={() => handleViewSOAP(note.soapNote)}
                      >
                        <div className="space-y-2">
                          {/* Header */}
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className="font-medium text-xs text-foreground group-hover:text-primary transition-colors line-clamp-1">
                                  {note.soapNote?.status || "Clinical Note"}
                                </h4>
                                <Badge 
                                  variant="outline" 
                                  className={cn("text-xs h-4 px-1", shareTypeInfo.color)}
                                >
                                  {shareTypeInfo.icon}
                                  <span className="ml-1">{shareTypeInfo.label}</span>
                                </Badge>
                              </div>
                              <div className="flex items-center gap-2">
                                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                  <Calendar className="h-3 w-3" />
                                  <span>{new Date(note.createdAt).toLocaleDateString()}</span>
                                </div>
                                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                  <Clock className="h-3 w-3" />
                                  <span>{new Date(note.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-1">
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleViewSOAP(note.soapNote);
                                }}
                              >
                                <Eye className="h-3 w-3" />
                              </Button>
                              <ChevronRight className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                          </div>

                          {/* Content Preview */}
                          <p className="text-xs text-muted-foreground line-clamp-2">
                            {note.soapNote?.status?.substring(0, 100) || "No preview available"}
                            {(note.soapNote?.status?.length || 0) > 100 ? '...' : ''}
                          </p>

                          {/* Badges and Status */}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1 flex-wrap">
                              {note.soapNote?.data && (
                                <Badge variant="outline" className="text-xs h-4 px-1">
                                  <Brain className="h-2 w-2 mr-1" />
                                  AI Enhanced
                                </Badge>
                              )}
                              <Badge variant="secondary" className="text-xs h-4 px-1">
                                <Shield className="h-2 w-2 mr-1" />
                                Clinical Note
                              </Badge>
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {note.shareType === "referral_share" ? "Referred by" : "Shared by"} patient
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </ScrollArea>
        </div>
      </div>

      {/* SOAP Viewer */}
      <SOAPViewer
        note={soapViewer.selectedNote}
        open={soapViewer.isOpen}
        onOpenChange={soapViewer.setOpen}
        config={{
          showBackButton: true,
          showActions: true,
          showPatientInfo: true,
          showMetadata: true,
          allowPrint: true,
          allowDownload: true,
          allowShare: false,
          allowCopy: true,
          allowExportPDF: true,
          backButtonText: "Back to SOAP History",
          documentTitle: "Shared SOAP Note"
        }}
        actions={{
          onBack: soapViewer.closeViewer,
        }}
      />
    </>
  );
};
