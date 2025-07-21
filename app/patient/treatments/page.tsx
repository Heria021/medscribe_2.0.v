"use client";

import * as React from "react";
import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

import {
  usePatientAuth,
  usePatientTreatments,
  type TreatmentFilters as TreatmentFiltersType,
  type TreatmentPlan,
} from "@/app/patient/_components/treatments";
import { TreatmentList } from "@/app/patient/_components/treatments/components/TreatmentList";
import { TreatmentDetails } from "@/app/patient/_components/treatments/components/TreatmentDetails";
import { TreatmentStats } from "@/app/patient/_components/treatments/components/TreatmentStats";
import { TreatmentFilters } from "@/app/patient/_components/treatments/components/TreatmentFilters";
import { TreatmentViewer, useTreatmentViewer } from "@/components/ui/treatment-viewer";

/**
 * Profile Completion Component
 */
const ProfileCompletionContent = React.memo(({ patientProfile }: { patientProfile: any }) => {
  // Define required fields for profile completion
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

  const missingRequired = requiredFields.length - completedRequired.length;

  return (
    <div className="h-full w-full flex items-center justify-center p-4">
      <Card className="w-full max-w-lg bg-background border-border">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl text-foreground">Complete Your Profile to Access Treatments</CardTitle>
          <p className="text-muted-foreground">
            {!patientProfile
              ? "Set up your profile to view your treatment plans and medications."
              : `${missingRequired} required field${missingRequired !== 1 ? 's' : ''} remaining`
            }
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          <Link href="/patient/settings/profile" className="block">
            <Button className="w-full" size="lg">
              {!patientProfile ? "Get Started" : "Complete Profile"}
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
});

ProfileCompletionContent.displayName = "ProfileCompletionContent";

// Individual skeleton components
const TreatmentListSkeleton = () => (
  <Card className="flex-1 min-h-0 flex flex-col">
    <CardHeader className="pb-2 flex-shrink-0">
      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-5 w-6" />
      </div>
    </CardHeader>
    <CardContent className="flex-1 min-h-0 p-0">
      <div className="p-3 space-y-2">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="p-3 space-y-2 border border-border rounded-lg bg-muted/50">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-3 w-2/3" />
            <div className="flex items-center justify-between">
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-5 w-12" />
            </div>
          </div>
        ))}
      </div>
    </CardContent>
  </Card>
);

const TreatmentDetailsSkeleton = () => (
  <Card className="flex-1 min-h-0 flex flex-col">
    <CardHeader className="pb-3 flex-shrink-0">
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3 flex-1">
          <Skeleton className="h-10 w-10 rounded-lg" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-5 w-48" />
            <Skeleton className="h-4 w-64" />
            <Skeleton className="h-3 w-32" />
          </div>
        </div>
        <Skeleton className="h-6 w-16" />
      </div>
    </CardHeader>
    <CardContent className="flex-1 min-h-0 p-0">
      <div className="p-4 space-y-5">
        <div className="space-y-3">
          <Skeleton className="h-4 w-32" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="p-3 space-y-2 border border-border rounded-lg bg-muted/50">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-2/3" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </CardContent>
  </Card>
);

const TreatmentStatsSkeleton = () => (
  <div className="flex items-center gap-3">
    <div className="text-right">
      <Skeleton className="h-8 w-8 mb-1" />
      <Skeleton className="h-3 w-16" />
    </div>
    <div className="w-px h-8 bg-border" />
    <div className="text-right">
      <Skeleton className="h-8 w-8 mb-1" />
      <Skeleton className="h-3 w-20" />
    </div>
  </div>
);

const TreatmentFiltersSkeleton = () => (
  <div className="flex-shrink-0">
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
      <div className="relative flex-1 max-w-sm">
        <Skeleton className="h-9 w-full" />
      </div>
      <div className="flex items-center gap-2">
        <Skeleton className="h-4 w-12" />
        <div className="flex gap-1">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-8 w-16" />
          ))}
        </div>
      </div>
    </div>
  </div>
);

/**
 * Patient Treatments Page - Refactored with performance optimizations
 *
 * Features:
 * - Custom hooks for clean separation of concerns
 * - Performance optimized with React.memo and useCallback
 * - Reusable components for maintainability
 * - Comprehensive error handling
 * - Accessibility support
 * - Individual skeleton loading states
 */
