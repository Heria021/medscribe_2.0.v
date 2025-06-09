"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  Activity,
  Pill,
  Target,
  Calendar,
  Trash2
} from "lucide-react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { toast } from "sonner";

interface Medication {
  medicationName: string;
  dosage: string;
  frequency: string;
  instructions: string;
  startDate: string;
  endDate?: string;
}

interface AddTreatmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  doctorPatientId: Id<"doctorPatients">;
  soapNoteId?: Id<"soapNotes"> | null;
  onSuccess: () => void;
}

export function AddTreatmentDialog({
  open,
  onOpenChange,
  doctorPatientId,
  soapNoteId,
  onSuccess,
}: AddTreatmentDialogProps) {
  const [loading, setLoading] = useState(false);
  const [currentGoal, setCurrentGoal] = useState("");
  
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
        soapNoteId: soapNoteId || undefined,
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

      toast.success("Treatment plan created successfully");
      
      // Reset form
      setTreatmentForm({
        title: "",
        diagnosis: "",
        plan: "",
        goals: [],
        status: "active",
        startDate: new Date().toISOString().split('T')[0],
        endDate: "",
      });
      setMedications([]);
      setCurrentGoal("");
      
      onSuccess();
    } catch (error) {
      console.error("Error creating treatment plan:", error);
      toast.error("Failed to create treatment plan");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Add Treatment Plan
            {soapNoteId && <Badge variant="outline">Based on SOAP Note</Badge>}
          </DialogTitle>
          <DialogDescription>
            Create a comprehensive treatment plan with medications for the patient.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="treatment" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="treatment">Treatment Details</TabsTrigger>
            <TabsTrigger value="medications">Medications</TabsTrigger>
          </TabsList>

          <TabsContent value="treatment" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Treatment Title *</Label>
                <Input
                  id="title"
                  placeholder="e.g., Hypertension Management"
                  value={treatmentForm.title}
                  onChange={(e) => setTreatmentForm(prev => ({ ...prev, title: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={treatmentForm.status}
                  onValueChange={(value: "active" | "completed" | "discontinued") =>
                    setTreatmentForm(prev => ({ ...prev, status: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="discontinued">Discontinued</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="diagnosis">Diagnosis *</Label>
              <Input
                id="diagnosis"
                placeholder="Primary diagnosis for this treatment"
                value={treatmentForm.diagnosis}
                onChange={(e) => setTreatmentForm(prev => ({ ...prev, diagnosis: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="plan">Treatment Plan *</Label>
              <Textarea
                id="plan"
                placeholder="Detailed treatment plan and approach..."
                rows={4}
                value={treatmentForm.plan}
                onChange={(e) => setTreatmentForm(prev => ({ ...prev, plan: e.target.value }))}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startDate">Start Date</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={treatmentForm.startDate}
                  onChange={(e) => setTreatmentForm(prev => ({ ...prev, startDate: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="endDate">End Date (Optional)</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={treatmentForm.endDate}
                  onChange={(e) => setTreatmentForm(prev => ({ ...prev, endDate: e.target.value }))}
                />
              </div>
            </div>

            {/* Goals Section */}
            <div className="space-y-4">
              <Label className="flex items-center gap-2">
                <Target className="h-4 w-4" />
                Treatment Goals
              </Label>
              
              <div className="flex gap-2">
                <Input
                  placeholder="Add a treatment goal..."
                  value={currentGoal}
                  onChange={(e) => setCurrentGoal(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddGoal()}
                />
                <Button type="button" onClick={handleAddGoal} size="sm">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              {treatmentForm.goals.length > 0 && (
                <div className="space-y-2">
                  {treatmentForm.goals.map((goal, index) => (
                    <div key={index} className="flex items-center gap-2 p-2 bg-muted rounded-md">
                      <Target className="h-4 w-4 text-muted-foreground" />
                      <span className="flex-1 text-sm">{goal}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveGoal(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="medications" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Pill className="h-5 w-5" />
                  Add Medication
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="medicationName">Medication Name</Label>
                    <Input
                      id="medicationName"
                      placeholder="e.g., Lisinopril"
                      value={currentMedication.medicationName}
                      onChange={(e) => setCurrentMedication(prev => ({ ...prev, medicationName: e.target.value }))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="dosage">Dosage</Label>
                    <Input
                      id="dosage"
                      placeholder="e.g., 10mg"
                      value={currentMedication.dosage}
                      onChange={(e) => setCurrentMedication(prev => ({ ...prev, dosage: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="frequency">Frequency</Label>
                    <Select
                      value={currentMedication.frequency}
                      onValueChange={(value) => setCurrentMedication(prev => ({ ...prev, frequency: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select frequency" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Once daily">Once daily</SelectItem>
                        <SelectItem value="Twice daily">Twice daily</SelectItem>
                        <SelectItem value="Three times daily">Three times daily</SelectItem>
                        <SelectItem value="Four times daily">Four times daily</SelectItem>
                        <SelectItem value="As needed">As needed</SelectItem>
                        <SelectItem value="Weekly">Weekly</SelectItem>
                        <SelectItem value="Monthly">Monthly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="medStartDate">Start Date</Label>
                    <Input
                      id="medStartDate"
                      type="date"
                      value={currentMedication.startDate}
                      onChange={(e) => setCurrentMedication(prev => ({ ...prev, startDate: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="instructions">Instructions</Label>
                  <Textarea
                    id="instructions"
                    placeholder="Special instructions for taking this medication..."
                    rows={2}
                    value={currentMedication.instructions}
                    onChange={(e) => setCurrentMedication(prev => ({ ...prev, instructions: e.target.value }))}
                  />
                </div>

                <Button type="button" onClick={handleAddMedication} className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Medication
                </Button>
              </CardContent>
            </Card>

            {/* Added Medications List */}
            {medications.length > 0 && (
              <div className="space-y-2">
                <Label>Added Medications ({medications.length})</Label>
                {medications.map((medication, index) => (
                  <Card key={index}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-semibold">{medication.medicationName}</h4>
                          <p className="text-sm text-muted-foreground">
                            {medication.dosage} • {medication.frequency}
                          </p>
                          {medication.instructions && (
                            <p className="text-sm text-muted-foreground mt-1">
                              {medication.instructions}
                            </p>
                          )}
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveMedication(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? "Creating..." : "Create Treatment Plan"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
