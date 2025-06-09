"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useQuery } from "convex/react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Pill, 
  Calendar, 
  Filter,
  Clock,
  AlertCircle,
  ArrowLeft
} from "lucide-react";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { MedicationCard } from "@/components/medications/medication-card";
import { api } from "@/convex/_generated/api";
import Link from "next/link";

export default function PatientMedicationsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "completed" | "discontinued">("all");

  // Fetch patient profile
  const patientProfile = useQuery(
    api.patients.getPatientByUserId,
    session?.user?.id ? { userId: session.user.id as any } : "skip"
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

  // Filter medications based on status
  const filteredMedications = medications?.filter(medication => 
    statusFilter === "all" || medication.status === statusFilter
  ) || [];

  // Get counts for different statuses
  const activeMedications = medications?.filter(m => m.status === "active").length || 0;
  const completedMedications = medications?.filter(m => m.status === "completed").length || 0;
  const discontinuedMedications = medications?.filter(m => m.status === "discontinued").length || 0;

  const handleEditMedication = (medicationId: string) => {
    // TODO: Implement edit functionality
    console.log("Edit medication:", medicationId);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 h-full flex flex-col">
        {/* Header */}
        <div className="flex-shrink-0">
          <div className="flex items-center gap-2 mb-4">
            <Link href="/patient/treatments">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-1" />
                Back to Treatments
              </Button>
            </Link>
          </div>
          <div className="space-y-2">
            <h1 className="text-xl font-bold tracking-tight">
              My Medications
            </h1>
            <p className="text-muted-foreground text-sm">
              View and manage your prescribed medications
            </p>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 min-h-0 space-y-6">
          {/* Overview Stats */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active</CardTitle>
                <Pill className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{activeMedications}</div>
                <p className="text-xs text-muted-foreground">
                  Currently taking
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Completed</CardTitle>
                <Pill className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">{completedMedications}</div>
                <p className="text-xs text-muted-foreground">
                  Finished courses
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Discontinued</CardTitle>
                <Pill className="h-4 w-4 text-red-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">{discontinuedMedications}</div>
                <p className="text-xs text-muted-foreground">
                  Stopped medications
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total</CardTitle>
                <Pill className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{medications?.length || 0}</div>
                <p className="text-xs text-muted-foreground">
                  All medications
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Filter by status:</span>
            <div className="flex gap-2">
              {["all", "active", "completed", "discontinued"].map((status) => (
                <Button
                  key={status}
                  variant={statusFilter === status ? "default" : "outline"}
                  size="sm"
                  onClick={() => setStatusFilter(status as any)}
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </Button>
              ))}
            </div>
          </div>

          {/* Medications List */}
          <div className="space-y-4">
            {filteredMedications.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Medications Found</h3>
                  <p className="text-muted-foreground text-center max-w-md">
                    {statusFilter === "all"
                      ? "You don't have any medications prescribed yet. Your doctor will prescribe medications as part of your treatment plans."
                      : `No ${statusFilter} medications found. Try changing the filter or check with your doctor.`
                    }
                  </p>
                  <div className="mt-4">
                    <Link href="/patient/appointments/book">
                      <Button>
                        <Calendar className="h-4 w-4 mr-2" />
                        Book Appointment
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {filteredMedications.map((medication) => (
                  <MedicationCard
                    key={medication._id}
                    medication={medication}
                    onEdit={() => handleEditMedication(medication._id)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
