"use client";

import React, { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  Search,
  X
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { Id } from "@/convex/_generated/dataModel";

interface PatientSOAPHistoryProps {
  patientId: Id<"patients">;
  doctorId: Id<"doctors">;
  className?: string;
  onClose?: () => void;
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
  onClose,
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

  // Get status color for SOAP note - using shadcn theme variables
  const getSOAPStatusColor = (note: any) => {
    if (note.shareType === "referral_share") {
      return "border-primary/20 bg-primary/5";
    }
    return "border-border bg-background";
  };

  // Get share type info - using shadcn theme variables
  const getShareTypeInfo = (shareType: string) => {
    switch (shareType) {
      case "referral_share":
        return {
          icon: <UserCheck className="h-3 w-3" />,
          label: "Referral",
          color: "bg-primary/10 text-primary border-primary/20"
        };
      case "direct_share":
        return {
          icon: <Share className="h-3 w-3" />,
          label: "Shared",
          color: "bg-secondary text-secondary-foreground border-secondary"
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
                <h3 className="text-base font-semibold tracking-tight text-foreground">
                  SOAP History
                </h3>
                <p className="text-xs text-muted-foreground">
                  {patient?.firstName} {patient?.lastName} - Clinical Records
                </p>
              </div>
              <Badge variant="secondary">
                {filteredNotes.length}
              </Badge>
              {onClose && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClose}
                  className="h-8 w-8 p-0 hover:bg-muted"
                >
                  <X className="h-4 w-4" />
                  <span className="sr-only">Close SOAP history</span>
                </Button>
              )}
            </div>
          </div>
        </div>

        <div className="flex-1 min-h-0 p-0">
          {/* Filters and Search */}
          <div className="p-4 border-b border-border bg-muted/20">
            <div className="space-y-4">
              {/* Filter Buttons */}
              <div className="flex gap-2">
                {[
                  { key: "all", label: "All", icon: <FileText className="h-4 w-4" /> },
                  { key: "shared", label: "Shared", icon: <Share className="h-4 w-4" /> },
                  { key: "referral", label: "Referrals", icon: <UserCheck className="h-4 w-4" /> }
                ].map((filter) => (
                  <Button
                    key={filter.key}
                    size="sm"
                    variant={selectedFilter === filter.key ? "default" : "ghost"}
                    className="px-3"
                    onClick={() => setSelectedFilter(filter.key as any)}
                  >
                    {filter.icon}
                    <span className="ml-2">{filter.label}</span>
                  </Button>
                ))}
              </div>
              
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search SOAP notes..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </div>

          <ScrollArea className="h-full">
            <div className="p-4">
              {filteredNotes.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center mb-4">
                    <Stethoscope className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <h4 className="font-medium text-base mb-2 text-foreground">
                    {searchQuery ? "No matching SOAP notes" : "No SOAP History"}
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    {searchQuery
                      ? "Try adjusting your search terms"
                      : "Patient hasn't shared any clinical records yet"
                    }
                  </p>
                  {/* Test Button for Demo */}
                  <Button
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
                    className="mt-4"
                    size="sm"
                  >
                    Test SOAP Viewer
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredNotes.map((note) => {
                    const shareTypeInfo = getShareTypeInfo(note.shareType);

                    return (
                      <div
                        key={note._id}
                        className={cn(
                          "p-4 border rounded-lg transition-all cursor-pointer group hover:shadow-sm",
                          getSOAPStatusColor(note)
                        )}
                        onClick={() => handleViewSOAP(note.soapNote)}
                      >
                        <div className="space-y-3">
                          {/* Header */}
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-2">
                                <h4 className="font-medium text-sm text-foreground group-hover:text-primary transition-colors line-clamp-1">
                                  {note.soapNote?.status || "Clinical Note"}
                                </h4>
                                <Badge
                                  variant="outline"
                                  className={cn("text-xs px-2", shareTypeInfo.color)}
                                >
                                  {shareTypeInfo.icon}
                                  <span className="ml-1">{shareTypeInfo.label}</span>
                                </Badge>
                              </div>
                              <div className="flex items-center gap-3">
                                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                  <Calendar className="h-4 w-4" />
                                  <span>{new Date(note.createdAt).toLocaleDateString()}</span>
                                </div>
                                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                  <Clock className="h-4 w-4" />
                                  <span>{new Date(note.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleViewSOAP(note.soapNote);
                                }}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                          </div>

                          {/* Content Preview */}
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {note.soapNote?.status?.substring(0, 100) || "No preview available"}
                            {(note.soapNote?.status?.length || 0) > 100 ? '...' : ''}
                          </p>

                          {/* Badges and Status */}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 flex-wrap">
                              {note.soapNote?.data && (
                                <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20">
                                  <Brain className="h-3 w-3 mr-1" />
                                  AI Enhanced
                                </Badge>
                              )}
                              <Badge variant="secondary">
                                <Shield className="h-3 w-3 mr-1" />
                                Clinical Note
                              </Badge>
                            </div>
                            <div className="text-sm text-muted-foreground">
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
