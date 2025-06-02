"use client";

import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Stethoscope,
  Calendar,
  UserPlus,
  Clock,
  MapPin,
  AlertTriangle,
  X,
  Send
} from "lucide-react";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";
import { Id } from "@/convex/_generated/dataModel";

interface DoctorActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  soapNoteId: Id<"soapNotes">;
  patientId: Id<"patients">;
  doctorId: Id<"doctors">;
  patientName: string;
}

export function DoctorActionModal({
  isOpen,
  onClose,
  soapNoteId,
  patientId,
  doctorId,
  patientName,
}: DoctorActionModalProps) {
  const [selectedAction, setSelectedAction] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form states
  const [assistanceText, setAssistanceText] = useState("");

  const [appointmentDate, setAppointmentDate] = useState("");
  const [appointmentTime, setAppointmentTime] = useState("");
  const [appointmentType, setAppointmentType] = useState("");
  const [appointmentLocation, setAppointmentLocation] = useState("");

  const [selectedSpecialist, setSelectedSpecialist] = useState("");
  const [referralReason, setReferralReason] = useState("");
  const [urgencyLevel, setUrgencyLevel] = useState<"low" | "medium" | "high" | "urgent">("medium");

  // Mutations
  const createAction = useMutation(api.doctorActions.create);
  const createAppointment = useMutation(api.appointments.create);

  // Queries - exclude current doctor from specialists list
  const specialists = useQuery(api.doctors.getAll, { excludeDoctorId: doctorId }) || [];

  const handleSubmit = async () => {
    if (!selectedAction) return;

    setIsSubmitting(true);
    try {
      let actionData: any = {
        soapNoteId,
        patientId,
        doctorId,
      };

      switch (selectedAction) {
        case "assistance":
          if (!assistanceText.trim()) {
            toast.error("Please provide assistance details");
            return;
          }
          actionData = {
            ...actionData,
            actionType: "immediate_assistance" as const,
            assistanceProvided: assistanceText,
          };
          break;

        case "appointment":
          if (!appointmentDate || !appointmentTime || !appointmentType) {
            toast.error("Please fill in all appointment details");
            return;
          }
          actionData = {
            ...actionData,
            actionType: "schedule_appointment" as const,
            appointmentDate: new Date(appointmentDate).getTime(),
            appointmentTime,
            appointmentType,
            appointmentLocation,
          };
          break;

        case "referral":
          if (!selectedSpecialist || !referralReason.trim()) {
            toast.error("Please select a specialist and provide referral reason");
            return;
          }
          actionData = {
            ...actionData,
            actionType: "refer_to_specialist" as const,
            specialistId: selectedSpecialist as Id<"doctors">,
            referralReason,
            urgencyLevel,
          };
          break;
      }

      const actionId = await createAction(actionData);

      // If scheduling an appointment, also create an appointment record
      if (selectedAction === "appointment") {
        await createAppointment({
          patientId,
          doctorId,
          appointmentDate: new Date(appointmentDate).getTime(),
          appointmentTime,
          appointmentType,
          appointmentLocation,
          relatedSoapNoteId: soapNoteId,
          relatedActionId: actionId,
        });
      }

      toast.success("Action created successfully!");
      handleClose();

    } catch (error) {
      console.error("Error creating action:", error);
      toast.error("Failed to create action");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setSelectedAction(null);
    setAssistanceText("");
    setAppointmentDate("");
    setAppointmentTime("");
    setAppointmentType("");
    setAppointmentLocation("");
    setSelectedSpecialist("");
    setReferralReason("");
    setUrgencyLevel("medium");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader className="space-y-3">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl">Take Action</DialogTitle>
            <Button variant="ghost" size="sm" onClick={handleClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          <div className="text-sm text-muted-foreground">
            Patient: <span className="font-medium text-foreground">{patientName}</span>
          </div>
        </DialogHeader>

        {!selectedAction ? (
          // Action Selection Screen
          <div className="space-y-4 py-4">
            <div className="text-sm text-muted-foreground mb-6">
              Choose an action to take for this patient:
            </div>

            <div className="grid gap-3">
              <Button
                variant="outline"
                className="h-auto p-4 justify-start hover:bg-blue-50 hover:border-blue-200"
                onClick={() => setSelectedAction("assistance")}
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Stethoscope className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="text-left">
                    <div className="font-medium">Provide Immediate Assistance</div>
                    <div className="text-sm text-muted-foreground">Give guidance or advice to the patient</div>
                  </div>
                </div>
              </Button>

              <Button
                variant="outline"
                className="h-auto p-4 justify-start hover:bg-green-50 hover:border-green-200"
                onClick={() => setSelectedAction("appointment")}
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Calendar className="h-5 w-5 text-green-600" />
                  </div>
                  <div className="text-left">
                    <div className="font-medium">Schedule Appointment</div>
                    <div className="text-sm text-muted-foreground">Book a follow-up appointment</div>
                  </div>
                </div>
              </Button>

              <Button
                variant="outline"
                className="h-auto p-4 justify-start hover:bg-purple-50 hover:border-purple-200"
                onClick={() => setSelectedAction("referral")}
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <UserPlus className="h-5 w-5 text-purple-600" />
                  </div>
                  <div className="text-left">
                    <div className="font-medium">Refer to Specialist</div>
                    <div className="text-sm text-muted-foreground">Send to another doctor for specialized care</div>
                  </div>
                </div>
              </Button>
            </div>
          </div>
        ) : (
          // Form Screen
          <div className="space-y-6 py-4">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="sm" onClick={() => setSelectedAction(null)}>
                ← Back
              </Button>
              <div className="flex items-center gap-2">
                {selectedAction === "assistance" && (
                  <>
                    <div className="p-1.5 bg-blue-100 rounded">
                      <Stethoscope className="h-4 w-4 text-blue-600" />
                    </div>
                    <span className="font-medium">Provide Immediate Assistance</span>
                  </>
                )}
                {selectedAction === "appointment" && (
                  <>
                    <div className="p-1.5 bg-green-100 rounded">
                      <Calendar className="h-4 w-4 text-green-600" />
                    </div>
                    <span className="font-medium">Schedule Appointment</span>
                  </>
                )}
                {selectedAction === "referral" && (
                  <>
                    <div className="p-1.5 bg-purple-100 rounded">
                      <UserPlus className="h-4 w-4 text-purple-600" />
                    </div>
                    <span className="font-medium">Refer to Specialist</span>
                  </>
                )}
              </div>
            </div>

            <Separator />

            {/* Assistance Form */}
            {selectedAction === "assistance" && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="assistance" className="text-sm font-medium">
                    What assistance are you providing? *
                  </Label>
                  <Textarea
                    id="assistance"
                    placeholder="Describe the guidance, advice, or assistance you're providing to the patient..."
                    value={assistanceText}
                    onChange={(e) => setAssistanceText(e.target.value)}
                    rows={4}
                    className="mt-2"
                  />
                </div>
              </div>
            )}

            {/* Appointment Form */}
            {selectedAction === "appointment" && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="appointment-date" className="text-sm font-medium">
                      Date *
                    </Label>
                    <Input
                      id="appointment-date"
                      type="date"
                      value={appointmentDate}
                      onChange={(e) => setAppointmentDate(e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label htmlFor="appointment-time" className="text-sm font-medium">
                      Time *
                    </Label>
                    <Input
                      id="appointment-time"
                      type="time"
                      value={appointmentTime}
                      onChange={(e) => setAppointmentTime(e.target.value)}
                      className="mt-2"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="appointment-type" className="text-sm font-medium">
                    Appointment Type *
                  </Label>
                  <Select value={appointmentType} onValueChange={setAppointmentType}>
                    <SelectTrigger className="mt-2">
                      <SelectValue placeholder="Select appointment type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="consultation">Consultation</SelectItem>
                      <SelectItem value="follow-up">Follow-up</SelectItem>
                      <SelectItem value="check-up">Check-up</SelectItem>
                      <SelectItem value="procedure">Procedure</SelectItem>
                      <SelectItem value="emergency">Emergency</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="appointment-location" className="text-sm font-medium">
                    <MapPin className="h-4 w-4 inline mr-1" />
                    Location
                  </Label>
                  <Input
                    id="appointment-location"
                    placeholder="Clinic address or online meeting link"
                    value={appointmentLocation}
                    onChange={(e) => setAppointmentLocation(e.target.value)}
                    className="mt-2"
                  />
                </div>
              </div>
            )}

            {/* Referral Form */}
            {selectedAction === "referral" && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="specialist" className="text-sm font-medium">
                    Select Specialist *
                  </Label>
                  <Select value={selectedSpecialist} onValueChange={setSelectedSpecialist}>
                    <SelectTrigger className="mt-2">
                      <SelectValue placeholder="Choose a specialist" />
                    </SelectTrigger>
                    <SelectContent>
                      {specialists.map((specialist) => (
                        <SelectItem key={specialist._id} value={specialist._id}>
                          <div className="flex items-center gap-2">
                            <div className="font-medium">
                              Dr. {specialist.firstName} {specialist.lastName}
                            </div>
                            <Badge variant="outline" className="text-xs">
                              {specialist.specialization}
                            </Badge>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="urgency" className="text-sm font-medium">
                    Urgency Level
                  </Label>
                  <Select value={urgencyLevel} onValueChange={(value: any) => setUrgencyLevel(value)}>
                    <SelectTrigger className="mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary">Low</Badge>
                          <span>Routine referral</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="medium">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">Medium</Badge>
                          <span>Standard priority</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="high">
                        <div className="flex items-center gap-2">
                          <Badge variant="destructive">High</Badge>
                          <span>High priority</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="urgent">
                        <div className="flex items-center gap-2">
                          <Badge variant="destructive">
                            <AlertTriangle className="h-3 w-3 mr-1" />
                            Urgent
                          </Badge>
                          <span>Immediate attention</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="referral-reason" className="text-sm font-medium">
                    Referral Reason *
                  </Label>
                  <Textarea
                    id="referral-reason"
                    placeholder="Explain why you're referring this patient to the specialist..."
                    value={referralReason}
                    onChange={(e) => setReferralReason(e.target.value)}
                    rows={4}
                    className="mt-2"
                  />
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex justify-between pt-6">
              <Button variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button onClick={handleSubmit} disabled={isSubmitting} className="min-w-[120px]">
                {isSubmitting ? (
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent" />
                    Creating...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Send className="h-4 w-4" />
                    Create Action
                  </div>
                )}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
