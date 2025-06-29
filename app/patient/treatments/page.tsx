"use client";

import * as React from "react";
import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  usePatientAuth,
  usePatientTreatments,
  TreatmentList,
  TreatmentDetails,
  TreatmentStats,
  TreatmentFilters,
  type TreatmentFilters as TreatmentFiltersType,
  type TreatmentPlan,
} from "@/app/patient/_components/treatments";

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

  const requiredCompletion = (completedRequired.length / requiredFields.length) * 100;
  const missingRequired = requiredFields.length - completedRequired.length;

  return (
    <div className="h-full w-full flex items-center justify-center p-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Complete Your Profile to Access Treatments</CardTitle>
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

/**
 * Patient Treatments Page - Refactored with performance optimizations
 *
 * Features:
 * - Custom hooks for clean separation of concerns
 * - Performance optimized with React.memo and useCallback
 * - Reusable components for maintainability
 * - Comprehensive error handling
 * - Accessibility support
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

  // Memoized loading state
  const isLoading = useMemo(() =>
    authLoading || treatmentsLoading,
    [authLoading, treatmentsLoading]
  );

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

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  // Authentication check
  if (!isAuthorized) {
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
            <h1 className="text-xl font-bold tracking-tight">Treatment Overview</h1>
            <p className="text-muted-foreground text-sm">View and manage your treatment plans and medications</p>
          </div>
          <TreatmentStats stats={stats} isLoading={isLoading} />
        </div>
      </div>

      {/* Search and Filter Bar */}
      <TreatmentFilters
        filters={filters}
        onFiltersChange={handleFiltersChange}
        stats={stats}
      />

      {/* Main Content Grid - Reverse Layout */}
      <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Treatment List - Small on large screens (1/4 width) */}
        <div className="lg:col-span-1 lg:order-1 order-2 flex flex-col min-h-0">
          <TreatmentList
            treatments={filteredTreatments}
            selectedTreatment={selectedTreatment}
            onSelectTreatment={handleSelectTreatment}
          />
        </div>

        {/* Treatment Details - Large on large screens (3/4 width) */}
        <div className="lg:col-span-3 lg:order-2 order-1 flex flex-col min-h-0">
          <TreatmentDetails
            treatment={selectedTreatment}
            standaloneMedications={standaloneMedications}
          />
        </div>
      </div>
    </div>
  );
});

PatientTreatmentsPage.displayName = "PatientTreatmentsPage";

export default PatientTreatmentsPage;
