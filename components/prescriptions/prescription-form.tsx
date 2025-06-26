"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { 
  Pill, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  MapPin,
  Phone,
  Send,
  Save,
  AlertCircle
} from "lucide-react";
import { toast } from "sonner";

interface Medication {
  name: string;
  genericName?: string;
  strength: string;
  dosageForm: string;
  ndc?: string;
  rxcui?: string;
}

interface Dosage {
  quantity: string;
  frequency: string;
  duration?: string;
  instructions: string;
  refills: number;
}

interface Pharmacy {
  ncpdpId: string;
  name: string;
  address: string;
  phone: string;
}

interface SafetyCheck {
  drugInteractions: Array<{
    severity: "minor" | "moderate" | "major";
    description: string;
    interactingMedication: string;
  }>;
  allergyAlerts: Array<{
    allergen: string;
    severity: string;
    reaction: string;
  }>;
  contraindications: string[];
  dosageAlerts: string[];
}

interface PrescriptionFormProps {
  patientId: string;
  appointmentId?: string;
  treatmentPlanId?: string;
  onSuccess?: (prescriptionId: string) => void;
  onCancel?: () => void;
}

export function PrescriptionForm({
  patientId,
  appointmentId,
  treatmentPlanId,
  onSuccess,
  onCancel,
}: PrescriptionFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [pharmacies, setPharmacies] = useState<Pharmacy[]>([]);
  const [safetyChecks, setSafetyChecks] = useState<SafetyCheck | null>(null);
  const [showSafetyWarnings, setShowSafetyWarnings] = useState(false);

  // Form state
  const [medication, setMedication] = useState<Medication>({
    name: "",
    genericName: "",
    strength: "",
    dosageForm: "tablet",
    ndc: "",
    rxcui: "",
  });

  const [dosage, setDosage] = useState<Dosage>({
    quantity: "",
    frequency: "",
    duration: "",
    instructions: "",
    refills: 0,
  });

  const [selectedPharmacy, setSelectedPharmacy] = useState<Pharmacy | null>(null);
  const [deliveryMethod, setDeliveryMethod] = useState<"electronic" | "print" | "fax" | "phone">("electronic");
  const [priority, setPriority] = useState<"routine" | "urgent" | "stat">("routine");
  const [notes, setNotes] = useState("");

  // Load pharmacies on component mount
  useEffect(() => {
    loadPharmacies();
  }, []);

  const loadPharmacies = async () => {
    try {
      const response = await fetch("/api/pharmacies/search?limit=50");
      const result = await response.json();
      
      if (result.success) {
        setPharmacies(result.data);
      }
    } catch (error) {
      console.error("Failed to load pharmacies:", error);
      toast.error("Failed to load pharmacy directory");
    }
  };

  const checkDrugInteractions = async () => {
    if (!medication.name) return;

    try {
      const response = await fetch("/api/drug-interactions/check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patientId,
          newMedication: medication.name,
        }),
      });

      const result = await response.json();
      
      if (result.success) {
        const checks: SafetyCheck = {
          drugInteractions: result.data.interactions || [],
          allergyAlerts: [], // Will be populated by backend
          contraindications: [],
          dosageAlerts: [],
        };
        
        setSafetyChecks(checks);
        
        if (checks.drugInteractions.length > 0) {
          setShowSafetyWarnings(true);
        }
      }
    } catch (error) {
      console.error("Failed to check drug interactions:", error);
    }
  };

  // Check interactions when medication name changes
  useEffect(() => {
    if (medication.name.length > 2) {
      const timeoutId = setTimeout(checkDrugInteractions, 500);
      return () => clearTimeout(timeoutId);
    }
  }, [medication.name, patientId]);

  const handleSubmit = async (sendElectronically: boolean = true) => {
    if (!medication.name || !dosage.quantity || !dosage.frequency || !dosage.instructions) {
      toast.error("Please fill in all required medication and dosage fields");
      return;
    }

    if (sendElectronically && !selectedPharmacy) {
      toast.error("Please select a pharmacy for electronic prescribing");
      return;
    }

    setIsLoading(true);

    try {
      const prescriptionData = {
        patientId,
        appointmentId,
        treatmentPlanId,
        medication,
        dosage,
        pharmacy: selectedPharmacy,
        deliveryMethod: sendElectronically ? "electronic" : deliveryMethod,
        priority,
        notes,
      };

      const response = await fetch("/api/prescriptions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(prescriptionData),
      });

      const result = await response.json();

      if (result.success) {
        toast.success(
          sendElectronically 
            ? "Prescription sent electronically!" 
            : "Prescription saved successfully!"
        );
        
        if (onSuccess) {
          onSuccess(result.data.prescriptionId);
        }
      } else {
        toast.error(result.message || "Failed to create prescription");
      }
    } catch (error) {
      console.error("Prescription submission error:", error);
      toast.error("Failed to submit prescription");
    } finally {
      setIsLoading(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "major": return "destructive";
      case "moderate": return "default";
      case "minor": return "secondary";
      default: return "default";
    }
  };

  return (
    <div className="space-y-6">
      {/* Safety Warnings */}
      {showSafetyWarnings && safetyChecks && (
        <Alert className="border-orange-200 bg-orange-50">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <div className="space-y-2">
              <p className="font-medium">Safety Alerts Detected</p>
              {safetyChecks.drugInteractions.map((interaction, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Badge variant={getSeverityColor(interaction.severity) as any}>
                    {interaction.severity.toUpperCase()}
                  </Badge>
                  <span className="text-sm">{interaction.description}</span>
                </div>
              ))}
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Medication Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Pill className="h-5 w-5" />
            Medication Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="medicationName">Medication Name *</Label>
              <Input
                id="medicationName"
                value={medication.name}
                onChange={(e) => setMedication(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g., Amoxicillin"
              />
            </div>
            <div>
              <Label htmlFor="genericName">Generic Name</Label>
              <Input
                id="genericName"
                value={medication.genericName}
                onChange={(e) => setMedication(prev => ({ ...prev, genericName: e.target.value }))}
                placeholder="e.g., Amoxicillin"
              />
            </div>
            <div>
              <Label htmlFor="strength">Strength *</Label>
              <Input
                id="strength"
                value={medication.strength}
                onChange={(e) => setMedication(prev => ({ ...prev, strength: e.target.value }))}
                placeholder="e.g., 500mg"
              />
            </div>
            <div>
              <Label htmlFor="dosageForm">Dosage Form</Label>
              <Select
                value={medication.dosageForm}
                onValueChange={(value) => setMedication(prev => ({ ...prev, dosageForm: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="tablet">Tablet</SelectItem>
                  <SelectItem value="capsule">Capsule</SelectItem>
                  <SelectItem value="liquid">Liquid</SelectItem>
                  <SelectItem value="injection">Injection</SelectItem>
                  <SelectItem value="cream">Cream</SelectItem>
                  <SelectItem value="ointment">Ointment</SelectItem>
                  <SelectItem value="inhaler">Inhaler</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Dosage Instructions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Dosage Instructions
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="quantity">Quantity *</Label>
              <Input
                id="quantity"
                value={dosage.quantity}
                onChange={(e) => setDosage(prev => ({ ...prev, quantity: e.target.value }))}
                placeholder="e.g., 30 tablets"
              />
            </div>
            <div>
              <Label htmlFor="frequency">Frequency *</Label>
              <Input
                id="frequency"
                value={dosage.frequency}
                onChange={(e) => setDosage(prev => ({ ...prev, frequency: e.target.value }))}
                placeholder="e.g., Twice daily"
              />
            </div>
            <div>
              <Label htmlFor="refills">Refills</Label>
              <Select
                value={dosage.refills.toString()}
                onValueChange={(value) => setDosage(prev => ({ ...prev, refills: parseInt(value) }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[0, 1, 2, 3, 4, 5].map(num => (
                    <SelectItem key={num} value={num.toString()}>{num}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <Label htmlFor="instructions">Instructions *</Label>
            <Textarea
              id="instructions"
              value={dosage.instructions}
              onChange={(e) => setDosage(prev => ({ ...prev, instructions: e.target.value }))}
              placeholder="e.g., Take one tablet by mouth twice daily with food"
              rows={3}
            />
          </div>
          <div>
            <Label htmlFor="duration">Duration</Label>
            <Input
              id="duration"
              value={dosage.duration}
              onChange={(e) => setDosage(prev => ({ ...prev, duration: e.target.value }))}
              placeholder="e.g., 10 days"
            />
          </div>
        </CardContent>
      </Card>

      {/* Pharmacy Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Pharmacy Selection
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Select Pharmacy</Label>
            <Select
              value={selectedPharmacy?.ncpdpId || ""}
              onValueChange={(value) => {
                const pharmacy = pharmacies.find(p => p.ncpdpId === value);
                setSelectedPharmacy(pharmacy || null);
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Choose a pharmacy" />
              </SelectTrigger>
              <SelectContent>
                {pharmacies.map((pharmacy) => (
                  <SelectItem key={pharmacy.ncpdpId} value={pharmacy.ncpdpId}>
                    <div className="flex flex-col">
                      <span className="font-medium">{pharmacy.name}</span>
                      <span className="text-sm text-muted-foreground">
                        {typeof pharmacy.address === 'string'
                          ? pharmacy.address
                          : `${pharmacy.address.street}, ${pharmacy.address.city}, ${pharmacy.address.state} ${pharmacy.address.zipCode}`
                        }
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {selectedPharmacy && (
            <div className="p-3 bg-muted rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <MapPin className="h-4 w-4" />
                <span className="font-medium">{selectedPharmacy.name}</span>
              </div>
              <p className="text-sm text-muted-foreground mb-1">
                {typeof selectedPharmacy.address === 'string'
                  ? selectedPharmacy.address
                  : `${selectedPharmacy.address.street}, ${selectedPharmacy.address.city}, ${selectedPharmacy.address.state} ${selectedPharmacy.address.zipCode}`
                }
              </p>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                <span className="text-sm">{selectedPharmacy.phone}</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Additional Options */}
      <Card>
        <CardContent className="pt-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Priority</Label>
              <Select value={priority} onValueChange={(value: any) => setPriority(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="routine">Routine</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                  <SelectItem value="stat">STAT</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Delivery Method</Label>
              <Select value={deliveryMethod} onValueChange={(value: any) => setDeliveryMethod(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="electronic">Electronic</SelectItem>
                  <SelectItem value="print">Print</SelectItem>
                  <SelectItem value="fax">Fax</SelectItem>
                  <SelectItem value="phone">Phone</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div>
            <Label htmlFor="notes">Additional Notes</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any additional notes for the pharmacist..."
              rows={2}
            />
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <Button
          onClick={() => handleSubmit(true)}
          disabled={isLoading}
          className="flex-1"
        >
          <Send className="h-4 w-4 mr-2" />
          {isLoading ? "Sending..." : "Send Electronically"}
        </Button>
        
        <Button
          variant="outline"
          onClick={() => handleSubmit(false)}
          disabled={isLoading}
        >
          <Save className="h-4 w-4 mr-2" />
          Save as Draft
        </Button>
        
        {onCancel && (
          <Button variant="ghost" onClick={onCancel}>
            Cancel
          </Button>
        )}
      </div>
    </div>
  );
}
