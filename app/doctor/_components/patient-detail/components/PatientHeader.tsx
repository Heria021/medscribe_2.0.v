import React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  ArrowLeft,
  Calendar,
  Phone,
  Mail,
  User,
  MessageCircle,
  Plus,
} from "lucide-react";
import { usePatientDetailFormatters } from "../hooks";
import type { PatientHeaderProps } from "../types";
import { cn } from "@/lib/utils";

/**
 * PatientHeader Component
 * 
 * Displays patient information header with quick actions
 * Optimized for performance with React.memo
 */
export const PatientHeader = React.memo<PatientHeaderProps>(({
  patient,
  activeTreatments,
  activeMedications,
  onChatToggle,
  onAppointmentClick,
  onAddTreatment,
  showChat,
  className = "",
}) => {
  const router = useRouter();
  const { calculateAge, getInitials } = usePatientDetailFormatters();

  const age = calculateAge(patient.dateOfBirth);
  const initials = getInitials(patient.firstName, patient.lastName);

  return (
    <div className={cn("flex-shrink-0 space-y-1", className)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.back()}
            className="h-8 w-8 p-0"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>

          <div className="flex items-center gap-3">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="text-xs font-bold bg-primary text-primary-foreground">
                {initials}
              </AvatarFallback>
            </Avatar>

            <div>
              <h1 className="text-lg font-semibold">
                {patient.firstName} {patient.lastName}
              </h1>
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {age} years
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
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-3 text-sm">
            <div className="text-right">
              <div className="text-lg font-bold text-foreground">
                {activeTreatments.length}
              </div>
              <div className="text-xs text-muted-foreground">Active Plans</div>
            </div>
            <div className="w-px h-6 bg-border" />
            <div className="text-right">
              <div className="text-lg font-bold text-foreground">
                {activeMedications.length}
              </div>
              <div className="text-xs text-muted-foreground">Medications</div>
            </div>
          </div>

          <Button
            size="sm"
            variant="outline"
            onClick={onChatToggle}
            className="h-8 px-3 text-xs"
          >
            <MessageCircle className="h-3 w-3 mr-1" />
            Chat
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={onAppointmentClick}
            className="h-8 px-3 text-xs"
          >
            <Calendar className="h-3 w-3 mr-1" />
            Set Appointment
          </Button>

          <Button
            size="sm"
            onClick={onAddTreatment}
            className="h-8 px-3 text-xs"
          >
            <Plus className="h-3 w-3 mr-1" />
            Add Treatment
          </Button>
        </div>
      </div>
    </div>
  );
});

PatientHeader.displayName = "PatientHeader";
