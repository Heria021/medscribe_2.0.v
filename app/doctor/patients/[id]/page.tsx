"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { useState, use } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  ArrowLeft,
  Plus,
  Activity,
  Pill,
  Calendar,
  Phone,
  Mail,
  User,
  Target,
  CheckCircle,
  Eye,
  FileText,
  MessageCircle,
  MapPin,
  Video,
  Loader2
} from "lucide-react";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { AddTreatmentForm } from "@/components/treatments/add-treatment-form";
import { AddMedicationForm } from "@/components/medications/add-medication-form";
import { DoctorPatientChat } from "@/components/doctor/doctor-patient-chat";
import { PrescriptionForm } from "@/components/prescriptions/prescription-form";
import { PrescriptionList } from "@/components/prescriptions/prescription-list";

import { toast } from "sonner";
import { cn } from "@/lib/utils";

const APPOINTMENT_TYPES = [
  { value: "new_patient", label: "New Patient", description: "First visit with this patient" },
  { value: "follow_up", label: "Follow-up", description: "Follow-up visit" },
  { value: "consultation", label: "Consultation", description: "General consultation" },
  { value: "procedure", label: "Procedure", description: "Medical procedure" },
  { value: "telemedicine", label: "Telemedicine", description: "Virtual appointment" },
  { value: "emergency", label: "Emergency", description: "Urgent care" },
];

const DURATIONS = [
  { value: 15, label: "15 minutes" },
  { value: 30, label: "30 minutes" },
  { value: 45, label: "45 minutes" },
  { value: 60, label: "1 hour" },
  { value: 90, label: "1.5 hours" },
  { value: 120, label: "2 hours" },
];
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";


interface PatientDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

// Helper function to calculate age
function calculateAge(dateOfBirth: string): number {
  const today = new Date();
  const birthDate = new Date(dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }

  return age;
}

