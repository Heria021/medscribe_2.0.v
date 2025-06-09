"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Activity,
  Calendar,
  Target,
  User,
  Edit,
  FileText,
  Clock,
  Pill
} from "lucide-react";

interface TreatmentCardProps {
  treatment: {
    _id: string;
    title: string;
    diagnosis: string;
    plan: string;
    goals: string[];
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
    soapNote?: {
      _id: string;
      createdAt: number;
    };
    medications?: {
      _id: string;
      medicationName: string;
      dosage: string;
      frequency: string;
      instructions: string;
      status: "active" | "completed" | "discontinued";
      startDate: string;
      endDate?: string;
    }[];
  };
  onEdit: () => void;
}

export function TreatmentCard({ treatment, onEdit }: TreatmentCardProps) {
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
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <Activity className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg">{treatment.title}</CardTitle>
              <Badge className={getStatusColor(treatment.status)}>
                {treatment.status.charAt(0).toUpperCase() + treatment.status.slice(1)}
              </Badge>
            </div>
            <CardDescription className="text-sm font-medium text-foreground">
              <span className="font-semibold">Diagnosis:</span> {treatment.diagnosis}
            </CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={onEdit}>
            <Edit className="h-4 w-4 mr-1" />
            Edit
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Treatment Plan */}
        <div>
          <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Treatment Plan
          </h4>
          <p className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-md">
            {treatment.plan}
          </p>
        </div>

        {/* Goals */}
        {treatment.goals.length > 0 && (
          <div>
            <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
              <Target className="h-4 w-4" />
              Treatment Goals
            </h4>
            <ul className="space-y-1">
              {treatment.goals.map((goal, index) => (
                <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0"></span>
                  {goal}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Associated Medications */}
        {treatment.medications && treatment.medications.length > 0 && (
          <div>
            <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
              <Pill className="h-4 w-4" />
              Prescribed Medications
              <Badge variant="secondary" className="text-xs">
                {treatment.medications.length}
              </Badge>
            </h4>
            <div className="space-y-2">
              {treatment.medications.map((medication) => (
                <div
                  key={medication._id}
                  className="flex items-center justify-between p-2 bg-blue-50 dark:bg-blue-950/20 rounded border border-blue-200 dark:border-blue-800"
                >
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm text-blue-900 dark:text-blue-100">
                      {medication.medicationName}
                    </div>
                    <div className="text-xs text-blue-700 dark:text-blue-300">
                      {medication.dosage} • {medication.frequency}
                    </div>
                    {medication.instructions && (
                      <div className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                        {medication.instructions}
                      </div>
                    )}
                  </div>
                  <Badge
                    variant="outline"
                    className={`text-xs ml-2 ${
                      medication.status === "active"
                        ? "bg-green-100 text-green-700 border-green-200"
                        : medication.status === "completed"
                        ? "bg-blue-100 text-blue-700 border-blue-200"
                        : "bg-red-100 text-red-700 border-red-200"
                    }`}
                  >
                    {medication.status}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Timeline */}
        <div className="flex items-center justify-between pt-4 border-t border-border/50">
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              <span>Started: {formatDate(treatment.startDate)}</span>
            </div>
            {treatment.endDate && (
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span>Ends: {formatDate(treatment.endDate)}</span>
              </div>
            )}
          </div>

          {/* Doctor Info */}
          {treatment.doctor && (
            <div className="flex items-center gap-2">
              <Avatar className="h-6 w-6">
                <AvatarFallback className="text-xs">
                  {treatment.doctor.firstName[0]}{treatment.doctor.lastName[0]}
                </AvatarFallback>
              </Avatar>
              <div className="text-xs text-muted-foreground">
                <div>Dr. {treatment.doctor.firstName} {treatment.doctor.lastName}</div>
                <div>{treatment.doctor.primarySpecialty}</div>
              </div>
            </div>
          )}
        </div>

        {/* SOAP Note Reference */}
        {treatment.soapNote && (
          <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
            <div className="flex items-center gap-2 text-sm text-blue-800">
              <FileText className="h-4 w-4" />
              <span>Based on SOAP note from {new Date(treatment.soapNote.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
