"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo } from "react";
import { useQuery } from "convex/react";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { ShareSOAPDialog } from "@/components/patient/share-soap-dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { FileText, ArrowRight } from "lucide-react";
import {
  SOAPHistoryHeader,
  SOAPSearchBar,
  SOAPEmptyState,
  SOAPNotesGrid,
  SOAPNoteDetailView,
  useSOAPHistory,
} from "./_components";
import { api } from "@/convex/_generated/api";
import Link from "next/link";

// Skeleton Loading Component
function SOAPHistorySkeleton() {
  return (
      <div className="h-full flex flex-col space-y-4">
        {/* Header Skeleton */}
        <div className="flex-shrink-0 space-y-1">
          <Skeleton className="h-7 w-48" />
          <Skeleton className="h-4 w-80" />
        </div>

        {/* Search Bar Skeleton */}
        <div className="flex-shrink-0">
          <Skeleton className="h-10 w-full rounded-xl" />
        </div>

        {/* SOAP Notes Grid Skeleton */}
        <div className="flex-1 min-h-0">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 h-full">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="h-fit">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2 flex-1">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                    <div className="flex gap-1">
                      <Skeleton className="h-5 w-12" />
                      <Skeleton className="h-5 w-16" />
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {/* SOAP Sections Skeleton */}
                  {['Subjective', 'Objective', 'Assessment', 'Plan'].map((section) => (
                    <div key={section} className="space-y-1">
                      <Skeleton className="h-3 w-20" />
                      <Skeleton className="h-3 w-full" />
                      <Skeleton className="h-3 w-3/4" />
                    </div>
                  ))}

                  {/* Actions Skeleton */}
                  <div className="flex items-center justify-between pt-2">
                    <div className="flex gap-2">
                      <Skeleton className="h-7 w-16" />
                      <Skeleton className="h-7 w-14" />
                    </div>
                    <Skeleton className="h-7 w-8" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
  );
}

// Profile Completion Component (Inside Dashboard Layout)
function ProfileCompletionContent({ patientProfile }: { patientProfile: any }) {
  // Define required fields for profile completion (matching actual schema)
  const requiredFields = [
    { key: 'firstName', label: 'First Name' },
    { key: 'lastName', label: 'Last Name' },
    { key: 'dateOfBirth', label: 'Date of Birth' },
    { key: 'gender', label: 'Gender' },
    { key: 'primaryPhone', label: 'Phone Number' },
    { key: 'email', label: 'Email' },
    { key: 'addressLine1', label: 'Address' },
    { key: 'city', label: 'City' },
    { key: 'state', label: 'State' },
    { key: 'zipCode', label: 'Zip Code' },
    { key: 'emergencyContactName', label: 'Emergency Contact Name' },
    { key: 'emergencyContactPhone', label: 'Emergency Contact Phone' },
  ];

  const completedRequired = useMemo(() => {
    if (!patientProfile) return [];
    return requiredFields.filter(field => {
      const value = patientProfile[field.key];
      return value && (Array.isArray(value) ? value.length > 0 : value.toString().trim() !== "");
    });
  }, [patientProfile, requiredFields]);

  const requiredCompletion = (completedRequired.length / requiredFields.length) * 100;
  const missingRequired = requiredFields.length - completedRequired.length;

  return (
    <div className="h-full w-full flex items-center justify-center p-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-primary/10">
              <FileText className="h-8 w-8 text-primary" />
            </div>
          </div>
          <CardTitle className="text-2xl">Complete Your Profile to Access SOAP History</CardTitle>
          <p className="text-muted-foreground">
            {!patientProfile
              ? "Set up your profile to view your medical SOAP notes history."
              : `${missingRequired} required field${missingRequired !== 1 ? 's' : ''} remaining`
            }
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {patientProfile && (
            <div className="space-y-4">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Profile Completion</span>
                <span className="font-medium">{completedRequired.length}/{requiredFields.length} fields</span>
              </div>
              <div className="w-full bg-secondary rounded-full h-3">
                <div
                  className="bg-primary h-3 rounded-full transition-all duration-500"
                  style={{ width: `${requiredCompletion}%` }}
                />
              </div>
              <div className="flex justify-center">
                <Badge variant="secondary" className="text-sm px-3 py-1">
                  {Math.round(requiredCompletion)}% Complete
                </Badge>
              </div>
            </div>
          )}

          <div className="space-y-4">
            <div className="bg-muted/50 rounded-lg p-4">
              <h4 className="font-medium mb-2 flex items-center gap-2">
                <FileText className="h-4 w-4" />
                SOAP Notes Access
              </h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• View your complete medical history and notes</li>
                <li>• Track your treatments and care plans over time</li>
                <li>• Share specific notes with healthcare providers</li>
                <li>• Download and manage your medical records</li>
              </ul>
            </div>

            <p className="text-sm text-muted-foreground text-center">
              Complete your profile to access your SOAP notes history and medical records.
            </p>

            <Link href="/patient/settings/profile" className="block">
              <Button className="w-full" size="lg">
                {!patientProfile ? "Get Started" : "Complete Profile"}
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function SOAPHistoryPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // Get patient profile
  const patientProfile = useQuery(
    api.patients.getPatientByUserId,
    session?.user?.id ? { userId: session.user.id as any } : "skip"
  );

  // Check if profile is complete (matching actual schema)
  const isProfileComplete = useMemo(() => {
    if (!patientProfile) return false;

    const requiredFields = [
      'firstName', 'lastName', 'dateOfBirth', 'gender', 'primaryPhone', 'email',
      'addressLine1', 'city', 'state', 'zipCode', 'emergencyContactName', 'emergencyContactPhone'
    ] as const;

    return requiredFields.every(field => {
      const value = patientProfile[field as keyof typeof patientProfile];
      return value && (Array.isArray(value) ? value.length > 0 : value.toString().trim() !== "");
    });
  }, [patientProfile]);

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

    if (!session || session.user.role !== "patient") {
      router.push("/auth/signin");
    }
  }, [session, status, router]);

  // Show loading skeleton while session or profile is loading
  if (status === "loading" || (session?.user?.id && patientProfile === undefined)) {
    return <SOAPHistorySkeleton />;
  }

  // Redirect if not authenticated or wrong role
  if (!session || session.user.role !== "patient") {
    return null;
  }

  // Show detailed view if a note is selected (only if profile is complete)
  if (isProfileComplete && selectedNote) {
    const note = filteredNotes.find(n => n._id === selectedNote);
    if (note) {
      return (
          <SOAPNoteDetailView
            note={note}
            onBack={() => setSelectedNote(null)}
            formatDate={formatDate}
            getQualityColor={getQualityColor}
          />
      );
    }
  }

  // Show dashboard with profile completion content if profile is not complete
  return (
    <>
      {!isProfileComplete ? (
        <ProfileCompletionContent patientProfile={patientProfile} />
      ) : (
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
      )}
      </>
  );
}