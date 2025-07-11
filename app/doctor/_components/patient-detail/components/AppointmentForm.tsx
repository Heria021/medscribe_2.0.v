import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Calendar,
  MapPin,
  Video,
  CheckCircle,
  Loader2,
} from "lucide-react";
import { useAppointmentScheduling } from "../hooks";
import { APPOINTMENT_TYPES, DURATIONS } from "../types";
import type { AppointmentFormProps } from "../types";
import { cn } from "@/lib/utils";

/**
 * AppointmentForm Component
 * 
 * Comprehensive appointment scheduling form
 * Optimized for performance with React.memo
 */
export const AppointmentForm = React.memo<AppointmentFormProps>(({
  patientId,
  currentDoctorPatient,
  patient,
  doctorProfile,
  onCancel,
  onSuccess,
  className = "",
}) => {
  const {
    formData,
    updateFormData,
    handleCreateAppointment,
    isCreating,
    timeSlots,
  } = useAppointmentScheduling(currentDoctorPatient, patient, doctorProfile, onSuccess);

  const isFormValid = (
    formData.appointmentType &&
    formData.visitReason.trim() &&
    formData.appointmentDate &&
    formData.appointmentTime
  );

  return (
    <Card className={cn("flex-1 min-h-0 flex flex-col", className)}>
      <CardHeader className="pb-3 flex-shrink-0">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Calendar className="h-4 w-4 text-blue-600" />
            Schedule Appointment
          </CardTitle>
          <Button variant="outline" size="sm" onClick={onCancel}>
            Cancel
          </Button>
        </div>
      </CardHeader>
      <CardContent className="flex-1 min-h-0 p-4">
        <div className="h-full flex flex-col space-y-4">
          {/* Top Row - Type and Reason */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label htmlFor="appointmentType" className="text-sm font-medium">Type *</Label>
              <Select 
                value={formData.appointmentType} 
                onValueChange={(value) => updateFormData("appointmentType", value)}
              >
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {APPOINTMENT_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      <span className="font-medium">{type.label}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <Label htmlFor="visitReason" className="text-sm font-medium">Visit Reason *</Label>
              <Textarea
                id="visitReason"
                placeholder="Reason for appointment..."
                value={formData.visitReason}
                onChange={(e) => updateFormData("visitReason", e.target.value)}
                rows={2}
                className="resize-none"
              />
            </div>
          </div>

          {/* Date, Time, Duration Row */}
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1">
              <Label htmlFor="date" className="text-sm font-medium">Date *</Label>
              <Input
                id="date"
                type="date"
                value={formData.appointmentDate}
                onChange={(e) => updateFormData("appointmentDate", e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className="h-9"
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="time" className="text-sm font-medium">Time *</Label>
              <Select 
                value={formData.appointmentTime} 
                onValueChange={(value) => updateFormData("appointmentTime", value)}
              >
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="Select time" />
                </SelectTrigger>
                <SelectContent>
                  {timeSlots.map((slot) => (
                    <SelectItem key={slot.value} value={slot.value}>
                      {slot.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <Label htmlFor="duration" className="text-sm font-medium">Duration</Label>
              <Select 
                value={formData.duration.toString()} 
                onValueChange={(value) => updateFormData("duration", parseInt(value))}
              >
                <SelectTrigger className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DURATIONS.map((dur) => (
                    <SelectItem key={dur.value} value={dur.value.toString()}>
                      {dur.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Location Type - Compact */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Location Type</Label>
            <div className="grid grid-cols-2 gap-2">
              <Button
                type="button"
                variant={formData.locationType === "in_person" ? "default" : "outline"}
                size="sm"
                onClick={() => updateFormData("locationType", "in_person")}
                className="h-8 justify-start"
              >
                <MapPin className="h-3 w-3 mr-2" />
                In-Person
              </Button>
              <Button
                type="button"
                variant={formData.locationType === "telemedicine" ? "default" : "outline"}
                size="sm"
                onClick={() => updateFormData("locationType", "telemedicine")}
                className="h-8 justify-start"
              >
                <Video className="h-3 w-3 mr-2" />
                Virtual
              </Button>
            </div>
          </div>

          {/* Location Details */}
          {formData.locationType === "in_person" && (
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="address" className="text-sm font-medium">Address</Label>
                <Input
                  id="address"
                  placeholder="Clinic address"
                  value={formData.address}
                  onChange={(e) => updateFormData("address", e.target.value)}
                  className="h-9"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="room" className="text-sm font-medium">Room</Label>
                <Input
                  id="room"
                  placeholder="Room number"
                  value={formData.room}
                  onChange={(e) => updateFormData("room", e.target.value)}
                  className="h-9"
                />
              </div>
            </div>
          )}

          {formData.locationType === "telemedicine" && (
            <div className="space-y-1">
              <Label htmlFor="meetingLink" className="text-sm font-medium">Meeting Link</Label>
              <Input
                id="meetingLink"
                placeholder="Video call link"
                value={formData.meetingLink}
                onChange={(e) => updateFormData("meetingLink", e.target.value)}
                className="h-9"
              />
            </div>
          )}

          {/* Notes and Additional Info - Compact */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
            <div className="space-y-1">
              <Label htmlFor="notes" className="text-sm font-medium">Notes</Label>
              <Textarea
                id="notes"
                placeholder="Additional notes..."
                value={formData.notes}
                onChange={(e) => updateFormData("notes", e.target.value)}
                rows={2}
                className="resize-none"
              />
            </div>

            <div className="space-y-1">
              <Label className="text-sm font-medium">Insurance</Label>
              <div className="flex items-center space-x-2 h-9">
                <input
                  type="checkbox"
                  id="insurance"
                  checked={formData.insuranceVerified}
                  onChange={(e) => updateFormData("insuranceVerified", e.target.checked)}
                  className="rounded"
                />
                <Label htmlFor="insurance" className="text-sm">Verified</Label>
              </div>
            </div>

            <div className="space-y-1">
              <Label htmlFor="copay" className="text-sm font-medium">Copay ($)</Label>
              <Input
                id="copay"
                type="number"
                placeholder="0.00"
                value={formData.copayAmount}
                onChange={(e) => updateFormData("copayAmount", e.target.value)}
                min="0"
                step="0.01"
                className="h-9"
              />
            </div>
          </div>

          {/* Action Buttons - Compact */}
          <div className="flex gap-2 pt-2">
            <Button
              variant="outline"
              onClick={onCancel}
              size="sm"
              className="h-8"
              disabled={isCreating}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateAppointment}
              disabled={!isFormValid || isCreating}
              className="flex-1 h-8"
              size="sm"
            >
              {isCreating ? (
                <>
                  <Loader2 className="h-3 w-3 mr-2 animate-spin" />
                  Scheduling...
                </>
              ) : (
                <>
                  <CheckCircle className="h-3 w-3 mr-2" />
                  Schedule Appointment
                </>
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
});

AppointmentForm.displayName = "AppointmentForm";
