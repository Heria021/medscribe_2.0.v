"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Pill,
  Calendar,
  Clock,
  User,
  Edit,
  FileText,
  Activity
} from "lucide-react";

interface MedicationCardProps {
  medication: {
    _id: string;
    medicationName: string;
    dosage: string;
    frequency: string;
    instructions: string;
    status: "active" | "completed" | "discontinued";
    startDate: string;
    endDate?: string;
    createdAt: number;
    updatedAt: number;
    doctor?: {
      firstName: string;
      lastName: string;
      primarySpecialty: string;
    };
    treatmentPlan?: {
      _id: string;
      title: string;
    };
  };
  onEdit: () => void;
}

export function MedicationCard({ medication, onEdit }: MedicationCardProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800 border-green-200";
      case "completed":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "discontinued":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  return (
    <Card className="hover:border-primary/50 transition-colors">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <Pill className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg">{medication.medicationName}</CardTitle>
              <Badge className={getStatusColor(medication.status)}>
                {medication.status.charAt(0).toUpperCase() + medication.status.slice(1)}
              </Badge>
            </div>
            <CardDescription className="text-sm">
              <span className="font-semibold">Dosage:</span> {medication.dosage} • <span className="font-semibold">Frequency:</span> {medication.frequency}
            </CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={onEdit}>
            <Edit className="h-4 w-4 mr-1" />
            Edit
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Instructions */}
        <div>
          <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Instructions
          </h4>
          <p className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-md">
            {medication.instructions}
          </p>
        </div>

        {/* Timeline */}
        <div className="flex items-center justify-between pt-4 border-t border-border/50">
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              <span>Started: {formatDate(medication.startDate)}</span>
            </div>
            {medication.endDate && (
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span>Ends: {formatDate(medication.endDate)}</span>
              </div>
            )}
          </div>

          {/* Doctor Info */}
          {medication.doctor && (
            <div className="flex items-center gap-2">
              <Avatar className="h-6 w-6">
                <AvatarFallback className="text-xs">
                  {medication.doctor.firstName[0]}{medication.doctor.lastName[0]}
                </AvatarFallback>
              </Avatar>
              <div className="text-xs text-muted-foreground">
                <div>Dr. {medication.doctor.firstName} {medication.doctor.lastName}</div>
                <div>{medication.doctor.primarySpecialty}</div>
              </div>
            </div>
          )}
        </div>

        {/* Treatment Plan Reference */}
        {medication.treatmentPlan && (
          <div className="bg-purple-50 border border-purple-200 rounded-md p-3">
            <div className="flex items-center gap-2 text-sm text-purple-800">
              <Activity className="h-4 w-4" />
              <span>Part of treatment plan: {medication.treatmentPlan.title}</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
