"use client";

import React, { useState } from "react";
import { useMutation } from "convex/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Pill, Calendar, Clock, AlertCircle } from "lucide-react";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";
import { Id } from "@/convex/_generated/dataModel";

interface AddMedicationFormProps {
  treatmentPlanId?: Id<"treatmentPlans">;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function AddMedicationForm({
  treatmentPlanId,
  onSuccess,
  onCancel
}: AddMedicationFormProps) {
  const [medicationName, setMedicationName] = useState("");
  const [dosage, setDosage] = useState("");
  const [frequency, setFrequency] = useState("");
  const [duration, setDuration] = useState("");
  const [instructions, setInstructions] = useState("");
  const [route, setRoute] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const createMedication = useMutation(api.medications.create);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!medicationName.trim() || !dosage.trim() || !frequency.trim() || !duration.trim()) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsSubmitting(true);
    try {
      await createMedication({
        treatmentPlanId: treatmentPlanId as any,
        medicationName: medicationName.trim(),
        dosage: dosage.trim(),
        frequency: frequency.trim(),
        duration: duration.trim(),
        instructions: instructions.trim() || undefined,
        route: route || "oral",
        startDate: Date.now(),
        status: "active"
      });

      toast.success("Current medication added successfully!");
      
      // Reset form
      setMedicationName("");
      setDosage("");
      setFrequency("");
      setDuration("");
      setInstructions("");
      setRoute("");
      
      onSuccess?.();
    } catch (error) {
      console.error("Error adding medication:", error);
      toast.error("Failed to add medication. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="relative">
          <div className="absolute inset-0 bg-primary/20 rounded-lg blur-sm"></div>
          <div className="relative p-2 bg-primary/10 rounded-lg border border-primary/20">
            <Pill className="h-5 w-5 text-primary" />
          </div>
        </div>
        <div>
          <h3 className="text-lg font-semibold">Add Current Medication</h3>
          <p className="text-sm text-muted-foreground">
            Add a medication that the patient is currently taking
          </p>
        </div>
      </div>

      {/* Form Fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Medication Name */}
        <div className="space-y-2">
          <Label htmlFor="medicationName">
            Medication Name <span className="text-red-500">*</span>
          </Label>
          <Input
            id="medicationName"
            value={medicationName}
            onChange={(e) => setMedicationName(e.target.value)}
            placeholder="e.g., Amoxicillin, Ibuprofen"
            required
          />
        </div>

        {/* Dosage */}
        <div className="space-y-2">
          <Label htmlFor="dosage">
            Dosage <span className="text-red-500">*</span>
          </Label>
          <Input
            id="dosage"
            value={dosage}
            onChange={(e) => setDosage(e.target.value)}
            placeholder="e.g., 500mg, 10ml"
            required
          />
        </div>

        {/* Frequency */}
        <div className="space-y-2">
          <Label htmlFor="frequency">
            Frequency <span className="text-red-500">*</span>
          </Label>
          <Select value={frequency} onValueChange={setFrequency}>
            <SelectTrigger>
              <SelectValue placeholder="Select frequency" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="once_daily">Once daily</SelectItem>
              <SelectItem value="twice_daily">Twice daily</SelectItem>
              <SelectItem value="three_times_daily">Three times daily</SelectItem>
              <SelectItem value="four_times_daily">Four times daily</SelectItem>
              <SelectItem value="every_6_hours">Every 6 hours</SelectItem>
              <SelectItem value="every_8_hours">Every 8 hours</SelectItem>
              <SelectItem value="every_12_hours">Every 12 hours</SelectItem>
              <SelectItem value="as_needed">As needed</SelectItem>
              <SelectItem value="weekly">Weekly</SelectItem>
              <SelectItem value="monthly">Monthly</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Duration */}
        <div className="space-y-2">
          <Label htmlFor="duration">
            Duration <span className="text-red-500">*</span>
          </Label>
          <Input
            id="duration"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            placeholder="e.g., 7 days, 2 weeks, 1 month"
            required
          />
        </div>

        {/* Route */}
        <div className="space-y-2">
          <Label htmlFor="route">Route of Administration</Label>
          <Select value={route} onValueChange={setRoute}>
            <SelectTrigger>
              <SelectValue placeholder="Select route" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="oral">Oral</SelectItem>
              <SelectItem value="topical">Topical</SelectItem>
              <SelectItem value="injection">Injection</SelectItem>
              <SelectItem value="intravenous">Intravenous</SelectItem>
              <SelectItem value="intramuscular">Intramuscular</SelectItem>
              <SelectItem value="subcutaneous">Subcutaneous</SelectItem>
              <SelectItem value="inhalation">Inhalation</SelectItem>
              <SelectItem value="rectal">Rectal</SelectItem>
              <SelectItem value="nasal">Nasal</SelectItem>
              <SelectItem value="eye_drops">Eye drops</SelectItem>
              <SelectItem value="ear_drops">Ear drops</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Instructions */}
      <div className="space-y-2">
        <Label htmlFor="instructions">Special Instructions</Label>
        <Textarea
          id="instructions"
          value={instructions}
          onChange={(e) => setInstructions(e.target.value)}
          placeholder="e.g., Take with food, Avoid alcohol, Take on empty stomach..."
          rows={3}
        />
      </div>

      {/* Info Card */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
            <div className="space-y-1">
              <p className="text-sm font-medium text-blue-900">
                Medication Safety Guidelines
              </p>
              <p className="text-xs text-blue-700">
                Always verify dosage, check for drug interactions, and ensure patient allergies are documented before prescribing.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex items-center gap-3 pt-4">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Adding..." : "Add Current Medication"}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
