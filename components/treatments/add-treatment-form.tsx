"use client";

import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Plus,
  X,
  Target,
  Pill,
  Trash2,
  FileText
} from "lucide-react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { toast } from "sonner";
import { PrescriptionForm } from "@/components/prescriptions/prescription-form";

interface Medication {
  medicationName: string;
  dosage: string;
  frequency: string;
  instructions: string;
  startDate: string;
  endDate?: string;
}

interface AddTreatmentFormProps {
  doctorPatientId: Id<"doctorPatients">;
  patientId: Id<"patients">;
  soapNoteId?: Id<"soapNotes"> | null;
  onSuccess: () => void;
  onCancel: () => void;
}

export function AddTreatmentForm({
  doctorPatientId,
  patientId,
  soapNoteId,
  onSuccess,
  onCancel,
}: AddTreatmentFormProps) {
  const [loading, setLoading] = useState(false);
  const [currentGoal, setCurrentGoal] = useState("");
  const [selectedSoapNoteId, setSelectedSoapNoteId] = useState<string>(soapNoteId || "none");

  // Treatment form state
  const [treatmentForm, setTreatmentForm] = useState({
    title: "",
    diagnosis: "",
    plan: "",
    goals: [] as string[],
    status: "active" as "active" | "completed" | "discontinued",
    startDate: new Date().toISOString().split('T')[0],
    endDate: "",
  });

  // Medications state
  const [medications, setMedications] = useState<Medication[]>([]);
  const [currentMedication, setCurrentMedication] = useState<Medication>({
    medicationName: "",
    dosage: "",
    frequency: "",
    instructions: "",
    startDate: new Date().toISOString().split('T')[0],
    endDate: "",
  });

  // Prescription state
  const [showPrescriptionForm, setShowPrescriptionForm] = useState(false);
  const [createdTreatmentPlanId, setCreatedTreatmentPlanId] = useState<string | null>(null);

  // Get doctor-patient relationship to extract patient ID
  const doctorPatientRelation = useQuery(
    api.doctorPatients.getById,
    { doctorPatientId }
  );

  // Get shared SOAP notes for this patient
  const sharedSoapNotes = useQuery(
    api.sharedSoapNotes.getSharedSOAPNotesByPatient,
    doctorPatientRelation?.patientId ? { patientId: doctorPatientRelation.patientId } : "skip"
  );

  const createTreatmentPlan = useMutation(api.treatmentPlans.create);
  const createMedication = useMutation(api.medications.create);

  const handleAddGoal = () => {
    if (currentGoal.trim()) {
      setTreatmentForm(prev => ({
        ...prev,
        goals: [...prev.goals, currentGoal.trim()]
      }));
      setCurrentGoal("");
    }
  };

  const handleRemoveGoal = (index: number) => {
    setTreatmentForm(prev => ({
      ...prev,
      goals: prev.goals.filter((_, i) => i !== index)
    }));
  };

  const handleAddMedication = () => {
    if (currentMedication.medicationName.trim() && currentMedication.dosage.trim()) {
      setMedications(prev => [...prev, currentMedication]);
      setCurrentMedication({
        medicationName: "",
        dosage: "",
        frequency: "",
        instructions: "",
        startDate: new Date().toISOString().split('T')[0],
        endDate: "",
      });
    }
  };

  const handleRemoveMedication = (index: number) => {
    setMedications(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!treatmentForm.title.trim() || !treatmentForm.diagnosis.trim() || !treatmentForm.plan.trim()) {
      toast.error("Please fill in all required treatment fields");
      return;
    }

    setLoading(true);
    try {
      // Create treatment plan
      const treatmentPlanId = await createTreatmentPlan({
        doctorPatientId,
        soapNoteId: selectedSoapNoteId && selectedSoapNoteId !== "none" ? selectedSoapNoteId as any : undefined,
        title: treatmentForm.title,
        diagnosis: treatmentForm.diagnosis,
        plan: treatmentForm.plan,
        goals: treatmentForm.goals,
        status: treatmentForm.status,
        startDate: treatmentForm.startDate,
        endDate: treatmentForm.endDate || undefined,
      });

      // Create medications if any
      for (const medication of medications) {
        await createMedication({
          treatmentPlanId,
          medicationName: medication.medicationName,
          dosage: medication.dosage,
          frequency: medication.frequency,
          instructions: medication.instructions,
          status: "active",
          startDate: medication.startDate,
          endDate: medication.endDate || undefined,
        });
      }

      // Store the treatment plan ID for potential prescription creation
      setCreatedTreatmentPlanId(treatmentPlanId);

      toast.success("Treatment plan created successfully");
      onSuccess();
    } catch (error) {
      console.error("Error creating treatment plan:", error);
      toast.error("Failed to create treatment plan");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* SOAP Notes Selection */}
      {sharedSoapNotes && sharedSoapNotes.length > 0 && (
        <div className="space-y-2">
          <Label className="text-sm flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Based on SOAP Note (Optional)
          </Label>
          <Select value={selectedSoapNoteId} onValueChange={setSelectedSoapNoteId}>
            <SelectTrigger className="h-10 text-sm rounded-lg">
              <SelectValue placeholder="Select a SOAP note (optional)" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">No SOAP note</SelectItem>
              {sharedSoapNotes.map((shared) => (
                shared.soapNote?._id && (
                  <SelectItem key={shared._id} value={shared.soapNote._id}>
                    {`${new Date(shared.soapNote.createdAt).toLocaleDateString()} - ${shared.soapNote.subjective?.substring(0, 50)}...`}
                  </SelectItem>
                )
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Left Column - Treatment Details */}
        <div className="space-y-3">
          <div className="space-y-1">
            <Label htmlFor="title" className="text-xs">Treatment Title *</Label>
            <Input
              id="title"
              placeholder="e.g., Hypertension Management"
              value={treatmentForm.title}
              onChange={(e) => setTreatmentForm(prev => ({ ...prev, title: e.target.value }))}
              className="h-8 text-sm"
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor="diagnosis" className="text-xs">Diagnosis *</Label>
            <Input
              id="diagnosis"
              placeholder="Primary diagnosis"
              value={treatmentForm.diagnosis}
              onChange={(e) => setTreatmentForm(prev => ({ ...prev, diagnosis: e.target.value }))}
              className="h-8 text-sm"
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor="plan" className="text-xs">Treatment Plan *</Label>
            <Textarea
              id="plan"
              placeholder="Detailed treatment plan..."
              rows={3}
              value={treatmentForm.plan}
              onChange={(e) => setTreatmentForm(prev => ({ ...prev, plan: e.target.value }))}
              className="text-sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <Label htmlFor="status" className="text-xs">Status</Label>
              <Select
                value={treatmentForm.status}
                onValueChange={(value: "active" | "completed" | "discontinued") =>
                  setTreatmentForm(prev => ({ ...prev, status: value }))
                }
              >
                <SelectTrigger className="h-8 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="discontinued">Discontinued</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label htmlFor="startDate" className="text-xs">Start Date</Label>
              <Input
                id="startDate"
                type="date"
                value={treatmentForm.startDate}
                onChange={(e) => setTreatmentForm(prev => ({ ...prev, startDate: e.target.value }))}
                className="h-8 text-sm"
              />
            </div>
          </div>

          <div className="space-y-1">
            <Label htmlFor="endDate" className="text-xs">End Date (Optional)</Label>
            <Input
              id="endDate"
              type="date"
              value={treatmentForm.endDate}
              onChange={(e) => setTreatmentForm(prev => ({ ...prev, endDate: e.target.value }))}
              className="h-8 text-sm"
            />
          </div>

          {/* Goals Section */}
          <div className="space-y-2">
            <Label className="text-xs flex items-center gap-1">
              <Target className="h-3 w-3" />
              Treatment Goals
            </Label>

            <div className="flex gap-2">
              <Input
                placeholder="Add a goal..."
                value={currentGoal}
                onChange={(e) => setCurrentGoal(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddGoal()}
                className="h-8 text-sm"
              />
              <Button type="button" onClick={handleAddGoal} size="sm" className="h-8">
                <Plus className="h-3 w-3" />
              </Button>
            </div>

            {treatmentForm.goals.length > 0 && (
              <div className="space-y-1">
                {treatmentForm.goals.map((goal, index) => (
                  <div key={index} className="flex items-center gap-2 p-2 bg-muted rounded text-sm">
                    <Target className="h-3 w-3 text-muted-foreground" />
                    <span className="flex-1">{goal}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveGoal(index)}
                      className="h-6 w-6 p-0"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column - Medications */}
        <div className="space-y-3">
          <div className="border rounded-xl p-4">
            <div className="flex items-center gap-2 mb-4">
              <Pill className="h-4 w-4" />
              <span className="font-medium">Add Medication</span>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <Label htmlFor="medicationName" className="text-xs">Medication Name</Label>
                  <Input
                    id="medicationName"
                    placeholder="e.g., Lisinopril"
                    value={currentMedication.medicationName}
                    onChange={(e) => setCurrentMedication(prev => ({ ...prev, medicationName: e.target.value }))}
                    className="h-8 text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="dosage" className="text-xs">Dosage</Label>
                  <Input
                    id="dosage"
                    placeholder="e.g., 10mg"
                    value={currentMedication.dosage}
                    onChange={(e) => setCurrentMedication(prev => ({ ...prev, dosage: e.target.value }))}
                    className="h-8 text-sm"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <Label htmlFor="frequency" className="text-xs">Frequency</Label>
                <Select
                  value={currentMedication.frequency}
                  onValueChange={(value) => setCurrentMedication(prev => ({ ...prev, frequency: value }))}
                >
                  <SelectTrigger className="h-8 text-sm">
                    <SelectValue placeholder="Select frequency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Once daily">Once daily</SelectItem>
                    <SelectItem value="Twice daily">Twice daily</SelectItem>
                    <SelectItem value="Three times daily">Three times daily</SelectItem>
                    <SelectItem value="As needed">As needed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <Label htmlFor="instructions" className="text-xs">Instructions</Label>
                <Textarea
                  id="instructions"
                  placeholder="Special instructions..."
                  rows={2}
                  value={currentMedication.instructions}
                  onChange={(e) => setCurrentMedication(prev => ({ ...prev, instructions: e.target.value }))}
                  className="text-sm"
                />
              </div>

              <Button type="button" onClick={handleAddMedication} className="w-full h-8" size="sm">
                <Plus className="h-3 w-3 mr-1" />
                Add Medication
              </Button>
            </div>
          </div>

          {/* Added Medications List */}
          {medications.length > 0 && (
            <div className="space-y-3">
              <Label className="text-sm">Added Medications ({medications.length})</Label>
              <div className="space-y-2">
                {medications.map((medication, index) => (
                  <div key={index} className="border rounded-lg p-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium text-sm">{medication.medicationName}</h4>
                        <p className="text-xs text-muted-foreground">
                          {medication.dosage} • {medication.frequency}
                        </p>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveMedication(index)}
                        className="h-8 w-8 p-0 rounded-lg"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* E-Prescribing Section */}
          {createdTreatmentPlanId && (
            <div className="border rounded-xl p-4 bg-blue-50 dark:bg-blue-950/20">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Pill className="h-4 w-4 text-blue-600" />
                  <span className="font-medium text-blue-900 dark:text-blue-100">E-Prescribing</span>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowPrescriptionForm(!showPrescriptionForm)}
                  className="h-8"
                >
                  {showPrescriptionForm ? "Hide" : "Add Prescription"}
                </Button>
              </div>

              {showPrescriptionForm && (
                <div className="mt-4">
                  {doctorPatientRelation?.patientId && (
                    <PrescriptionForm
                      patientId={doctorPatientRelation.patientId}
                      treatmentPlanId={createdTreatmentPlanId}
                      onSuccess={(prescriptionId) => {
                        toast.success("Prescription created successfully!");
                        setShowPrescriptionForm(false);
                      }}
                      onCancel={() => setShowPrescriptionForm(false)}
                    />
                  )}
                </div>
              )}

              {!showPrescriptionForm && (
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  Create electronic prescriptions for this treatment plan
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end gap-3 pt-4 border-t">
        <Button variant="outline" onClick={onCancel} size="sm" className="rounded-lg">
          Cancel
        </Button>
        <Button onClick={handleSubmit} disabled={loading} size="sm" className="rounded-lg">
          {loading ? "Creating..." : "Create Treatment"}
        </Button>
      </div>
    </div>
  );
}
