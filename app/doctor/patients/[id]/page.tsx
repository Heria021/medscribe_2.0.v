"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { useState, use } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  ArrowLeft,
  Plus,
  Activity,
  Pill,
  Calendar,
  Phone,
  Mail,
  User,
  Clock,
  Target,
  CheckCircle,
  Eye
} from "lucide-react";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { AddTreatmentForm } from "@/components/treatments/add-treatment-form";
import { AddMedicationForm } from "@/components/medications/add-medication-form";
import { toast } from "sonner";

interface PatientDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

// Helper function to calculate age
function calculateAge(dateOfBirth: string): number {
  const today = new Date();
  const birthDate = new Date(dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }

  return age;
}

export default function PatientDetailPage({ params }: PatientDetailPageProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const [selectedTreatmentId, setSelectedTreatmentId] = useState<string | null>(null);
  const [activeView, setActiveView] = useState<"overview" | "treatment-form" | "medication-form">("overview");

  const updateTreatment = useMutation(api.treatmentPlans.update);
  const updateMedication = useMutation(api.medications.update);

  const resolvedParams = use(params);
  const patientId = resolvedParams.id as Id<"patients">;

  // Get doctor profile
  const doctorProfile = useQuery(
    api.doctors.getDoctorProfile,
    session?.user?.id ? { userId: session.user.id as any } : "skip"
  );

  // Get patient details
  const patient = useQuery(api.patients.getPatientById, { patientId });

  // Get doctor-patient relationship
  const currentDoctorPatient = useQuery(
    api.doctorPatients.getDoctorPatientRelationship,
    doctorProfile && patientId ? {
      doctorId: doctorProfile._id,
      patientId: patientId as any
    } : "skip"
  );

  // Get treatment plans
  const treatmentPlans = useQuery(
    api.treatmentPlans.getWithDetailsByPatientId,
    { patientId }
  );

  // Get medications
  const medications = useQuery(
    api.medications.getWithDetailsByPatientId,
    { patientId }
  );



  const handleTreatmentStatusUpdate = async (treatmentId: string, status: string) => {
    try {
      await updateTreatment({
        id: treatmentId as any,
        status: status as "active" | "completed" | "discontinued"
      });
      toast.success(`Treatment ${status} successfully`);
    } catch (error) {
      toast.error("Failed to update treatment status");
    }
  };

  const handleMedicationStatusUpdate = async (medicationId: string, status: string) => {
    try {
      await updateMedication({
        id: medicationId as any,
        status: status as "active" | "completed" | "discontinued"
      });
      toast.success(`Medication ${status} successfully`);
    } catch (error) {
      toast.error("Failed to update medication status");
    }
  };

  if (!session || session.user.role !== "doctor") {
    return null;
  }

  if (!patient || !doctorProfile || !currentDoctorPatient) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-sm text-muted-foreground">Loading patient details...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const activeTreatments = treatmentPlans?.filter(plan => plan.status === "active") || [];
  const activeMedications = medications?.filter(med => med.status === "active") || [];
  const selectedTreatment = selectedTreatmentId
    ? activeTreatments.find(t => t._id === selectedTreatmentId)
    : null;
  const selectedTreatmentMedications = selectedTreatment
    ? activeMedications.filter(med => med.treatmentPlan?._id === selectedTreatment._id)
    : [];

  // Auto-select first treatment if none selected
  if (!selectedTreatmentId && activeTreatments.length > 0) {
    setSelectedTreatmentId(activeTreatments[0]._id);
  }

  return (
    <DashboardLayout>
      <div className="h-full flex flex-col">
        {/* Header */}
        <div className="flex items-center gap-2 mb-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.back()}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-xl font-bold tracking-tight">
            {patient.firstName} {patient.lastName}
          </h1>
        </div>

        {/* Patient Info Bar */}
        <div className="flex items-center justify-between p-3 border rounded-xl mb-4">
          <div className="flex items-center gap-4">
            <Avatar className="h-10 w-10">
              <AvatarFallback className="text-sm font-bold bg-primary text-primary-foreground">
                {patient.firstName[0]}{patient.lastName[0]}
              </AvatarFallback>
            </Avatar>

            <div className="flex items-center gap-4 text-sm">
              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {calculateAge(patient.dateOfBirth)} years
              </span>
              <span className="flex items-center gap-1">
                <User className="h-3 w-3" />
                {patient.gender}
              </span>
              <span className="flex items-center gap-1">
                <Phone className="h-3 w-3" />
                {patient.primaryPhone}
              </span>
              <span className="flex items-center gap-1">
                <Mail className="h-3 w-3" />
                {patient.email}
              </span>
            </div>
          </div>

          <Button
            size="sm"
            onClick={() => setActiveView("treatment-form")}
            className="rounded-lg"
          >
            <Plus className="h-4 w-4 mr-1" />
            Add Treatment
          </Button>
        </div>

        {/* Main Content */}
        <div className="flex-1 min-h-0">
          {activeView === "treatment-form" ? (
            <div className="border rounded-xl h-full flex flex-col">
              <div className="flex items-center justify-between p-3 border-b">
                <div className="flex items-center gap-2">
                  <Activity className="h-4 w-4 text-blue-600" />
                  <span className="font-medium">Add Treatment Plan</span>
                </div>
                <Button variant="outline" size="sm" onClick={() => setActiveView("overview")} className="rounded-lg">
                  Cancel
                </Button>
              </div>
              <div className="flex-1 overflow-auto p-4">
                <AddTreatmentForm
                  doctorPatientId={currentDoctorPatient._id}
                  patientId={patientId}
                  onSuccess={() => setActiveView("overview")}
                  onCancel={() => setActiveView("overview")}
                />
              </div>
            </div>
          ) : activeView === "medication-form" ? (
            <div className="border rounded-xl h-full flex flex-col">
              <div className="flex items-center justify-between p-3 border-b">
                <div className="flex items-center gap-2">
                  <Pill className="h-4 w-4 text-purple-600" />
                  <span className="font-medium">Add Medication</span>
                </div>
                <Button variant="outline" size="sm" onClick={() => setActiveView("overview")} className="rounded-lg">
                  Cancel
                </Button>
              </div>
              <div className="flex-1 overflow-auto p-4">
                <AddMedicationForm
                  treatmentPlanId={selectedTreatmentId as any}
                  onSuccess={() => setActiveView("overview")}
                  onCancel={() => setActiveView("overview")}
                />
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-full">
              {/* Left Column - Treatment List */}
              <div className="lg:col-span-2">
                <div className="border rounded-xl h-full flex flex-col">
                  <div className="flex items-center gap-2 p-3 border-b">
                    <Activity className="h-4 w-4 text-blue-600" />
                    <span className="font-medium">Treatment Plans ({activeTreatments.length})</span>
                  </div>
                  <div className="flex-1 overflow-auto">
                    {activeTreatments.length === 0 ? (
                      <div className="text-center py-6 px-3">
                        <div className="mx-auto w-8 h-8 bg-muted rounded-full flex items-center justify-center mb-2">
                          <Activity className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <h3 className="font-medium mb-1">No Active Treatments</h3>
                        <p className="text-xs text-muted-foreground mb-2">
                          Start by adding a treatment plan for this patient
                        </p>
                        <Button size="sm" onClick={() => setActiveView("treatment-form")}>
                          <Plus className="h-4 w-4 mr-1" />
                          Add First Treatment
                        </Button>
                      </div>
                    ) : (
                      <div className="divide-y">
                        {activeTreatments.map((treatment) => (
                          <div
                            key={treatment._id}
                            className={`p-2 cursor-pointer hover:bg-muted/50 transition-colors ${
                              selectedTreatmentId === treatment._id ? 'bg-muted' : ''
                            }`}
                            onClick={() => setSelectedTreatmentId(treatment._id)}
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <h4 className="font-medium text-sm">{treatment.title}</h4>
                                <p className="text-xs text-muted-foreground">
                                  {treatment.diagnosis}
                                </p>
                                <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                                  <span className="flex items-center gap-1">
                                    <Calendar className="h-3 w-3" />
                                    {new Date(treatment.startDate).toLocaleDateString()}
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <Pill className="h-3 w-3" />
                                    {activeMedications.filter(med => med.treatmentPlan?._id === treatment._id).length} meds
                                  </span>
                                </div>
                              </div>
                              <div className="flex items-center gap-1">
                                <Badge variant="secondary" className="text-xs">
                                  {treatment.status}
                                </Badge>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="h-6 px-1 text-xs"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleTreatmentStatusUpdate(treatment._id, "completed");
                                  }}
                                >
                                  <CheckCircle className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Right Column - Selected Treatment Details */}
              <div className="space-y-4">
                {selectedTreatment ? (
                  <>
                    {/* Treatment Details */}
                    <div className="border rounded-xl flex flex-col h-[300px]">
                      <div className="flex items-center gap-2 p-3 border-b">
                        <Target className="h-4 w-4 text-green-600" />
                        <span className="font-medium text-sm">Treatment Details</span>
                      </div>
                      <div className="flex-1 overflow-auto p-3 space-y-3">
                        <div>
                          <h4 className="font-medium text-sm">{selectedTreatment.title}</h4>
                          <p className="text-xs text-muted-foreground">
                            <span className="font-medium">Diagnosis:</span> {selectedTreatment.diagnosis}
                          </p>
                        </div>

                        <div className="p-2 rounded bg-muted/30 border-l-2 border-blue-500">
                          <p className="text-xs font-medium mb-1 text-blue-700 dark:text-blue-300">Treatment Plan:</p>
                          <p className="text-xs text-muted-foreground">{selectedTreatment.plan}</p>
                        </div>

                        {selectedTreatment.goals && selectedTreatment.goals.length > 0 && (
                          <div className="p-2 rounded bg-emerald-50/50 dark:bg-emerald-900/10 border-l-2 border-emerald-500">
                            <p className="text-xs font-medium mb-1 text-emerald-700 dark:text-emerald-300 flex items-center gap-1">
                              <Target className="h-3 w-3" />
                              Goals:
                            </p>
                            <ul className="space-y-1">
                              {selectedTreatment.goals.map((goal: string, goalIndex: number) => (
                                <li key={goalIndex} className="flex items-start gap-1 text-xs">
                                  <div className="w-1 h-1 rounded-full bg-emerald-500 mt-1 flex-shrink-0"></div>
                                  <span className="text-muted-foreground">{goal}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        <div className="flex items-center gap-3 text-xs text-muted-foreground pt-1 border-t">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {new Date(selectedTreatment.startDate).toLocaleDateString()}
                          </span>
                          {selectedTreatment.endDate && (
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {new Date(selectedTreatment.endDate).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Medications for Selected Treatment */}
                    <div className="border rounded-xl flex flex-col h-[250px]">
                      <div className="flex items-center justify-between p-3 border-b">
                        <div className="flex items-center gap-2">
                          <Pill className="h-4 w-4 text-purple-600" />
                          <span className="font-medium text-sm">Medications ({selectedTreatmentMedications.length})</span>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setActiveView("medication-form")}
                          className="rounded-lg"
                        >
                          <Plus className="h-4 w-4 mr-1" />
                          Add
                        </Button>
                      </div>
                      <div className="flex-1 overflow-auto">
                        {selectedTreatmentMedications.length === 0 ? (
                          <div className="text-center py-4 px-3">
                            <div className="mx-auto w-6 h-6 bg-muted rounded-full flex items-center justify-center mb-2">
                              <Pill className="h-3 w-3 text-muted-foreground" />
                            </div>
                            <p className="text-xs text-muted-foreground mb-2">
                              No medications for this treatment
                            </p>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setActiveView("medication-form")}
                            >
                              <Plus className="h-4 w-4 mr-1" />
                              Add Medication
                            </Button>
                          </div>
                        ) : (
                          <div className="divide-y">
                            {selectedTreatmentMedications.map((medication) => (
                              <div key={medication._id} className="p-2">
                                <div className="flex items-start justify-between mb-1">
                                  <div className="flex-1">
                                    <h5 className="font-medium text-xs">{medication.medicationName}</h5>
                                    <p className="text-xs text-muted-foreground">
                                      {medication.dosage} • {medication.frequency}
                                    </p>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <Badge variant="secondary" className="text-xs">
                                      {medication.status}
                                    </Badge>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      className="h-5 px-1 text-xs"
                                      onClick={() => handleMedicationStatusUpdate(medication._id, "completed")}
                                    >
                                      <CheckCircle className="h-3 w-3" />
                                    </Button>
                                  </div>
                                </div>
                                {medication.instructions && (
                                  <p className="text-xs text-muted-foreground mt-1">
                                    <span className="font-medium">Instructions:</span> {medication.instructions}
                                  </p>
                                )}
                                <p className="text-xs text-muted-foreground">
                                  Started: {new Date(medication.startDate).toLocaleDateString()}
                                </p>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="border rounded-xl p-6 text-center">
                    <div className="mx-auto w-10 h-10 bg-muted rounded-xl flex items-center justify-center mb-3">
                      <Eye className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <h3 className="font-medium text-sm mb-1">Select a Treatment</h3>
                    <p className="text-xs text-muted-foreground">
                      Choose a treatment from the list to view its details and medications
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}