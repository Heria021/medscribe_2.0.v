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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Stethoscope,
  Calendar,
  UserPlus,
  MapPin,
  AlertTriangle,
  Send,
  Search,
  CheckCircle,
  Loader2,
  X,
} from "lucide-react";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";
import { Id } from "@/convex/_generated/dataModel";
import { cn } from "@/lib/utils";


interface DoctorActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  soapNoteId: Id<"soapNotes">;
  patientId: Id<"patients">;
  doctorId: Id<"doctors">;
  patientName: string;
  sharedSoapNoteId?: Id<"sharedSoapNotes">;
}

export function DoctorActionModal({
  isOpen,
  onClose,
  soapNoteId,
  patientId,
  doctorId,
  patientName,
  sharedSoapNoteId,
}: DoctorActionModalProps) {
  const [selectedAction, setSelectedAction] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form states
  const [assistanceText, setAssistanceText] = useState("");

  const [appointmentDate, setAppointmentDate] = useState("");
  const [appointmentTime, setAppointmentTime] = useState("");
  const [appointmentType, setAppointmentType] = useState("");
  const [visitReason, setVisitReason] = useState("");
  const [duration, setDuration] = useState<number>(30);
  const [locationType, setLocationType] = useState<"in_person" | "telemedicine">("in_person");
  const [address, setAddress] = useState("");
  const [room, setRoom] = useState("");
  const [meetingLink, setMeetingLink] = useState("");

  const [selectedSpecialist, setSelectedSpecialist] = useState("");
  const [referralReason, setReferralReason] = useState("");
  const [urgencyLevel, setUrgencyLevel] = useState<"low" | "medium" | "high" | "urgent">("medium");
  const [searchTerm, setSearchTerm] = useState("");

  // Enhanced doctor search with better filtering
  const specialists = useQuery(
    api.doctors.searchDoctors,
    {
      searchTerm: searchTerm || undefined,
      excludeDoctorId: doctorId,
      acceptingNewPatients: true, // Only show doctors accepting new patients for referrals
      limit: 50,
    }
  ) || [];

  // Mutations
  const createAssistance = useMutation(api.soapNotes.addAssistance);
  const createAppointment = useMutation(api.appointments.create);
  const createReferral = useMutation(api.referrals.create);
  const assignPatient = useMutation(api.doctorPatients.assignPatient);
  const updateActionStatus = useMutation(api.sharedSoapNotes.updateActionStatus);

  const handleSubmit = async () => {
    if (!selectedAction) return;

    setIsSubmitting(true);
    try {
      if (selectedAction === "assistance") {
        if (!assistanceText.trim()) {
          toast.error("Please provide assistance details");
          setIsSubmitting(false);
          return;
        }

        await createAssistance({
          soapNoteId,
          assistanceText: assistanceText.trim(),
          doctorId,
        });

        // Update action status if this is from a shared SOAP note
        if (sharedSoapNoteId) {
          await updateActionStatus({
            sharedSoapNoteId,
            actionStatus: "assistance_provided",
            actionDetails: `Medical assistance provided: ${assistanceText.trim().substring(0, 100)}...`,
          });
        }

        toast.success("Assistance provided successfully!");
      } else if (selectedAction === "appointment") {
        if (!appointmentDate || !appointmentTime || !appointmentType || !visitReason.trim()) {
          toast.error("Please fill in all required appointment fields");
          setIsSubmitting(false);
          return;
        }

        const appointmentDateTime = new Date(`${appointmentDate}T${appointmentTime}`).getTime();

        // Check if appointment is in the future
        if (appointmentDateTime <= Date.now()) {
          toast.error("Appointment must be scheduled for a future date and time");
          setIsSubmitting(false);
          return;
        }

        // First, ensure doctor-patient relationship exists
        const doctorPatientId = await assignPatient({
          doctorId,
          patientId,
          assignedBy: "appointment_scheduling",
        });

        const appointmentId = await createAppointment({
          doctorPatientId,
          appointmentDateTime,
          duration,
          timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          appointmentType: appointmentType as any,
          visitReason: visitReason.trim(),
          location: {
            type: locationType,
            address: locationType === "in_person" ? address : undefined,
            room: locationType === "in_person" ? room : undefined,
            meetingLink: locationType === "telemedicine" ? meetingLink : undefined,
          },
          notes: `Scheduled from SOAP note review`,
        });

        // Update action status if this is from a shared SOAP note
        if (sharedSoapNoteId) {
          await updateActionStatus({
            sharedSoapNoteId,
            actionStatus: "appointment_scheduled",
            actionDetails: `Appointment scheduled for ${new Date(appointmentDateTime).toLocaleDateString()} - ${visitReason}`,
            relatedActionId: appointmentId,
          });
        }

        toast.success("Appointment scheduled successfully!");
      } else if (selectedAction === "referral") {
        if (!selectedSpecialist || !referralReason.trim()) {
          toast.error("Please select a specialist and provide referral reason");
          setIsSubmitting(false);
          return;
        }

        // Get specialist info for specialty
        const specialist = specialists.find(s => s._id === selectedSpecialist);

        const referralId = await createReferral({
          fromDoctorId: doctorId,
          toDoctorId: selectedSpecialist as any,
          patientId,
          soapNoteId,
          specialtyRequired: specialist?.primarySpecialty || "General Medicine",
          urgency: urgencyLevel === "urgent" ? "urgent" : "routine",
          reasonForReferral: referralReason.trim(),
        });

        // Update action status if this is from a shared SOAP note
        if (sharedSoapNoteId) {
          await updateActionStatus({
            sharedSoapNoteId,
            actionStatus: "referral_sent",
            actionDetails: `Referred to ${specialist?.firstName} ${specialist?.lastName} (${specialist?.primarySpecialty}) - ${referralReason.trim().substring(0, 100)}...`,
            relatedActionId: referralId,
          });
        }

        toast.success("Referral sent successfully!");
      }

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
    setVisitReason("");
    setDuration(30);
    setLocationType("in_person");
    setAddress("");
    setRoom("");
    setMeetingLink("");
    setSelectedSpecialist("");
    setReferralReason("");
    setUrgencyLevel("medium");
    setSearchTerm("");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="space-y-3">
          <DialogTitle className="text-xl">Take Action</DialogTitle>
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
                <div>
                  <Label htmlFor="visit-reason" className="text-sm font-medium">
                    Visit Reason *
                  </Label>
                  <Input
                    id="visit-reason"
                    placeholder="Reason for the appointment"
                    value={visitReason}
                    onChange={(e) => setVisitReason(e.target.value)}
                    className="mt-2"
                  />
                </div>

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

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="appointment-type" className="text-sm font-medium">
                      Appointment Type *
                    </Label>
                    <Select value={appointmentType} onValueChange={setAppointmentType}>
                      <SelectTrigger className="mt-2">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="new_patient">New Patient</SelectItem>
                        <SelectItem value="follow_up">Follow-up</SelectItem>
                        <SelectItem value="consultation">Consultation</SelectItem>
                        <SelectItem value="procedure">Procedure</SelectItem>
                        <SelectItem value="telemedicine">Telemedicine</SelectItem>
                        <SelectItem value="emergency">Emergency</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="duration" className="text-sm font-medium">
                      Duration (minutes)
                    </Label>
                    <Select value={duration.toString()} onValueChange={(value) => setDuration(parseInt(value))}>
                      <SelectTrigger className="mt-2">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="15">15 minutes</SelectItem>
                        <SelectItem value="30">30 minutes</SelectItem>
                        <SelectItem value="45">45 minutes</SelectItem>
                        <SelectItem value="60">1 hour</SelectItem>
                        <SelectItem value="90">1.5 hours</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium">Location Type</Label>
                  <Select value={locationType} onValueChange={(value: "in_person" | "telemedicine") => setLocationType(value)}>
                    <SelectTrigger className="mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="in_person">In Person</SelectItem>
                      <SelectItem value="telemedicine">Telemedicine</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {locationType === "in_person" ? (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="address" className="text-sm font-medium">
                        <MapPin className="h-4 w-4 inline mr-1" />
                        Address
                      </Label>
                      <Input
                        id="address"
                        placeholder="Clinic address"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        className="mt-2"
                      />
                    </div>
                    <div>
                      <Label htmlFor="room" className="text-sm font-medium">
                        Room
                      </Label>
                      <Input
                        id="room"
                        placeholder="Room number"
                        value={room}
                        onChange={(e) => setRoom(e.target.value)}
                        className="mt-2"
                      />
                    </div>
                  </div>
                ) : (
                  <div>
                    <Label htmlFor="meeting-link" className="text-sm font-medium">
                      Meeting Link
                    </Label>
                    <Input
                      id="meeting-link"
                      placeholder="Video meeting link"
                      value={meetingLink}
                      onChange={(e) => setMeetingLink(e.target.value)}
                      className="mt-2"
                    />
                  </div>
                )}
              </div>
            )}

            {/* Referral Form */}
            {selectedAction === "referral" && (
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium">
                    Select Doctor for Referral *
                  </Label>

                  {/* Enhanced Search Input */}
                  <div className="relative mt-2">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search by name, specialty, or hospital..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 pr-10 bg-background/50 border-muted-foreground/20 focus:border-primary/50 transition-all"
                    />
                    {searchTerm && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSearchTerm("")}
                        className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0 rounded-full hover:bg-muted"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    )}
                  </div>

                  {/* Enhanced Specialists List */}
                  <ScrollArea className="h-64 mt-3 rounded-xl border border-muted-foreground/10 bg-muted/20">
                    <div className="p-2 space-y-1">
                      {specialists.length === 0 ? (
                        <div className="flex items-center justify-center h-full text-center p-6">
                          <div>
                            <Stethoscope className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                            <p className="text-sm text-muted-foreground">
                              {searchTerm ? "No doctors found matching your search" : "No doctors available for referral"}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              Try searching by name or specialty
                            </p>
                          </div>
                        </div>
                      ) : (
                        specialists.map((specialist) => (
                          <Card
                            key={specialist._id}
                            className={cn(
                              "cursor-pointer transition-all duration-200 border-0 shadow-none hover:shadow-sm",
                              selectedSpecialist === specialist._id
                                ? "bg-primary/5 ring-1 ring-primary/30"
                                : "hover:bg-muted/50"
                            )}
                            onClick={() => setSelectedSpecialist(specialist._id)}
                          >
                            <CardContent className="p-3">
                              <div className="flex items-center gap-3">
                                <Avatar className="h-10 w-10 ring-1 ring-border">
                                  <AvatarImage src={specialist.profileImageUrl} />
                                  <AvatarFallback className="bg-gradient-to-br from-primary/80 to-primary text-primary-foreground text-sm font-medium">
                                    {specialist.firstName[0]}{specialist.lastName[0]}
                                  </AvatarFallback>
                                </Avatar>

                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-1">
                                    <h4 className="font-medium text-sm truncate">
                                      Dr. {specialist.firstName} {specialist.lastName}
                                    </h4>
                                    {selectedSpecialist === specialist._id && (
                                      <CheckCircle className="h-4 w-4 text-primary flex-shrink-0" />
                                    )}
                                  </div>

                                  <div className="flex items-center gap-2 mb-2">
                                    <Badge variant="secondary" className="text-xs h-5 px-2 bg-primary/10 text-primary">
                                      <Stethoscope className="h-3 w-3 mr-1" />
                                      {specialist.primarySpecialty}
                                    </Badge>
                                    {specialist.yearsOfExperience && (
                                      <Badge variant="outline" className="text-xs h-5 px-2 border-muted-foreground/30">
                                        {specialist.yearsOfExperience}y exp
                                      </Badge>
                                    )}
                                  </div>

                                  {specialist.secondarySpecialties && specialist.secondarySpecialties.length > 0 && (
                                    <p className="text-xs text-muted-foreground truncate">
                                      Also: {specialist.secondarySpecialties.slice(0, 2).join(", ")}
                                    </p>
                                  )}

                                  <div className="flex items-center gap-1 mt-1">
                                    {specialist.isAcceptingNewPatients && (
                                      <Badge variant="secondary" className="text-xs h-4 px-1.5">
                                        Available
                                      </Badge>
                                    )}
                                    {specialist.hospitalAffiliations && specialist.hospitalAffiliations.length > 0 && (
                                      <Badge variant="outline" className="text-xs h-4 px-1.5 border-muted-foreground/30">
                                        {specialist.hospitalAffiliations[0]}
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))
                      )}
                    </div>
                  </ScrollArea>
                </div>

                {/* Selected Doctor Confirmation */}
                {selectedSpecialist && (
                  <div className="p-3 bg-primary/5 border border-primary/20 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={specialists.find(s => s._id === selectedSpecialist)?.profileImageUrl} />
                        <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                          {specialists.find(s => s._id === selectedSpecialist)?.firstName[0]}
                          {specialists.find(s => s._id === selectedSpecialist)?.lastName[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          Dr. {specialists.find(s => s._id === selectedSpecialist)?.firstName} {specialists.find(s => s._id === selectedSpecialist)?.lastName}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {specialists.find(s => s._id === selectedSpecialist)?.primarySpecialty}
                        </p>
                      </div>
                      <CheckCircle className="h-4 w-4 text-primary flex-shrink-0" />
                    </div>
                  </div>
                )}

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
