import React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Calendar,
  Phone,
  Mail,
  Activity,
  Eye,
  UserMinus,
} from "lucide-react";
import { usePatientFormatters } from "../hooks";
import type { PatientCardProps } from "../types";
import { cn } from "@/lib/utils";

/**
 * PatientCard Component
 * 
 * Displays a single patient with their info and action buttons
 * Optimized for performance with React.memo
 */
export const PatientCard = React.memo<PatientCardProps>(({
  relationship,
  onView,
  onRemove,
  isLoading = false,
  className = "",
}) => {
  const { 
    calculateAge, 
    formatAssignmentType, 
    formatPatientName,
    getAssignmentBadgeVariant 
  } = usePatientFormatters();

  const patient = relationship.patient;
  
  if (!patient) {
    return null;
  }

  const handleView = () => {
    onView?.(patient._id);
  };

  const handleRemove = () => {
    onRemove?.(relationship._id);
  };

  const age = calculateAge(patient.dateOfBirth);
  const patientName = formatPatientName(patient);

  return (
    <div
      className={cn(
        "p-4 cursor-pointer hover:bg-muted/50 transition-colors",
        isLoading && "opacity-50 pointer-events-none",
        className
      )}
      onClick={handleView}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {/* Patient Avatar */}
          <Avatar className="h-10 w-10">
            <AvatarFallback className="text-sm font-medium bg-primary text-primary-foreground">
              {patient.firstName[0]}{patient.lastName[0]}
            </AvatarFallback>
          </Avatar>

          {/* Patient Info */}
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-medium">
                {patientName}
              </h3>
              <Badge 
                variant={getAssignmentBadgeVariant(relationship.assignedBy)} 
                className="text-xs"
              >
                {formatAssignmentType(relationship.assignedBy)}
              </Badge>
            </div>
            
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {age} years
              </span>
              <span className="flex items-center gap-1">
                <Phone className="h-3 w-3" />
                {patient.primaryPhone}
              </span>
              <span className="flex items-center gap-1">
                <Mail className="h-3 w-3" />
                {patient.email}
              </span>
              <span className="flex items-center gap-1">
                <Activity className="h-3 w-3" />
                {patient.mrn}
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          {/* Remove Button */}
          <Button
            variant="ghost"
            size="sm"
            className="h-7 px-2 text-xs"
            onClick={(e) => {
              e.stopPropagation();
              handleRemove();
            }}
            disabled={isLoading}
          >
            <UserMinus className="h-3 w-3" />
          </Button>

          {/* View Button */}
          <Button
            variant="outline"
            size="sm"
            className="h-7 px-2 rounded-lg"
            onClick={(e) => {
              e.stopPropagation();
              handleView();
            }}
            disabled={isLoading}
          >
            <Eye className="h-3 w-3 mr-1" />
            View
          </Button>
        </div>
      </div>
    </div>
  );
});

PatientCard.displayName = "PatientCard";
