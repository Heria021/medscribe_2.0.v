"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useMemo } from "react";
import { useQuery } from "convex/react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Activity,
  Pill,
  Search,
  Calendar,
  Target,
  FileText,
  CheckCircle,
  XCircle,
  Pause,
  ArrowRight
} from "lucide-react";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { api } from "@/convex/_generated/api";
import Link from "next/link";

// Skeleton Loading Component
function TreatmentsSkeleton() {
  return (
    <DashboardLayout>
      <div className="h-full flex flex-col space-y-4">
        {/* Header Skeleton */}
        <div className="flex-shrink-0 space-y-1">
          <Skeleton className="h-7 w-48" />
          <Skeleton className="h-4 w-80" />
        </div>

        {/* Search and Filter Skeleton */}
        <div className="flex-shrink-0 flex items-center gap-4">
          <div className="relative flex-1 max-w-sm">
            <Skeleton className="h-9 w-full" />
          </div>
          <div className="flex gap-1">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-8 w-20" />
            ))}
          </div>
        </div>

        {/* Reverse Grid Layout Skeleton */}
        <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-4 gap-4 h-full">
          {/* Treatment List Skeleton (Small on large screens) */}
          <div className="lg:col-span-1 lg:order-1 order-2">
            <Card className="h-full">
              <CardHeader className="pb-3">
                <Skeleton className="h-5 w-32" />
              </CardHeader>
              <CardContent className="space-y-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="p-3 border rounded-lg space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-3 w-2/3" />
                    <Skeleton className="h-5 w-16" />
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Treatment Details Skeleton (Large on large screens) */}
          <div className="lg:col-span-3 lg:order-2 order-1">
            <Card className="h-full">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <Skeleton className="h-6 w-48" />
                  <Skeleton className="h-5 w-20" />
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Treatment Plan Skeleton */}
                <div className="space-y-3">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-20 w-full" />
                </div>

                {/* Goals Skeleton */}
                <div className="space-y-3">
                  <Skeleton className="h-4 w-24" />
                  <div className="space-y-2">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <Skeleton key={i} className="h-3 w-full" />
                    ))}
                  </div>
                </div>

                {/* Medications Skeleton */}
                <div className="space-y-3">
                  <Skeleton className="h-4 w-28" />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <div key={i} className="p-3 border rounded-lg space-y-2">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-3 w-24" />
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
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
              <Activity className="h-8 w-8 text-primary" />
            </div>
          </div>
          <CardTitle className="text-2xl">Complete Your Profile to Access Treatments</CardTitle>
          <p className="text-muted-foreground">
            {!patientProfile
              ? "Set up your profile to view your treatment plans and medications."
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
                <Activity className="h-4 w-4" />
                Treatment Management
              </h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• View your active treatment plans and care goals</li>
                <li>• Track medications, dosages, and schedules</li>
                <li>• Monitor treatment progress and outcomes</li>
                <li>• Access detailed treatment history and notes</li>
              </ul>
            </div>

            <p className="text-sm text-muted-foreground text-center">
              Complete your profile to access your treatment plans and medication management.
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

// Compact Treatment Item Component for Sidebar
function CompactTreatmentItem({ treatment, isSelected, onClick }: {
  treatment: any;
  isSelected: boolean;
  onClick: () => void;
}) {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active":
        return <CheckCircle className="h-3 w-3 text-green-600" />;
      case "completed":
        return <CheckCircle className="h-3 w-3 text-blue-600" />;
      case "discontinued":
        return <XCircle className="h-3 w-3 text-red-600" />;
      default:
        return <Pause className="h-3 w-3 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-50 text-green-700 border-green-200";
      case "completed":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "discontinued":
        return "bg-red-50 text-red-700 border-red-200";
      default:
        return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

  return (
    <div
      className={`p-3 border rounded-lg cursor-pointer transition-all duration-200 hover:bg-muted/50 ${
        isSelected
          ? 'border-primary bg-primary/5'
          : 'border-border hover:border-primary/50'
      }`}
      onClick={onClick}
    >
      <div className="space-y-2">
        <div className="flex items-start justify-between gap-2">
          <h4 className="font-medium text-sm truncate flex-1">{treatment.title}</h4>
          <Badge variant="outline" className={`${getStatusColor(treatment.status)} text-xs h-5 px-2`}>
            {getStatusIcon(treatment.status)}
          </Badge>
        </div>
        <p className="text-xs text-muted-foreground truncate">
          {treatment.diagnosis}
        </p>
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <Pill className="h-3 w-3" />
              {treatment.medications?.length || 0}
            </span>
            <span className="flex items-center gap-1">
              <Target className="h-3 w-3" />
              {treatment.goals?.length || 0}
            </span>
          </div>
          <span className="text-xs">
            {new Date(treatment.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </span>
        </div>
      </div>
    </div>
  );
}



export default function PatientTreatmentsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "completed" | "discontinued">("all");
  const [selectedTreatment, setSelectedTreatment] = useState<any>(null);

  // Fetch patient profile
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

  // Fetch treatment plans with details
  const treatmentPlans = useQuery(
    api.treatmentPlans.getWithDetailsByPatientId,
    patientProfile?._id ? { patientId: patientProfile._id } : "skip"
  );

  // Fetch medications with details
  const medications = useQuery(
    api.medications.getWithDetailsByPatientId,
    patientProfile?._id ? { patientId: patientProfile._id } : "skip"
  );

  // Create treatment plans with their associated medications
  const treatmentsWithMedications = treatmentPlans?.map(treatment => {
    const relatedMedications = medications?.filter(med =>
      med.treatmentPlan?._id === treatment._id
    ) || [];
    return {
      ...treatment,
      medications: relatedMedications
    };
  }) || [];

  // Filter and search treatments with medications
  const filteredTreatments = treatmentsWithMedications.filter(treatment => {
    const matchesStatus = statusFilter === "all" || treatment.status === statusFilter;
    const matchesSearch = searchTerm === "" ||
      treatment.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      treatment.diagnosis.toLowerCase().includes(searchTerm.toLowerCase()) ||
      treatment.medications.some((med: any) =>
        med.medicationName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    return matchesStatus && matchesSearch;
  });

  // Get standalone medications (not associated with any treatment)
  const standaloneMedications = medications?.filter(med => !med.treatmentPlan) || [];

  // Get active counts for badges
  const activeTreatments = treatmentPlans?.filter(t => t.status === "active").length || 0;
  const activeMedications = medications?.filter(m => m.status === "active").length || 0;

  useEffect(() => {
    if (status === "loading") return;

    if (!session || session.user.role !== "patient") {
      router.push("/auth/login");
    }
  }, [session, status, router]);

  // Auto-select first treatment if none selected
  useEffect(() => {
    if (filteredTreatments.length > 0 && !selectedTreatment) {
      setSelectedTreatment(filteredTreatments[0]);
    }
  }, [filteredTreatments, selectedTreatment]);

  // Show loading skeleton while session or profile is loading
  if (status === "loading" || (session?.user?.id && patientProfile === undefined)) {
    return <TreatmentsSkeleton />;
  }

  // Redirect if not authenticated or wrong role
  if (!session || session.user.role !== "patient") {
    return null;
  }

  // Show dashboard with profile completion content if profile is not complete
  return (
    <DashboardLayout>
      {!isProfileComplete ? (
        <ProfileCompletionContent patientProfile={patientProfile} />
      ) : (
        <div className="h-full flex flex-col space-y-4">
          {/* Header */}
          <div className="flex-shrink-0 space-y-1">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xl font-bold tracking-tight">Treatment Overview</h1>
                <p className="text-muted-foreground text-sm">View and manage your treatment plans and medications</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <div className="text-2xl font-bold text-foreground">{activeTreatments}</div>
                  <div className="text-xs text-muted-foreground">Active Plans</div>
                </div>
                <div className="w-px h-8 bg-border" />
                <div className="text-right">
                  <div className="text-2xl font-bold text-foreground">{activeMedications}</div>
                  <div className="text-xs text-muted-foreground">Medications</div>
                </div>
              </div>
            </div>
          </div>

          {/* Search and Filter Bar */}
          <div className="flex-shrink-0">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search treatments..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 h-9"
                />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Status:</span>
                <div className="flex gap-1">
                  {[
                    { value: "all", label: "All", count: treatmentsWithMedications.length },
                    { value: "active", label: "Active", count: activeTreatments },
                    { value: "completed", label: "Completed", count: treatmentPlans?.filter(t => t.status === "completed").length || 0 },
                    { value: "discontinued", label: "Stopped", count: treatmentPlans?.filter(t => t.status === "discontinued").length || 0 }
                  ].map((status) => (
                    <Button
                      key={status.value}
                      variant={statusFilter === status.value ? "default" : "outline"}
                      size="sm"
                      onClick={() => setStatusFilter(status.value as any)}
                      className="h-8 text-xs"
                    >
                      {status.label}
                      {status.count > 0 && (
                        <Badge variant="secondary" className="ml-1 h-4 text-xs">
                          {status.count}
                        </Badge>
                      )}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Main Content Grid - Reverse Layout */}
          <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-4 gap-4">
            {/* Treatment List - Small on large screens (1/4 width) */}
            <div className="lg:col-span-1 lg:order-1 order-2 flex flex-col min-h-0">
              <Card className="flex-1 min-h-0 flex flex-col">
                <CardHeader className="pb-2 flex-shrink-0">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-semibold">Treatments</CardTitle>
                    {filteredTreatments.length > 0 && (
                      <Badge variant="outline" className="text-xs h-5">
                        {filteredTreatments.length}
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="flex-1 min-h-0 p-0">
                  <ScrollArea className="h-full scrollbar-hide">
                    <div className="p-3">
                      {filteredTreatments.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-6 text-center">
                          <Activity className="h-6 w-6 text-muted-foreground mb-2" />
                          <h3 className="font-medium text-sm mb-1">No treatments found</h3>
                          <p className="text-muted-foreground text-xs">
                            {searchTerm ? (
                              <>No treatments match "{searchTerm}"</>
                            ) : statusFilter === "all" ? (
                              "No treatment plans yet"
                            ) : (
                              `No ${statusFilter} treatments`
                            )}
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {filteredTreatments.map((treatment) => (
                            <CompactTreatmentItem
                              key={treatment._id}
                              treatment={treatment}
                              isSelected={selectedTreatment?._id === treatment._id}
                              onClick={() => setSelectedTreatment(treatment)}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>

            {/* Treatment Details - Large on large screens (3/4 width) */}
            <div className="lg:col-span-3 lg:order-2 order-1 flex flex-col min-h-0">
              <Card className="flex-1 min-h-0 flex flex-col">
                {selectedTreatment ? (
                  <>
                    <CardHeader className="pb-3 flex-shrink-0">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3 flex-1">
                          <div className="p-2 bg-primary/10 rounded-lg">
                            <Activity className="h-4 w-4 text-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <CardTitle className="text-lg mb-1">{selectedTreatment.title}</CardTitle>
                            <p className="text-sm text-muted-foreground">
                              <span className="font-medium">Diagnosis:</span> {selectedTreatment.diagnosis}
                            </p>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground mt-2">
                              <Calendar className="h-3 w-3" />
                              <span>Started {new Date(selectedTreatment.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                              {selectedTreatment.endDate && (
                                <>
                                  <span>•</span>
                                  <span>Ends {new Date(selectedTreatment.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                        <Badge variant="outline" className="text-sm">
                          {selectedTreatment.status}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="flex-1 min-h-0 p-0">
                      <ScrollArea className="h-full scrollbar-hide">
                        <div className="p-4 space-y-5">
                          {/* Medications - Top Priority */}
                          {selectedTreatment.medications && selectedTreatment.medications.length > 0 && (
                            <div>
                              <div className="flex items-center gap-2 mb-3">
                                <Pill className="h-4 w-4 text-muted-foreground" />
                                <h3 className="font-semibold text-base">Medications ({selectedTreatment.medications.length})</h3>
                              </div>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {selectedTreatment.medications.map((med: any) => (
                                  <div key={med._id} className="p-3 bg-blue-50/50 dark:bg-blue-950/10 rounded-lg border border-blue-200/50 dark:border-blue-800/50">
                                    <div className="flex items-start justify-between mb-2">
                                      <div className="flex-1 min-w-0">
                                        <h4 className="font-medium text-sm text-foreground">{med.medicationName}</h4>
                                        <p className="text-xs text-muted-foreground">{med.dosage} • {med.frequency}</p>
                                      </div>
                                      <Badge variant="outline" className="text-xs ml-2">
                                        {med.status}
                                      </Badge>
                                    </div>
                                    {med.instructions && (
                                      <p className="text-xs text-muted-foreground mt-2">{med.instructions}</p>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Treatment Plan and Goals - Adjacent Layout */}
                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                            {/* Treatment Plan */}
                            <div>
                              <div className="flex items-center gap-2 mb-3">
                                <FileText className="h-4 w-4 text-muted-foreground" />
                                <h3 className="font-semibold text-base">Treatment Plan</h3>
                              </div>
                              <div className="bg-muted/50 rounded-lg p-4">
                                <p className="text-sm leading-relaxed">{selectedTreatment.plan}</p>
                              </div>
                            </div>

                            {/* Goals */}
                            {selectedTreatment.goals && selectedTreatment.goals.length > 0 && (
                              <div>
                                <div className="flex items-center gap-2 mb-3">
                                  <Target className="h-4 w-4 text-muted-foreground" />
                                  <h3 className="font-semibold text-base">Treatment Goals</h3>
                                </div>
                                <div className="space-y-2">
                                  {selectedTreatment.goals.map((goal: string, index: number) => (
                                    <div key={index} className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
                                      <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                                      <span className="text-sm leading-relaxed">{goal}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Doctor Info */}
                          {selectedTreatment.doctor && (
                            <div>
                              <div className="flex items-center gap-2 mb-3">
                                <h3 className="font-semibold text-base">Prescribing Doctor</h3>
                              </div>
                              <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                                <Avatar className="h-10 w-10">
                                  <AvatarFallback className="bg-primary/10 text-primary">
                                    {selectedTreatment.doctor.firstName?.[0]}{selectedTreatment.doctor.lastName?.[0]}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="flex-1 min-w-0">
                                  <div className="font-medium text-sm">
                                    Dr. {selectedTreatment.doctor.firstName} {selectedTreatment.doctor.lastName}
                                  </div>
                                  <div className="text-xs text-muted-foreground">
                                    {selectedTreatment.doctor.primarySpecialty}
                                  </div>
                                </div>
                                <Button variant="outline" size="sm">
                                  Contact
                                </Button>
                              </div>
                            </div>
                          )}

                          {/* Standalone Medications */}
                          {standaloneMedications.length > 0 && (
                            <div>
                              <div className="flex items-center gap-2 mb-3">
                                <Pill className="h-4 w-4 text-orange-600" />
                                <h3 className="font-semibold text-base">Independent Medications</h3>
                                <Badge variant="outline">{standaloneMedications.length}</Badge>
                              </div>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {standaloneMedications.map((medication) => (
                                  <div key={medication._id} className="p-3 bg-orange-50/50 dark:bg-orange-950/10 rounded-lg border border-orange-200/50 dark:border-orange-800/50">
                                    <div className="flex items-center justify-between">
                                      <div className="flex-1 min-w-0">
                                        <div className="font-medium text-sm text-foreground">
                                          {medication.medicationName}
                                        </div>
                                        <div className="text-xs text-muted-foreground">
                                          {medication.dosage} • {medication.frequency}
                                        </div>
                                      </div>
                                      <Badge variant="outline" className="text-xs ml-2">
                                        {medication.status}
                                      </Badge>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </ScrollArea>
                    </CardContent>
                  </>
                ) : (
                  <div className="h-full flex items-center justify-center">
                    <div className="text-center">
                      <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="font-semibold mb-2">Select a Treatment</h3>
                      <p className="text-sm text-muted-foreground">
                        Choose a treatment from the list to view detailed information
                      </p>
                    </div>
                  </div>
                )}
              </Card>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
