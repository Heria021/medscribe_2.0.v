"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useQuery } from "convex/react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Activity,
  Pill,
  Search,
  Calendar,
  Target,
  FileText,
  ChevronRight,
  MoreHorizontal,
  CheckCircle,
  XCircle,
  Pause
} from "lucide-react";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { api } from "@/convex/_generated/api";

// Custom Treatment Item Component
function TreatmentItem({ treatment }: { treatment: any }) {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "completed":
        return <CheckCircle className="h-4 w-4 text-blue-600" />;
      case "discontinued":
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Pause className="h-4 w-4 text-gray-600" />;
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className="group border border-border rounded-lg p-4 hover:border-primary/50 transition-all duration-200 bg-card">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-start gap-3 flex-1">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Activity className="h-4 w-4 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-base text-foreground mb-1 truncate">
              {treatment.title}
            </h3>
            <p className="text-sm text-muted-foreground mb-2">
              <span className="font-medium">Diagnosis:</span> {treatment.diagnosis}
            </p>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Calendar className="h-3 w-3" />
              <span>Started {formatDate(treatment.startDate)}</span>
              {treatment.endDate && (
                <>
                  <span>•</span>
                  <span>Ends {formatDate(treatment.endDate)}</span>
                </>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className={`${getStatusColor(treatment.status)} text-xs`}>
            {getStatusIcon(treatment.status)}
            <span className="ml-1">{treatment.status}</span>
          </Badge>
          <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Treatment Plan */}
      <div className="mb-3">
        <div className="bg-muted/50 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-2">
            <FileText className="h-3 w-3 text-muted-foreground" />
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Treatment Plan</span>
          </div>
          <p className="text-sm text-foreground leading-relaxed">
            {treatment.plan}
          </p>
        </div>
      </div>

      {/* Goals */}
      {treatment.goals && treatment.goals.length > 0 && (
        <div className="mb-3">
          <div className="flex items-center gap-2 mb-2">
            <Target className="h-3 w-3 text-muted-foreground" />
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Goals</span>
          </div>
          <div className="space-y-1">
            {treatment.goals.slice(0, 2).map((goal: string, index: number) => (
              <div key={index} className="flex items-start gap-2">
                <div className="w-1 h-1 rounded-full bg-primary mt-2 flex-shrink-0" />
                <span className="text-sm text-muted-foreground">{goal}</span>
              </div>
            ))}
            {treatment.goals.length > 2 && (
              <div className="text-xs text-muted-foreground ml-3">
                +{treatment.goals.length - 2} more goals
              </div>
            )}
          </div>
        </div>
      )}

      {/* Medications */}
      {treatment.medications && treatment.medications.length > 0 && (
        <div className="mb-3">
          <div className="flex items-center gap-2 mb-2">
            <Pill className="h-3 w-3 text-muted-foreground" />
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Medications</span>
            <Badge variant="secondary" className="text-xs h-4">
              {treatment.medications.length}
            </Badge>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {treatment.medications.map((med: any) => (
              <div key={med._id} className="flex items-center justify-between p-2 bg-blue-50/50 dark:bg-blue-950/10 rounded border border-blue-200/50 dark:border-blue-800/50">
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-xs text-foreground truncate">
                    {med.medicationName}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {med.dosage} • {med.frequency}
                  </div>
                </div>
                <Badge variant="outline" className={`text-xs h-4 ml-2 ${getStatusColor(med.status)}`}>
                  {med.status}
                </Badge>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Doctor Info */}
      {treatment.doctor && (
        <div className="flex items-center justify-between pt-3 border-t border-border/50">
          <div className="flex items-center gap-2">
            <Avatar className="h-6 w-6">
              <AvatarFallback className="text-xs bg-primary/10 text-primary">
                {treatment.doctor.firstName?.[0]}{treatment.doctor.lastName?.[0]}
              </AvatarFallback>
            </Avatar>
            <div className="text-xs">
              <div className="font-medium text-foreground">
                Dr. {treatment.doctor.firstName} {treatment.doctor.lastName}
              </div>
              <div className="text-muted-foreground">
                {treatment.doctor.primarySpecialty}
              </div>
            </div>
          </div>
          <Button variant="ghost" size="sm" className="text-xs">
            View Details
            <ChevronRight className="h-3 w-3 ml-1" />
          </Button>
        </div>
      )}
    </div>
  );
}

export default function PatientTreatmentsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "completed" | "discontinued">("all");

  // Fetch patient profile
  const patientProfile = useQuery(
    api.patients.getPatientByUserId,
    session?.user?.id ? { userId: session.user.id as any } : "skip"
  );

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

  useEffect(() => {
    if (status === "loading") return;

    if (!session || session.user.role !== "patient") {
      router.push("/auth/login");
    }
  }, [session, status, router]);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!session || session.user.role !== "patient") {
    return null;
  }

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

  return (
    <DashboardLayout>
      <div className="h-full flex flex-col space-y-6">
        {/* Header */}
        <div className="flex-shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold tracking-tight">Treatment Overview</h1>
              <p className="text-muted-foreground text-sm">
                Comprehensive view of your treatment plans and medications
              </p>
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
          <div className="flex items-center gap-4">
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

        {/* Content */}
        <div className="flex-1 min-h-0">
          <ScrollArea className="h-full scrollbar-hide">
            <div className="space-y-4">
              {filteredTreatments.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                    <Activity className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">No treatments found</h3>
                  <p className="text-muted-foreground max-w-md">
                    {searchTerm ? (
                      <>No treatments match your search "{searchTerm}". Try adjusting your search or filters.</>
                    ) : statusFilter === "all" ? (
                      "You don't have any treatment plans yet. Your doctor will create treatment plans during your appointments."
                    ) : (
                      `No ${statusFilter} treatments found. Try changing the filter.`
                    )}
                  </p>
                </div>
              ) : (
                <>
                  {filteredTreatments.map((treatment) => (
                    <TreatmentItem key={treatment._id} treatment={treatment} />
                  ))}

                  {/* Standalone Medications */}
                  {standaloneMedications.length > 0 && (
                    <div className="border border-border rounded-lg p-4 bg-card">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="p-2 bg-orange-100 dark:bg-orange-900/20 rounded-lg">
                          <Pill className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-base">Independent Medications</h3>
                          <p className="text-sm text-muted-foreground">
                            Medications not linked to a specific treatment plan
                          </p>
                        </div>
                        <Badge variant="outline" className="ml-auto">
                          {standaloneMedications.length} medications
                        </Badge>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {standaloneMedications.map((medication) => (
                          <div key={medication._id} className="p-3 bg-orange-50/50 dark:bg-orange-950/10 rounded border border-orange-200/50 dark:border-orange-800/50">
                            <div className="flex items-center justify-between">
                              <div className="flex-1 min-w-0">
                                <div className="font-medium text-sm text-foreground truncate">
                                  {medication.medicationName}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  {medication.dosage} • {medication.frequency}
                                </div>
                              </div>
                              <Badge variant="outline" className="text-xs h-4 ml-2">
                                {medication.status}
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </ScrollArea>
        </div>
      </div>
    </DashboardLayout>
  );
}
