"use client";

import React from "react";
import { useQuery } from "convex/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { 
  Pill, 
  Calendar, 
  MapPin, 
  Phone,
  AlertTriangle,
  CheckCircle,
  Clock,
  XCircle,
  Send
} from "lucide-react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { toast } from "sonner";

interface PrescriptionListProps {
  patientId: Id<"patients">;
}

export function PrescriptionList({ patientId }: PrescriptionListProps) {
  const prescriptions = useQuery(api.prescriptions.getByPatientId, { patientId });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case "sent":
        return <Send className="h-4 w-4 text-blue-500" />;
      case "received":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "filled":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "cancelled":
        return <XCircle className="h-4 w-4 text-red-500" />;
      case "error":
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "default";
      case "sent":
        return "default";
      case "received":
        return "default";
      case "filled":
        return "default";
      case "cancelled":
        return "destructive";
      case "error":
        return "destructive";
      default:
        return "secondary";
    }
  };

  const handleSendPrescription = async (prescriptionId: string) => {
    try {
      const response = await fetch("/api/prescriptions/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prescriptionId }),
      });

      const result = await response.json();

      if (result.success) {
        toast.success("Prescription sent successfully!");
      } else {
        toast.error(result.message || "Failed to send prescription");
      }
    } catch (error) {
      console.error("Send prescription error:", error);
      toast.error("Failed to send prescription");
    }
  };

  if (!prescriptions) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (prescriptions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Pill className="h-5 w-5" />
            Prescriptions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Pill className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No prescriptions found for this patient.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Pill className="h-5 w-5" />
          Prescriptions ({prescriptions.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {prescriptions.map((prescription, index) => (
          <div key={prescription._id}>
            <div className="space-y-3">
              {/* Prescription Header */}
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium">{prescription.medication.name}</h4>
                    <Badge variant={getStatusColor(prescription.status) as any}>
                      <div className="flex items-center gap-1">
                        {getStatusIcon(prescription.status)}
                        {prescription.status.charAt(0).toUpperCase() + prescription.status.slice(1)}
                      </div>
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {prescription.medication.strength} {prescription.medication.dosageForm}
                    {prescription.medication.genericName && (
                      <span> • Generic: {prescription.medication.genericName}</span>
                    )}
                  </p>
                </div>
                
                {prescription.status === "pending" && (
                  <Button
                    size="sm"
                    onClick={() => handleSendPrescription(prescription._id)}
                    className="h-8"
                  >
                    <Send className="h-3 w-3 mr-1" />
                    Send
                  </Button>
                )}
              </div>

              {/* Dosage Information */}
              <div className="bg-muted/50 rounded-lg p-3 space-y-2">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
                  <div>
                    <span className="font-medium">Quantity:</span> {prescription.dosage.quantity}
                  </div>
                  <div>
                    <span className="font-medium">Frequency:</span> {prescription.dosage.frequency}
                  </div>
                  <div>
                    <span className="font-medium">Refills:</span> {prescription.dosage.refills}
                  </div>
                </div>
                
                {prescription.dosage.duration && (
                  <div className="text-sm">
                    <span className="font-medium">Duration:</span> {prescription.dosage.duration}
                  </div>
                )}
                
                <div className="text-sm">
                  <span className="font-medium">Instructions:</span> {prescription.dosage.instructions}
                </div>
              </div>

              {/* Pharmacy Information */}
              {prescription.pharmacy && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  <span>{prescription.pharmacy.name}</span>
                  <span>•</span>
                  <Phone className="h-4 w-4" />
                  <span>{prescription.pharmacy.phone}</span>
                </div>
              )}

              {/* Safety Checks */}
              {prescription.safetyChecks && (
                <div className="space-y-2">
                  {prescription.safetyChecks.drugInteractions.length > 0 && (
                    <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-2">
                        <AlertTriangle className="h-4 w-4 text-orange-600" />
                        <span className="font-medium text-orange-800">Drug Interactions</span>
                      </div>
                      {prescription.safetyChecks.drugInteractions.map((interaction, idx) => (
                        <div key={idx} className="text-sm text-orange-700">
                          <Badge variant="outline" className="mr-2">
                            {interaction.severity.toUpperCase()}
                          </Badge>
                          {interaction.description}
                        </div>
                      ))}
                    </div>
                  )}

                  {prescription.safetyChecks.allergyAlerts.length > 0 && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-2">
                        <AlertTriangle className="h-4 w-4 text-red-600" />
                        <span className="font-medium text-red-800">Allergy Alerts</span>
                      </div>
                      {prescription.safetyChecks.allergyAlerts.map((alert, idx) => (
                        <div key={idx} className="text-sm text-red-700">
                          <Badge variant="destructive" className="mr-2">
                            {alert.severity}
                          </Badge>
                          Allergic to {alert.allergen}: {alert.reaction}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Prescription Details */}
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  <span>Prescribed: {new Date(prescription.prescriptionDate).toLocaleDateString()}</span>
                </div>
                
                {prescription.doctor && (
                  <div>
                    <span>Dr. {prescription.doctor.firstName} {prescription.doctor.lastName}</span>
                  </div>
                )}
                
                <div>
                  <span className="capitalize">{prescription.priority} Priority</span>
                </div>
              </div>

              {/* Notes */}
              {prescription.notes && (
                <div className="text-sm">
                  <span className="font-medium">Notes:</span> {prescription.notes}
                </div>
              )}

              {/* Error Message */}
              {prescription.errorMessage && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-red-600" />
                    <span className="font-medium text-red-800">Error</span>
                  </div>
                  <p className="text-sm text-red-700 mt-1">{prescription.errorMessage}</p>
                </div>
              )}
            </div>
            
            {index < prescriptions.length - 1 && <Separator className="mt-4" />}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