export default function PatientDetailPage({ params }: PatientDetailPageProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const [selectedTreatmentId, setSelectedTreatmentId] = useState<string | null>(null);
  const [activeView, setActiveView] = useState<"overview" | "treatment-form" | "medication-form" | "appointment-form" | "prescription-form" | "chat">("overview");
  const [showChat, setShowChat] = useState(false);
  const [showPrescriptionForm, setShowPrescriptionForm] = useState(false);

  // Appointment form state
  const [appointmentType, setAppointmentType] = useState<string>("");
  const [visitReason, setVisitReason] = useState("");
  const [appointmentDate, setAppointmentDate] = useState("");
  const [appointmentTime, setAppointmentTime] = useState("");
  const [duration, setDuration] = useState<number>(30);
  const [locationType, setLocationType] = useState<"in_person" | "telemedicine">("in_person");
  const [address, setAddress] = useState("");
  const [room, setRoom] = useState("");
  const [meetingLink, setMeetingLink] = useState("");
  const [notes, setNotes] = useState("");
  const [insuranceVerified, setInsuranceVerified] = useState(false);
  const [copayAmount, setCopayAmount] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const updateTreatment = useMutation(api.treatmentPlans.update);
  const updateMedication = useMutation(api.medications.update);
  const scheduleEmail = useMutation(api.emailAutomation.scheduleEmail);
  const createAppointment = useMutation(api.appointments.create);

  const resolvedParams = use(params);
  const patientId = resolvedParams.id as Id<"patients">;

  // Get doctor profile
  const doctorProfile = useQuery(
    api.doctors.getDoctorProfile,
    session?.user?.id ? { userId: session.user.id as any } : "skip"
  );

  // Get patient details
  const patient = useQuery(api.patients.getPatientById, { patientId });

  // Get doctor-patient relationship
  const currentDoctorPatient = useQuery(
    api.doctorPatients.getDoctorPatientRelationship,
    doctorProfile && patientId ? {
      doctorId: doctorProfile._id,
      patientId: patientId as any
    } : "skip"
  );

  // Get treatment plans
  const treatmentPlans = useQuery(
    api.treatmentPlans.getWithDetailsByPatientId,
    { patientId }
  );

  // Get medications
  const medications = useQuery(
    api.medications.getWithDetailsByPatientId,
    { patientId }
  );



  const handleTreatmentStatusUpdate = async (treatmentId: string, status: string) => {
    try {
      await updateTreatment({
        id: treatmentId as any,
        status: status as "active" | "completed" | "discontinued"
      });
      toast.success(`Treatment ${status} successfully`);
    } catch (error) {
      toast.error("Failed to update treatment status");
    }
  };

  const handleMedicationStatusUpdate = async (medicationId: string, status: string) => {
    try {
      await updateMedication({
        id: medicationId as any,
        status: status as "active" | "completed" | "discontinued"
      });
      toast.success(`Medication ${status} successfully`);
    } catch (error) {
      toast.error("Failed to update medication status");
    }
  };

  const handleCreateAppointment = async () => {
    if (!appointmentType || !visitReason.trim() || !appointmentDate || !appointmentTime) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (!currentDoctorPatient || !patient || !doctorProfile) {
      toast.error("Missing patient or doctor information");
      return;
    }

    // Combine date and time into a timestamp
    const dateTime = new Date(`${appointmentDate}T${appointmentTime}`);
    if (isNaN(dateTime.getTime())) {
      toast.error("Please enter a valid date and time");
      return;
    }

    // Check if appointment is in the future
    if (dateTime.getTime() <= Date.now()) {
      toast.error("Appointment must be scheduled for a future date and time");
      return;
    }

    setIsCreating(true);
    try {
      // Create the appointment
      await createAppointment({
        doctorPatientId: currentDoctorPatient._id as any,
        appointmentDateTime: dateTime.getTime(),
        duration,
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        appointmentType: appointmentType as any,
        visitReason,
        location: {
          type: locationType,
          address: locationType === "in_person" ? address : undefined,
          room: locationType === "in_person" ? room : undefined,
          meetingLink: locationType === "telemedicine" ? meetingLink : undefined,
        },
        notes: notes.trim() || undefined,
        insuranceVerified: insuranceVerified || undefined,
        copayAmount: copayAmount ? parseFloat(copayAmount) : undefined,
      });

      // Send immediate appointment confirmation email
      await scheduleEmail({
        userId: patient.userId,
        emailType: "appointment_reminder_24h",
        scheduledFor: Date.now(), // Send immediately
        relatedRecordId: "new_appointment",
        relatedRecordType: "appointment",
        emailData: {
          to: patient.email,
          subject: "Appointment Confirmed - MedScribe",
          templateData: {
            patientName: `${patient.firstName} ${patient.lastName}`,
            doctorName: `${doctorProfile.firstName} ${doctorProfile.lastName}`,
            appointmentDetails: {
              date: dateTime.toLocaleDateString(),
              time: dateTime.toLocaleTimeString(),
              type: appointmentType,
              visitReason,
              location: { type: locationType, address: locationType === "in_person" ? address : "Virtual" },
              duration,
            },
          },
        },
      });

      // Schedule reminder email 1 hour before appointment
      const reminderTime = dateTime.getTime() - (60 * 60 * 1000); // 1 hour before
      if (reminderTime > Date.now()) {
        await scheduleEmail({
          userId: patient.userId,
          emailType: "appointment_reminder_1h",
          scheduledFor: reminderTime,
          relatedRecordId: "new_appointment",
          relatedRecordType: "appointment",
          emailData: {
            to: patient.email,
            subject: "URGENT: Appointment in 1 Hour - MedScribe",
            templateData: {
              patientName: `${patient.firstName} ${patient.lastName}`,
              doctorName: `${doctorProfile.firstName} ${doctorProfile.lastName}`,
              appointmentDetails: {
                date: dateTime.toLocaleDateString(),
                time: dateTime.toLocaleTimeString(),
                type: appointmentType,
                visitReason,
                location: { type: locationType, address: locationType === "in_person" ? address : "Virtual" },
                duration,
              },
            },
          },
        });
      }

      toast.success("Appointment scheduled successfully!");

      // Reset form and return to treatment details view
      resetAppointmentForm();
      setActiveView("overview");
    } catch (error) {
      toast.error("Failed to schedule appointment. Please try again.");
    } finally {
      setIsCreating(false);
    }
  };

  const resetAppointmentForm = () => {
    setAppointmentType("");
    setVisitReason("");
    setAppointmentDate("");
    setAppointmentTime("");
    setDuration(30);
    setLocationType("in_person");
    setAddress("");
    setRoom("");
    setMeetingLink("");
    setNotes("");
    setInsuranceVerified(false);
    setCopayAmount("");
  };

  // Generate time slots (9 AM to 5 PM in 15-minute intervals)
  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 9; hour < 17; hour++) {
      for (let minute = 0; minute < 60; minute += 15) {
        const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        const displayTime = new Date(`2000-01-01T${timeString}`).toLocaleTimeString([], {
          hour: 'numeric',
          minute: '2-digit',
          hour12: true
        });
        slots.push({ value: timeString, label: displayTime });
      }
    }
    return slots;
  };

  if (!session || session.user.role !== "doctor") {
    return null;
  }

  if (!patient || !doctorProfile || !currentDoctorPatient) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-sm text-muted-foreground">Loading patient details...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const activeTreatments = treatmentPlans?.filter(plan => plan.status === "active") || [];
  const activeMedications = medications?.filter(med => med.status === "active") || [];
  const selectedTreatment = selectedTreatmentId
    ? activeTreatments.find(t => t._id === selectedTreatmentId)
    : null;
  const selectedTreatmentMedications = selectedTreatment
    ? activeMedications.filter(med => med.treatmentPlan?._id === selectedTreatment._id)
    : [];

  // Auto-select first treatment if none selected
  if (!selectedTreatmentId && activeTreatments.length > 0) {
    setSelectedTreatmentId(activeTreatments[0]._id);
  }

  return (
    <DashboardLayout>
      <div className="h-full flex flex-col space-y-4">
        {/* Compact Header */}
        <div className="flex-shrink-0 space-y-1">
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
                    {patient.firstName[0]}{patient.lastName[0]}
                  </AvatarFallback>
                </Avatar>

                <div>
                  <h1 className="text-lg font-semibold">
                    {patient.firstName} {patient.lastName}
                  </h1>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {calculateAge(patient.dateOfBirth)} years
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
                  <div className="text-lg font-bold text-foreground">{activeTreatments.length}</div>
                  <div className="text-xs text-muted-foreground">Active Plans</div>
                </div>
                <div className="w-px h-6 bg-border" />
                <div className="text-right">
                  <div className="text-lg font-bold text-foreground">{activeMedications.length}</div>
                  <div className="text-xs text-muted-foreground">Medications</div>
                </div>
              </div>

              <Button
                size="sm"
                variant="outline"
                onClick={() => setShowChat(!showChat)}
                className="h-8 px-3 text-xs"
              >
                <MessageCircle className="h-3 w-3 mr-1" />
                Chat
              </Button>

              <Button
                size="sm"
                variant="outline"
                onClick={() => setActiveView("appointment-form")}
                className="h-8 px-3 text-xs"
              >
                <Calendar className="h-3 w-3 mr-1" />
                Set Appointment
              </Button>

              <Button
                size="sm"
                onClick={() => setActiveView("treatment-form")}
                className="h-8 px-3 text-xs"
              >
                <Plus className="h-3 w-3 mr-1" />
                Add Treatment
              </Button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 min-h-0">
          {activeView === "treatment-form" ? (
            <Card className="h-full flex flex-col">
              <CardHeader className="pb-3 flex-shrink-0">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Activity className="h-4 w-4 text-blue-600" />
                    Add Treatment Plan
                  </CardTitle>
                  <Button variant="outline" size="sm" onClick={() => setActiveView("overview")}>
                    Cancel
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="flex-1 min-h-0 p-0">
                <ScrollArea className="h-full">
                  <div className="p-4">
                    <AddTreatmentForm
                      doctorPatientId={currentDoctorPatient._id}
                      patientId={patientId}
                      onSuccess={() => setActiveView("overview")}
                      onCancel={() => setActiveView("overview")}
                    />
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          ) : activeView === "medication-form" ? (
            <Card className="h-full flex flex-col">
              <CardHeader className="pb-3 flex-shrink-0">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Pill className="h-4 w-4 text-purple-600" />
                    Add Medication
                  </CardTitle>
                  <Button variant="outline" size="sm" onClick={() => setActiveView("overview")}>
                    Cancel
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="flex-1 min-h-0 p-0">
                <ScrollArea className="h-full">
                  <div className="p-4">
                    <AddMedicationForm
                      treatmentPlanId={selectedTreatmentId as any}
                      onSuccess={() => setActiveView("overview")}
                      onCancel={() => setActiveView("overview")}
                    />
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          ) : (
            <div className={cn(
              "h-full grid gap-4",
              showChat
                ? "grid-cols-1 lg:grid-cols-6"
                : "grid-cols-1 lg:grid-cols-4"
            )}>
              {/* Treatment List - Small on large screens */}
              <div className={cn(
                "flex flex-col min-h-0",
                showChat
                  ? "lg:col-span-1 lg:order-1 order-2"
                  : "lg:col-span-1 lg:order-1 order-2"
              )}>
                <Card className="flex-1 min-h-0 flex flex-col">
                  <CardHeader className="pb-2 flex-shrink-0">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm font-semibold">Treatments</CardTitle>
                      {activeTreatments.length > 0 && (
                        <Badge variant="outline" className="text-xs h-5">
                          {activeTreatments.length}
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="flex-1 min-h-0 p-0">
                    <ScrollArea className="h-full scrollbar-hide">
                      <div className="p-3">
                        {activeTreatments.length === 0 ? (
                          <div className="flex flex-col items-center justify-center py-6 text-center">
                            <Activity className="h-6 w-6 text-muted-foreground mb-2" />
                            <h3 className="font-medium text-sm mb-1">No Active Treatments</h3>
                            <p className="text-xs text-muted-foreground mb-3">
                              Start by adding a treatment plan
                            </p>
                            <Button size="sm" onClick={() => setActiveView("treatment-form")} className="h-7 px-3 text-xs">
                              <Plus className="h-3 w-3 mr-1" />
                              Add Treatment
                            </Button>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            {activeTreatments.map((treatment) => (
                              <div
                                key={treatment._id}
                                className={cn(
                                  "p-3 border rounded-lg cursor-pointer transition-all duration-200 hover:bg-muted/50",
                                  selectedTreatmentId === treatment._id
                                    ? 'border-primary bg-primary/5'
                                    : 'border-border hover:border-primary/50'
                                )}
                                onClick={() => setSelectedTreatmentId(treatment._id)}
                              >
                                <div className="space-y-2">
                                  <div className="flex items-start justify-between gap-2">
                                    <h4 className="font-medium text-sm truncate flex-1">{treatment.title}</h4>
                                    <Badge variant="outline" className="text-xs h-5 px-2">
                                      {treatment.status}
                                    </Badge>
                                  </div>
                                  <p className="text-xs text-muted-foreground truncate">
                                    {treatment.diagnosis}
                                  </p>
                                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                                    <div className="flex items-center gap-3">
                                      <span className="flex items-center gap-1">
                                        <Pill className="h-3 w-3" />
                                        {activeMedications.filter(med => med.treatmentPlan?._id === treatment._id).length}
                                      </span>
                                      <span className="flex items-center gap-1">
                                        <Target className="h-3 w-3" />
                                        {treatment.goals?.length || 0}
                                      </span>
                                    </div>
                                    <span className="text-xs">
                                      {new Date(treatment.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                    </span>
                                  </div>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="h-6 w-full text-xs"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleTreatmentStatusUpdate(treatment._id, "completed");
                                    }}
                                  >
                                    <CheckCircle className="h-3 w-3 mr-1" />
                                    Mark Complete
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>
              </div>

              {/* Treatment Details / Appointment Form - Adjusts based on chat visibility */}
              <div className={cn(
                "flex flex-col min-h-0",
                showChat
                  ? "lg:col-span-3 lg:order-2 order-1"
                  : "lg:col-span-3 lg:order-2 order-1"
              )}>
                <Card className="flex-1 min-h-0 flex flex-col">
                  {activeView === "appointment-form" ? (
                    <>
                      <CardHeader className="pb-3 flex-shrink-0">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-base flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-blue-600" />
                            Schedule Appointment
                          </CardTitle>
                          <Button variant="outline" size="sm" onClick={() => setActiveView("overview")}>
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
                              <Select value={appointmentType} onValueChange={setAppointmentType}>
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
                                value={visitReason}
                                onChange={(e) => setVisitReason(e.target.value)}
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
                                value={appointmentDate}
                                onChange={(e) => setAppointmentDate(e.target.value)}
                                min={new Date().toISOString().split('T')[0]}
                                className="h-9"
                              />
                            </div>

                            <div className="space-y-1">
                              <Label htmlFor="time" className="text-sm font-medium">Time *</Label>
                              <Select value={appointmentTime} onValueChange={setAppointmentTime}>
                                <SelectTrigger className="h-9">
                                  <SelectValue placeholder="Select time" />
                                </SelectTrigger>
                                <SelectContent>
                                  {generateTimeSlots().map((slot) => (
                                    <SelectItem key={slot.value} value={slot.value}>
                                      {slot.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>

                            <div className="space-y-1">
                              <Label htmlFor="duration" className="text-sm font-medium">Duration</Label>
                              <Select value={duration.toString()} onValueChange={(value) => setDuration(parseInt(value))}>
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
                                variant={locationType === "in_person" ? "default" : "outline"}
                                size="sm"
                                onClick={() => setLocationType("in_person")}
                                className="h-8 justify-start"
                              >
                                <MapPin className="h-3 w-3 mr-2" />
                                In-Person
                              </Button>
                              <Button
                                type="button"
                                variant={locationType === "telemedicine" ? "default" : "outline"}
                                size="sm"
                                onClick={() => setLocationType("telemedicine")}
                                className="h-8 justify-start"
                              >
                                <Video className="h-3 w-3 mr-2" />
                                Virtual
                              </Button>
                            </div>
                          </div>

                          {/* Location Details */}
                          {locationType === "in_person" && (
                            <div className="grid grid-cols-2 gap-3">
                              <div className="space-y-1">
                                <Label htmlFor="address" className="text-sm font-medium">Address</Label>
                                <Input
                                  id="address"
                                  placeholder="Clinic address"
                                  value={address}
                                  onChange={(e) => setAddress(e.target.value)}
                                  className="h-9"
                                />
                              </div>
                              <div className="space-y-1">
                                <Label htmlFor="room" className="text-sm font-medium">Room</Label>
                                <Input
                                  id="room"
                                  placeholder="Room number"
                                  value={room}
                                  onChange={(e) => setRoom(e.target.value)}
                                  className="h-9"
                                />
                              </div>
                            </div>
                          )}

                          {locationType === "telemedicine" && (
                            <div className="space-y-1">
                              <Label htmlFor="meetingLink" className="text-sm font-medium">Meeting Link</Label>
                              <Input
                                id="meetingLink"
                                placeholder="Video call link"
                                value={meetingLink}
                                onChange={(e) => setMeetingLink(e.target.value)}
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
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
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
                                  checked={insuranceVerified}
                                  onChange={(e) => setInsuranceVerified(e.target.checked)}
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
                                value={copayAmount}
                                onChange={(e) => setCopayAmount(e.target.value)}
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
                              onClick={() => setActiveView("overview")}
                              size="sm"
                              className="h-8"
                            >
                              Cancel
                            </Button>
                            <Button
                              onClick={handleCreateAppointment}
                              disabled={!appointmentType || !visitReason.trim() || !appointmentDate || !appointmentTime || isCreating}
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
                    </>
                  ) : selectedTreatment ? (
                    <>
                      <CardHeader className="pb-3 flex-shrink-0">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3 flex-1">
                            <div className="p-2 bg-primary/10 rounded-lg">
                              <Activity className="h-4 w-4 text-primary" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <CardTitle className="text-lg mb-1">{selectedTreatment.title}</CardTitle>
                              <p className="text-sm text-muted-foreground">
                                <span className="font-medium">Diagnosis:</span> {selectedTreatment.diagnosis}
                              </p>
                              <div className="flex items-center gap-2 text-xs text-muted-foreground mt-2">
                                <Calendar className="h-3 w-3" />
                                <span>Started {new Date(selectedTreatment.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                                {selectedTreatment.endDate && (
                                  <>
                                    <span>•</span>
                                    <span>Ends {new Date(selectedTreatment.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                          <Badge variant="outline" className="text-sm">
                            {selectedTreatment.status}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="flex-1 min-h-0 p-0">
                        <ScrollArea className="h-full scrollbar-hide">
                          <div className="p-4 space-y-5">
                            {/* Treatment Plan and Goals - Adjacent Layout */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                              {/* Treatment Plan */}
                              <div>
                                <div className="flex items-center gap-2 mb-3">
                                  <FileText className="h-4 w-4 text-muted-foreground" />
                                  <h3 className="font-semibold text-base">Treatment Plan</h3>
                                </div>
                                <div className="bg-muted/50 rounded-lg p-4">
                                  <p className="text-sm leading-relaxed">{selectedTreatment.plan}</p>
                                </div>
                              </div>

                              {/* Goals */}
                              {selectedTreatment.goals && selectedTreatment.goals.length > 0 && (
                                <div>
                                  <div className="flex items-center gap-2 mb-3">
                                    <Target className="h-4 w-4 text-muted-foreground" />
                                    <h3 className="font-semibold text-base">Treatment Goals</h3>
                                  </div>
                                  <div className="space-y-2">
                                    {selectedTreatment.goals.map((goal: string, index: number) => (
                                      <div key={index} className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
                                        <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                                        <span className="text-sm leading-relaxed">{goal}</span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>

                            {/* Medications */}
                            {selectedTreatmentMedications && selectedTreatmentMedications.length > 0 && (
                              <div>
                                <div className="flex items-center gap-2 mb-3">
                                  <Pill className="h-4 w-4 text-muted-foreground" />
                                  <h3 className="font-semibold text-base">Medications ({selectedTreatmentMedications.length})</h3>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => setActiveView("medication-form")}
                                    className="ml-auto h-7 px-3 text-xs"
                                  >
                                    <Plus className="h-3 w-3 mr-1" />
                                    Add
                                  </Button>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                  {selectedTreatmentMedications.map((medication) => (
                                    <div key={medication._id} className="p-3 bg-blue-50/50 dark:bg-blue-950/10 rounded-lg border border-blue-200/50 dark:border-blue-800/50">
                                      <div className="flex items-start justify-between mb-2">
                                        <div className="flex-1 min-w-0">
                                          <h4 className="font-medium text-sm text-foreground">{medication.medicationName}</h4>
                                          <p className="text-xs text-muted-foreground">{medication.dosage} • {medication.frequency}</p>
                                        </div>
                                        <Badge variant="outline" className="text-xs ml-2">
                                          {medication.status}
                                        </Badge>
                                      </div>
                                      {medication.instructions && (
                                        <p className="text-xs text-muted-foreground mt-2">{medication.instructions}</p>
                                      )}
                                      <div className="flex items-center justify-between mt-2">
                                        <span className="text-xs text-muted-foreground">
                                          Started: {new Date(medication.startDate).toLocaleDateString()}
                                        </span>
                                        <Button
                                          size="sm"
                                          variant="outline"
                                          className="h-6 px-2 text-xs"
                                          onClick={() => handleMedicationStatusUpdate(medication._id, "completed")}
                                        >
                                          <CheckCircle className="h-3 w-3 mr-1" />
                                          Complete
                                        </Button>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Add Medication Button if no medications */}
                            {(!selectedTreatmentMedications || selectedTreatmentMedications.length === 0) && (
                              <div className="text-center py-6">
                                <Pill className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
                                <h3 className="font-medium mb-2">No Medications</h3>
                                <p className="text-sm text-muted-foreground mb-4">
                                  Add medications for this treatment plan
                                </p>
                                <Button
                                  size="sm"
                                  onClick={() => setActiveView("medication-form")}
                                >
                                  <Plus className="h-4 w-4 mr-2" />
                                  Add Medication
                                </Button>
                              </div>
                            )}

                            {/* E-Prescribing Section */}
                            <div className="border rounded-xl p-4 bg-blue-50 dark:bg-blue-950/20">
                              <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-2">
                                  <Pill className="h-4 w-4 text-blue-600" />
                                  <h3 className="font-semibold text-base text-blue-900 dark:text-blue-100">E-Prescribing</h3>
                                </div>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => setShowPrescriptionForm(!showPrescriptionForm)}
                                  className="h-8"
                                >
                                  <Plus className="h-3 w-3 mr-1" />
                                  {showPrescriptionForm ? "Hide Form" : "Add Prescription"}
                                </Button>
                              </div>

                              {showPrescriptionForm && (
                                <div className="mt-4">
                                  <PrescriptionForm
                                    patientId={patientId}
                                    treatmentPlanId={selectedTreatmentId as any}
                                    onSuccess={(_prescriptionId) => {
                                      toast.success("Prescription created successfully!");
                                      setShowPrescriptionForm(false);
                                    }}
                                    onCancel={() => setShowPrescriptionForm(false)}
                                  />
                                </div>
                              )}

                              {!showPrescriptionForm && (
                                <div className="space-y-3">
                                  <p className="text-sm text-blue-700 dark:text-blue-300">
                                    Create electronic prescriptions for this treatment plan
                                  </p>
                                  <PrescriptionList patientId={patientId} />
                                </div>
                              )}
                            </div>
                          </div>
                        </ScrollArea>
                      </CardContent>
                    </>
                  ) : (
                    <div className="h-full flex items-center justify-center">
                      <div className="text-center">
                        <Eye className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <h3 className="font-semibold mb-2">Select a Treatment</h3>
                        <p className="text-sm text-muted-foreground">
                          Choose a treatment from the list to view detailed information
                        </p>
                      </div>
                    </div>
                  )}
                </Card>
              </div>

              {/* Chat Interface - Shows when chat is enabled */}
              {showChat && (
                <div className="lg:col-span-2 lg:order-3 order-3 flex flex-col min-h-0">
                  <DoctorPatientChat
                    doctorId={doctorProfile._id}
                    patientId={patientId}
                    patientName={`${patient.firstName} ${patient.lastName}`}
                    onClose={() => setShowChat(false)}
                  />
                </div>
              )}
            </div>
          )}
        </div>


      </div>
    </DashboardLayout>
  );
}