const PatientTreatmentsPage = React.memo(() => {
  // State for selected treatment and filters
  const [selectedTreatment, setSelectedTreatment] = useState<TreatmentPlan | null>(null);
  const [filters, setFilters] = useState<TreatmentFiltersType>({
    status: [],
    searchTerm: "",
  });

  // Custom hooks for clean separation of concerns
  const {
    isLoading: authLoading,
    isAuthenticated,
    isPatient,
    patientProfile
  } = usePatientAuth();

  const {
    treatmentsWithMedications,
    standaloneMedications,
    isLoading: treatmentsLoading,
    stats,
  } = usePatientTreatments(patientProfile?._id);

  // Treatment viewer hook
  const treatmentViewer = useTreatmentViewer();

  // Memoized authentication check
  const isAuthorized = useMemo(() =>
    isAuthenticated && isPatient,
    [isAuthenticated, isPatient]
  );

  // Check if profile is complete
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

  // Filter treatments based on current filters
  const filteredTreatments = useMemo(() => {
    return treatmentsWithMedications.filter(treatment => {
      const matchesStatus = filters.status.length === 0 || filters.status.includes(treatment.status);
      const matchesSearch = filters.searchTerm === "" ||
        treatment.title.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
        treatment.diagnosis.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
        treatment.medications?.some((med: any) =>
          med.medicationName.toLowerCase().includes(filters.searchTerm.toLowerCase())
        );
      return matchesStatus && matchesSearch;
    });
  }, [treatmentsWithMedications, filters]);

  // Auto-select first treatment if none selected
  React.useEffect(() => {
    if (filteredTreatments.length > 0 && !selectedTreatment) {
      setSelectedTreatment(filteredTreatments[0]);
    }
  }, [filteredTreatments, selectedTreatment]);

  // Memoized handlers for performance
  const handleSelectTreatment = React.useCallback((treatment: TreatmentPlan) => {
    setSelectedTreatment(treatment);
  }, []);

  const handleFiltersChange = React.useCallback((newFilters: TreatmentFiltersType) => {
    setFilters(newFilters);
  }, []);

  const [selectedTreatmentId, setSelectedTreatmentId] = useState<string | null>(null);

  const handleViewTreatment = React.useCallback((treatment: TreatmentPlan) => {
    setSelectedTreatmentId(treatment._id);
    treatmentViewer.setOpen(true);
  }, [treatmentViewer]);

  // Authentication check
  if (authLoading || !isAuthorized) {
    return null;
  }

  // Show profile completion if profile is not complete
  if (!isProfileComplete) {
    return <ProfileCompletionContent patientProfile={patientProfile} />;
  }

  return (
    <div className="h-full flex flex-col space-y-4">
      {/* Header */}
      <div className="flex-shrink-0 space-y-1">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-foreground">Treatment Overview</h1>
            <p className="text-muted-foreground text-sm">View and manage your treatment plans and medications</p>
          </div>
          {treatmentsLoading ? (
            <TreatmentStatsSkeleton />
          ) : (
            <TreatmentStats stats={stats} isLoading={treatmentsLoading} />
          )}
        </div>
      </div>

      {/* Search and Filter Bar */}
      {treatmentsLoading ? (
        <TreatmentFiltersSkeleton />
      ) : (
        <TreatmentFilters
          filters={filters}
          onFiltersChange={handleFiltersChange}
          stats={stats}
        />
      )}

      {/* Main Content Grid - Reverse Layout */}
      <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Treatment List - Small on large screens (1/4 width) */}
        <div className="lg:col-span-1 lg:order-1 order-2 flex flex-col min-h-0">
          {treatmentsLoading ? (
            <TreatmentListSkeleton />
          ) : (
            <TreatmentList
              treatments={filteredTreatments}
              selectedTreatment={selectedTreatment}
              onSelectTreatment={handleSelectTreatment}
            />
          )}
        </div>

        {/* Treatment Details - Large on large screens (3/4 width) */}
        <div className="lg:col-span-3 lg:order-2 order-1 flex flex-col min-h-0">
          {treatmentsLoading ? (
            <TreatmentDetailsSkeleton />
          ) : (
            <TreatmentDetails
              treatment={selectedTreatment}
              standaloneMedications={standaloneMedications}
              onViewTreatment={handleViewTreatment}
            />
          )}
        </div>
      </div>

      {/* Treatment Viewer for full-screen document view */}
      <TreatmentViewer
        treatmentId={selectedTreatmentId}
        open={treatmentViewer.isOpen}
        onOpenChange={treatmentViewer.setOpen}
        config={{
          showBackButton: true,
          showActions: true,
          showPatientInfo: false,
          showDoctorInfo: true,
          showMetadata: false,
          allowPrint: true,
          allowDownload: true,
          allowShare: false,
          allowCopy: true,
          allowExportPDF: false,
          backButtonText: "Back to My Treatments",
          documentTitle: "My Treatment Plan"
        }}
        actions={{
          onBack: treatmentViewer.closeViewer,
        }}
      />
    </div>
  );
});

PatientTreatmentsPage.displayName = "PatientTreatmentsPage";

export default PatientTreatmentsPage;
