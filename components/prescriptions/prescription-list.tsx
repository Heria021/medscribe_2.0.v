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
        return <Clock className="h-4 w-4 text-muted-foreground" />;
      case "sent":
        return <Send className="h-4 w-4 text-primary" />;
      case "received":
        return <CheckCircle className="h-4 w-4 text-primary" />;
      case "filled":
        return <CheckCircle className="h-4 w-4 text-primary" />;
      case "cancelled":
        return <XCircle className="h-4 w-4 text-destructive" />;
      case "error":
        return <AlertTriangle className="h-4 w-4 text-destructive" />;
      default:
        return <Clock className="h-4 w-4 text-muted-foreground" />;
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
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (prescriptions.length === 0) {
    return (
      <div className="text-center py-6 bg-muted/30 rounded-lg border border-dashed border-border">
        <div className="w-10 md:w-12 h-10 md:h-12 rounded-full bg-muted flex items-center justify-center mx-auto mb-2 md:mb-3">
          <Pill className="h-5 md:h-6 w-5 md:w-6 text-muted-foreground" />
        </div>
        <h3 className="font-medium mb-1 text-foreground text-sm md:text-base">No E-Prescriptions</h3>
        <p className="text-xs md:text-sm text-muted-foreground">
          No electronic prescriptions have been created yet
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2 md:space-y-3">
      {prescriptions.map((prescription, index) => (
        <div key={prescription._id} className="p-3 md:p-4 bg-background rounded-lg border border-border hover:shadow-sm transition-shadow">
          {/* Prescription Header */}
          <div className="flex items-start justify-between mb-2 gap-2">
            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-xs md:text-sm text-foreground mb-1 truncate">{prescription.medication.name}</h4>
              <div className="flex items-center gap-1 text-xs text-muted-foreground flex-wrap">
                <span className="bg-muted/50 px-1.5 md:px-2 py-0.5 rounded text-xs">{prescription.medication.strength}</span>
                <span className="hidden sm:inline">•</span>
                <span className="bg-muted/50 px-1.5 md:px-2 py-0.5 rounded text-xs">{prescription.medication.dosageForm}</span>
              </div>
            </div>
            <Badge variant={getStatusColor(prescription.status) as any} className="text-xs capitalize flex-shrink-0">
              <div className="flex items-center gap-1">
                {getStatusIcon(prescription.status)}
                {prescription.status.charAt(0).toUpperCase() + prescription.status.slice(1)}
              </div>
            </Badge>
          </div>

          {/* Instructions */}
          {prescription.dosage.instructions && (
            <div className="mb-2 p-2 bg-muted/30 rounded text-xs text-foreground">
              <p className="line-clamp-2">{prescription.dosage.instructions}</p>
            </div>
          )}

          {/* Footer with Dosage and Action */}
          <div className="flex items-center justify-between pt-2 border-t border-border gap-2">
            <div className="flex items-center gap-1 text-xs text-muted-foreground flex-wrap">
              <span className="bg-muted/50 px-1.5 py-0.5 rounded">{prescription.dosage.quantity}</span>
              <span className="hidden sm:inline">•</span>
              <span className="bg-muted/50 px-1.5 py-0.5 rounded">{prescription.dosage.frequency}</span>
            </div>
            {prescription.status === "pending" && (
              <Button
                size="sm"
                variant="outline"
                className="h-5 md:h-6 px-1.5 md:px-2 text-xs flex-shrink-0"
                onClick={() => handleSendPrescription(prescription._id)}
              >
                <Send className="h-3 w-3 mr-1" />
                <span className="hidden sm:inline">Send</span>
              </Button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
