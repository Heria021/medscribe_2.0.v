"use client";

import React, { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { useSession } from "next-auth/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Activity,
  Calendar,
  FileText,
  Target,
  User,
  Edit,
  MoreHorizontal,
  Clock,
  CheckCircle,
  AlertTriangle,
  Pill,
  MapPin,
  Eye,
  Stethoscope,
  Building2,
  Hash,
  Timer,
  RefreshCw,
  Package,
  Truck,
  ShoppingCart,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import type { Id } from "@/convex/_generated/dataModel";
import { PatientSlotSelector } from "@/components/appointments/PatientSlotSelector";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

interface TreatmentDetailsProps {
  treatmentId: string;
  onView?: () => void;
  onStatusChange?: (status: string) => void;
  className?: string;
}

interface ScheduleAppointmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  treatment: any;
  doctorProfile: any;
}

// Zod schema for appointment form validation
const appointmentFormSchema = z.object({
  appointmentType: z.string().min(1, "Please select an appointment type"),
  visitReason: z.string().min(1, "Please provide a visit reason").min(10, "Visit reason must be at least 10 characters"),
  notes: z.string().optional(),
  selectedSlotId: z.string().min(1, "Please select a time slot"),
});

type AppointmentFormValues = z.infer<typeof appointmentFormSchema>;

/**
 * ScheduleAppointmentDialog Component
 *
 * Beautiful UI with proven appointment creation logic
 * Uses the same API calls as SlotBasedAppointmentForm but with our custom UI
 */
const ScheduleAppointmentDialog = React.memo<ScheduleAppointmentDialogProps>(({
  open,
  onOpenChange,
  treatment,
  doctorProfile,
}) => {
  const [selectedSlot, setSelectedSlot] = useState<any>(null);

  // React Hook Form setup
  const form = useForm<AppointmentFormValues>({
    resolver: zodResolver(appointmentFormSchema),
    defaultValues: {
      appointmentType: "follow_up",
      visitReason: "",
      notes: "",
      selectedSlotId: "",
    },
  });

  const { handleSubmit, formState: { isSubmitting }, reset, setValue, watch } = form;
  const selectedSlotId = watch("selectedSlotId");

  // Use the same mutation as SlotBasedAppointmentForm
  const createAppointmentWithSlot = useMutation(api.appointments.createWithSlot);

  // Get doctor-patient relationship
  const patientId = treatment?.patient?._id;
  const doctorPatientRelationship = useQuery(
    api.doctorPatients.getDoctorPatientRelationship,
    treatment && doctorProfile && patientId ? {
      doctorId: doctorProfile._id,
      patientId
    } : "skip"
  );

  const handleSlotSelect = (slotId: string, slotInfo: any) => {
    setValue("selectedSlotId", slotId);
    setSelectedSlot(slotInfo);
  };

  const formatTime = (time: string) => {
    return new Date(`2000-01-01T${time}`).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const handleClose = () => {
    reset();
    setSelectedSlot(null);
    onOpenChange(false);
  };

  // Use the exact same appointment creation logic as SlotBasedAppointmentForm
  const onSubmit = async (values: AppointmentFormValues) => {
    if (!treatment || !doctorProfile || !doctorPatientRelationship) {
      toast.error("Missing required data. Please try again.");
      return;
    }

    try {
      const appointmentId = await createAppointmentWithSlot({
        doctorPatientId: doctorPatientRelationship._id,
        slotId: values.selectedSlotId as Id<"timeSlots">,
        appointmentType: values.appointmentType as any,
        visitReason: values.visitReason,
        location: {
          type: "in_person",
          address: "Clinic",
        },
        notes: values.notes,
        insuranceVerified: false,
      });

      toast.success("Follow-up appointment scheduled successfully!");
      handleClose();
    } catch (error) {
      console.error("Failed to schedule appointment:", error);
      toast.error("Failed to schedule appointment. Please try again.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl h-[90vh] p-0 flex flex-col overflow-hidden">
        <div className="flex-shrink-0 p-6 pb-4">
          <DialogHeader className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <Calendar className="h-4 w-4 text-primary" />
              </div>
              <DialogTitle className="text-lg">Schedule Follow-up Appointment</DialogTitle>
            </div>

            {/* Treatment Info Card */}
            {treatment && (
              <div className="p-3 bg-muted/30 rounded-lg border-border/50 border">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Activity className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium text-sm">
                        {treatment.title}
                      </h4>
                      <Badge variant="outline" className="text-xs h-5 px-1.5">
                        Treatment Plan
                      </Badge>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                      <span>Status: {treatment.status}</span>
                      <span>Started: {new Date(treatment.startDate).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <DialogDescription className="text-sm text-muted-foreground">
              Schedule a follow-up appointment for this treatment plan.
            </DialogDescription>
          </DialogHeader>
        </div>

        {/* Scrollable Content Area with Beautiful Form */}
        <div className="flex-1 min-h-0 overflow-hidden">
          <ScrollArea className="h-full">
            <div className="px-6 pb-6">
              <Form {...form}>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  {/* Visit Reason */}
                  <FormField
                    control={form.control}
                    name="visitReason"
                    render={({ field }) => (
                      <FormItem>
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-primary"></div>
                          <FormLabel className="text-sm font-medium">
                            Visit Reason
                          </FormLabel>
                        </div>
                        <FormControl>
                          <Textarea
                            placeholder="Describe the reason for this follow-up appointment..."
                            className="min-h-[80px] resize-none border-border/50 focus:border-primary/50 transition-colors"
                            disabled={isSubmitting}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Appointment Type */}
                  <FormField
                    control={form.control}
                    name="appointmentType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium">Appointment Type</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isSubmitting}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select appointment type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="follow_up">Follow-up</SelectItem>
                            <SelectItem value="consultation">Consultation</SelectItem>
                            <SelectItem value="procedure">Procedure</SelectItem>
                            <SelectItem value="telemedicine">Telemedicine</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Time Slot Selection */}
                  <FormField
                    control={form.control}
                    name="selectedSlotId"
                    render={({ field }) => (
                      <FormItem>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
                              <FormLabel className="text-sm font-medium">Select Time Slot</FormLabel>
                              {selectedSlot && (
                                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                  <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
                                  Time selected
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="border rounded-xl p-4 bg-gradient-to-br from-muted/30 to-muted/10">
                            <PatientSlotSelector
                              doctorId={doctorProfile._id}
                              onSlotSelect={handleSlotSelect}
                              selectedSlotId={selectedSlotId}
                              showNextAvailable={true}
                            />
                          </div>

                          {selectedSlot && (
                            <div className="flex items-start gap-3 p-3 rounded-lg bg-green-50 border border-green-200 dark:bg-green-950/20 dark:border-green-800/30">
                              <div className="w-5 h-5 rounded-full bg-green-100 dark:bg-green-900/50 flex items-center justify-center flex-shrink-0 mt-0.5">
                                <div className="w-2 h-2 rounded-full bg-green-600 dark:bg-green-400"></div>
                              </div>
                              <div className="space-y-1">
                                <p className="text-sm font-medium text-green-800 dark:text-green-200">
                                  Time slot selected
                                </p>
                                <p className="text-xs text-green-700 dark:text-green-300">
                                  {new Date(`${selectedSlot.date}T${selectedSlot.time}`).toLocaleDateString('en-US', {
                                    weekday: 'long',
                                    month: 'long',
                                    day: 'numeric'
                                  })} at {formatTime(selectedSlot.time)}
                                </p>
                              </div>
                            </div>
                          )}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Additional Notes */}
                  <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium">Additional Notes</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Any additional notes for the appointment..."
                            className="min-h-[60px] resize-none border-border/50 focus:border-primary/50 transition-colors"
                            disabled={isSubmitting}
                            {...field}
                          />
                        </FormControl>
                        <FormDescription className="text-xs text-muted-foreground">
                          Optional notes that will be included with the appointment.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Form Actions */}
                  <div className="flex justify-end gap-2 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleClose}
                      disabled={isSubmitting}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? "Scheduling..." : "Schedule Appointment"}
                    </Button>
                  </div>
                </form>
              </Form>
            </div>
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
});

ScheduleAppointmentDialog.displayName = "ScheduleAppointmentDialog";

/**
 * TreatmentDetails Component
 *
 * Clean, detailed, grid-based treatment details view
 * Optimized for information density and visual hierarchy
 */
export const TreatmentDetails = React.memo<TreatmentDetailsProps>(({
  treatmentId,
  onView,
  onStatusChange,
  className,
}) => {
  // Dialog state
  const [scheduleDialogOpen, setScheduleDialogOpen] = useState(false);

  // Get session for doctor profile
  const { data: session } = useSession();

  // Fetch treatment details with all related data
  const treatment = useQuery(
    api.treatmentPlans.getWithDetailsById,
    treatmentId ? { id: treatmentId as Id<"treatmentPlans"> } : "skip"
  );

  // Fetch prescription orders for this treatment plan
  const prescriptionOrders = useQuery(
    api.prescriptionOrders.getOrdersByTreatmentPlanId,
    treatmentId ? { treatmentPlanId: treatmentId as Id<"treatmentPlans"> } : "skip"
  );

  // Get current doctor profile
  const doctorProfile = useQuery(
    api.doctors.getDoctorProfile,
    session?.user?.id ? { userId: session.user.id as any } : "skip"
  );

  // Loading state
  if (treatment === undefined) {
    return (
      <Card className={cn("h-full flex flex-col gap-0 py-0", className)}>
        {/* Loading Header */}
        <div className="p-0 flex-shrink-0">
          <div className="relative overflow-hidden rounded-t-lg bg-gradient-to-r from-muted/50 via-muted/30 to-transparent">
            <div className="relative px-4 py-3 flex items-center gap-3">
              <Skeleton className="w-8 h-8 rounded-lg" />
              <div className="flex-1">
                <Skeleton className="h-5 w-40 mb-1" />
                <Skeleton className="h-3 w-32" />
              </div>
              <Skeleton className="h-6 w-16 rounded-full" />
            </div>
          </div>
        </div>

        <CardContent className="flex-1 min-h-0 p-6">
          <div className="space-y-6">
            {/* Header skeleton */}
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <Skeleton className="h-6 w-64" />
                <Skeleton className="h-4 w-48" />
              </div>
              <div className="flex gap-2">
                <Skeleton className="h-8 w-16" />
                <Skeleton className="h-8 w-8" />
              </div>
            </div>

            {/* Info grid skeleton */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-20 w-full" />
              ))}
            </div>

            {/* Content skeleton */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-32 w-full" />
            </div>
            <Skeleton className="h-48 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  // Treatment not found
  if (!treatment) {
    return (
      <Card className={cn("h-full flex flex-col gap-0 py-0", className)}>
        {/* Header */}
        <div className="p-0 flex-shrink-0">
          <div className="relative overflow-hidden rounded-t-lg bg-gradient-to-r from-muted/50 via-muted/30 to-transparent">
            <div className="relative px-4 py-3 flex items-center gap-3">
              <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                <Activity className="h-4 w-4 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="text-base font-semibold tracking-tight text-foreground">
                  Treatment Details
                </h3>
                <p className="text-xs text-muted-foreground">
                  View and manage treatment plan
                </p>
              </div>
            </div>
          </div>
        </div>

        <CardContent className="flex-1 min-h-0 p-0">
          <div className="h-full flex items-center justify-center p-12">
            <div className="text-center">
              <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Treatment not found</h3>
              <p className="text-muted-foreground">
                The requested treatment plan could not be found.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-primary/10 text-primary border-primary/20";
      case "completed":
        return "bg-primary/10 text-primary border-primary/20";
      case "discontinued":
        return "bg-destructive/10 text-destructive border-destructive/20";
      default:
        return "bg-muted text-muted-foreground border-border";
    }
  };

  const formatShortDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatLongDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <Card className={cn("h-full flex flex-col gap-0 py-0", className)}>
      {/* Header */}
      <div className="p-0 flex-shrink-0">
        <div className="relative overflow-hidden rounded-t-lg bg-gradient-to-r from-muted/50 via-muted/30 to-transparent">
          <div className="relative px-4 py-3 flex items-center gap-3">
            <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
              <Activity className="h-4 w-4 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="text-base font-semibold tracking-tight text-foreground">
                Treatment Details
              </h3>
              <p className="text-xs text-muted-foreground">
                View and manage treatment plan
              </p>
            </div>
            <Badge
              variant="outline"
              className={cn("capitalize", getStatusColor(treatment.status))}
            >
              {treatment.status === "active" && <CheckCircle className="h-3 w-3 mr-1" />}
              {treatment.status === "completed" && <CheckCircle className="h-3 w-3 mr-1" />}
              {treatment.status === "discontinued" && <AlertTriangle className="h-3 w-3 mr-1" />}
              {treatment.status}
            </Badge>
          </div>
        </div>
      </div>

      <CardContent className="flex-1 min-h-0 p-0">
        <ScrollArea className="h-full">
          <div className="p-6 space-y-6">
          {/* Treatment Header - Clean and Prominent */}
          <div className="space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <h1 className="text-2xl font-bold text-foreground mb-2">{treatment.title}</h1>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Started {formatLongDate(treatment.startDate)}
                  </span>
                  {treatment.endDate && (
                    <span className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      Ends {formatLongDate(treatment.endDate)}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Badge
                  variant="outline"
                  className={cn("text-sm px-3 py-1", getStatusColor(treatment.status))}
                >
                  {treatment.status === "active" && <CheckCircle className="h-4 w-4 mr-2" />}
                  {treatment.status === "completed" && <CheckCircle className="h-4 w-4 mr-2" />}
                  {treatment.status === "discontinued" && <AlertTriangle className="h-4 w-4 mr-2" />}
                  <span className="capitalize font-medium">{treatment.status}</span>
                </Badge>

                {onView && (
                  <Button variant="outline" size="sm" onClick={onView} className="gap-2">
                    <Eye className="h-4 w-4" />
                    View Full
                  </Button>
                )}

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    {treatment.status === "active" && (
                      <DropdownMenuItem onClick={() => onStatusChange?.("completed")}>
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Mark Complete
                      </DropdownMenuItem>
                    )}
                    {treatment.status === "active" && (
                      <DropdownMenuItem onClick={() => onStatusChange?.("discontinued")}>
                        <AlertTriangle className="h-4 w-4 mr-2" />
                        Discontinue
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>

          {/* Enhanced Information Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Primary Diagnosis */}
            <div className="p-4 bg-muted/30 rounded-lg border border-border">
              <div className="flex items-center gap-2 mb-3">
                <div className="p-1.5 bg-primary/10 rounded">
                  <FileText className="h-4 w-4 text-primary" />
                </div>
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Primary Diagnosis</span>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-foreground leading-relaxed">{treatment.diagnosis}</p>
                <p className="text-xs text-muted-foreground">Medical condition identified</p>
              </div>
            </div>

            {/* Treatment Plan */}
            <div className="p-4 bg-muted/30 rounded-lg border border-border">
              <div className="flex items-center gap-2 mb-3">
                <div className="p-1.5 bg-primary/10 rounded">
                  <Activity className="h-4 w-4 text-primary" />
                </div>
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Treatment Plan</span>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-foreground leading-relaxed">{treatment.plan}</p>
                <p className="text-xs text-muted-foreground">Therapeutic approach and interventions</p>
              </div>
            </div>

            {/* Pharmacy Information */}
            {treatment.pharmacy ? (
              <div className="p-4 bg-muted/30 rounded-lg border border-border">
                <div className="flex items-center gap-2 mb-3">
                  <div className="p-1.5 bg-primary/10 rounded">
                    <Building2 className="h-4 w-4 text-primary" />
                  </div>
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Pharmacy</span>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-foreground">{treatment.pharmacy.name}</p>
                  {treatment.pharmacy.chainName && (
                    <p className="text-xs text-muted-foreground">{treatment.pharmacy.chainName}</p>
                  )}
                  {treatment.pharmacy.address && (
                    <p className="text-xs text-muted-foreground">
                      {treatment.pharmacy.address.street}, {treatment.pharmacy.address.city}, {treatment.pharmacy.address.state} {treatment.pharmacy.address.zipCode}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    {treatment.medicationDetails?.length || 0} prescription{(treatment.medicationDetails?.length || 0) !== 1 ? 's' : ''} sent
                  </p>
                </div>
              </div>
            ) : (
              <div className="p-4 bg-muted/30 rounded-lg border border-border">
                <div className="flex items-center gap-2 mb-3">
                  <div className="p-1.5 bg-primary/10 rounded">
                    <Building2 className="h-4 w-4 text-primary" />
                  </div>
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Pharmacy</span>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-foreground">No pharmacy selected</p>
                  <p className="text-xs text-muted-foreground">Pharmacy can be assigned later</p>
                </div>
              </div>
            )}

            {/* Treatment Goals */}
            {treatment.goals && treatment.goals.length > 0 ? (
              <div className="p-4 bg-muted/30 rounded-lg border border-border">
                <div className="flex items-center gap-2 mb-3">
                  <div className="p-1.5 bg-primary/10 rounded">
                    <Target className="h-4 w-4 text-primary" />
                  </div>
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Treatment Goals</span>
                </div>
                <div className="space-y-2">
                  {treatment.goals.slice(0, 2).map((goal, index) => (
                    <div key={index} className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0" />
                      <p className="text-sm text-foreground leading-relaxed">{goal}</p>
                    </div>
                  ))}
                  {treatment.goals.length > 2 && (
                    <p className="text-xs text-muted-foreground mt-2">
                      +{treatment.goals.length - 2} more goal{treatment.goals.length - 2 !== 1 ? 's' : ''}
                    </p>
                  )}
                </div>
              </div>
            ) : (
              <div className="p-4 bg-muted/30 rounded-lg border border-border">
                <div className="flex items-center gap-2 mb-3">
                  <div className="p-1.5 bg-muted/20 rounded">
                    <Target className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Treatment Goals</span>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-foreground">No goals set</p>
                  <p className="text-xs text-muted-foreground">Treatment goals can be added</p>
                </div>
              </div>
            )}
          </div>

          {/* Main Content Sections */}
          <div className="space-y-6">

            {/* Actions Section - Standardized UI */}
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Calendar className="h-5 w-5 text-primary" />
                </div>
                <h2 className="text-lg font-semibold text-foreground">Treatment Actions</h2>
              </div>
              <div className="grid gap-3">
                <Button
                  variant="outline"
                  className="h-auto p-4 justify-start hover:bg-muted/50 border-border/50"
                  onClick={() => setScheduleDialogOpen(true)}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Calendar className="h-5 w-5 text-primary" />
                    </div>
                    <div className="text-left">
                      <div className="font-medium">Schedule Follow-up Appointment</div>
                      <div className="text-sm text-muted-foreground">Book a follow-up visit for this treatment</div>
                    </div>
                  </div>
                </Button>
              </div>
            </div>

            {/* Medications - Enhanced Grid Layout */}
            {treatment.medicationDetails && treatment.medicationDetails.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Pill className="h-5 w-5 text-primary" />
                  </div>
                  <h2 className="text-lg font-semibold text-foreground">Prescribed Medications</h2>
                  <Badge variant="secondary" className="ml-auto">
                    {treatment.medicationDetails.length} {treatment.medicationDetails.length === 1 ? 'Medication' : 'Medications'}
                  </Badge>
                </div>
                <div className="space-y-2">
                  {treatment.medicationDetails.map((medication, index) => (
                    <div key={index} className="group relative bg-card border border-border rounded-lg hover:border-primary/30 transition-all duration-200 hover:shadow-sm">
                      {/* Compact Header Row */}
                      <div className="flex items-center justify-between p-3 pb-2">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          {/* Medication Icon & Name */}
                          <div className="flex items-center gap-2 flex-1 min-w-0">
                            <div className="flex-shrink-0 w-8 h-8 bg-primary/10 rounded-md flex items-center justify-center">
                              <Pill className="h-4 w-4 text-primary" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <h4 className="font-semibold text-sm text-foreground truncate">{medication.name}</h4>
                                <Badge variant="outline" className="text-xs px-1.5 py-0.5 h-5 bg-primary/5 text-primary border-primary/20">
                                  {medication.strength}
                                </Badge>
                              </div>
                              {medication.genericName && (
                                <p className="text-xs text-muted-foreground truncate">Generic: {medication.genericName}</p>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Quick Stats */}
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Hash className="h-3 w-3" />
                            <span>{medication.quantity}</span>
                          </div>
                          {medication.refills > 0 && (
                            <div className="flex items-center gap-1">
                              <RefreshCw className="h-3 w-3" />
                              <span>{medication.refills}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-1">
                            <Timer className="h-3 w-3" />
                            <span className="font-medium">{medication.frequency}</span>
                          </div>
                        </div>
                      </div>

                      {/* Compact Details Grid */}
                      <div className="px-3 pb-3">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                          {/* Left: Dosage & Form */}
                          <div className="space-y-1">
                            <div className="flex items-center gap-4 text-xs">
                              <div className="flex items-center gap-1.5 text-muted-foreground">
                                <Activity className="h-3 w-3" />
                                <span className="font-medium">Form:</span>
                              </div>
                              <span className="text-foreground capitalize">{medication.dosageForm}</span>
                            </div>
                            {medication.duration && (
                              <div className="flex items-center gap-4 text-xs">
                                <div className="flex items-center gap-1.5 text-muted-foreground">
                                  <Calendar className="h-3 w-3" />
                                  <span className="font-medium">Duration:</span>
                                </div>
                                <span className="text-foreground">{medication.duration}</span>
                              </div>
                            )}
                            {medication.ndc && (
                              <div className="flex items-center gap-4 text-xs">
                                <div className="flex items-center gap-1.5 text-muted-foreground">
                                  <Hash className="h-3 w-3" />
                                  <span className="font-medium">NDC:</span>
                                </div>
                                <span className="text-foreground font-mono">{medication.ndc}</span>
                              </div>
                            )}
                          </div>

                          {/* Right: Instructions */}
                          <div className="space-y-1">
                            <div className="flex items-start gap-1.5 text-xs">
                              <FileText className="h-3 w-3 text-muted-foreground mt-0.5 flex-shrink-0" />
                              <div className="flex-1 min-w-0">
                                <span className="font-medium text-muted-foreground">Instructions: </span>
                                <span className="text-foreground leading-relaxed">{medication.instructions}</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Professional Footer */}
                        <div className="mt-2 pt-2 border-t border-border/50 flex items-center justify-between text-xs">
                          <div className="flex items-center gap-3 text-muted-foreground">
                            {medication.rxcui && (
                              <span className="font-mono">RxCUI: {medication.rxcui}</span>
                            )}
                            <span className="capitalize">{medication.dosageForm} form</span>
                          </div>
                          <div className="flex items-center gap-1 text-primary">
                            <CheckCircle className="h-3 w-3" />
                            <span className="font-medium">Active</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Prescription Orders - Pharmacy Fulfillment Details */}
            {prescriptionOrders && prescriptionOrders.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Package className="h-5 w-5 text-primary" />
                  </div>
                  <h2 className="text-lg font-semibold text-foreground">Prescription Orders</h2>
                  <Badge variant="secondary" className="ml-auto">
                    {prescriptionOrders.length} {prescriptionOrders.length === 1 ? 'Order' : 'Orders'}
                  </Badge>
                </div>
                <div className="space-y-3">
                  {prescriptionOrders.map((order, index) => {
                    const getStatusColor = (status: string) => {
                      switch (status) {
                        case "pending":
                          return "bg-yellow-100 text-yellow-800 border-yellow-200";
                        case "processing":
                          return "bg-blue-100 text-blue-800 border-blue-200";
                        case "ready":
                          return "bg-green-100 text-green-800 border-green-200";
                        case "picked_up":
                        case "delivered":
                          return "bg-primary/10 text-primary border-primary/20";
                        case "cancelled":
                        case "on_hold":
                          return "bg-destructive/10 text-destructive border-destructive/20";
                        default:
                          return "bg-muted text-muted-foreground border-border";
                      }
                    };

                    const getStatusIcon = (status: string) => {
                      switch (status) {
                        case "pending":
                          return <Clock className="h-3 w-3" />;
                        case "processing":
                          return <RefreshCw className="h-3 w-3" />;
                        case "ready":
                          return <CheckCircle className="h-3 w-3" />;
                        case "picked_up":
                          return <ShoppingCart className="h-3 w-3" />;
                        case "delivered":
                          return <Truck className="h-3 w-3" />;
                        case "cancelled":
                        case "on_hold":
                          return <AlertTriangle className="h-3 w-3" />;
                        default:
                          return <Clock className="h-3 w-3" />;
                      }
                    };

                    return (
                      <div key={index} className="p-4 bg-muted/30 rounded-lg border border-border">
                        <div className="space-y-3">
                          {/* Order Header */}
                          <div className="flex items-start justify-between">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <h4 className="font-semibold text-foreground">{order.medicationDetails.name}</h4>
                                <Badge variant="outline" className={`text-xs ${getStatusColor(order.status)}`}>
                                  {getStatusIcon(order.status)}
                                  <span className="ml-1 capitalize">{order.status.replace('_', ' ')}</span>
                                </Badge>
                              </div>
                              <p className="text-xs text-muted-foreground">Order #{order.orderNumber}</p>
                            </div>
                            {order.estimatedReadyTime && (
                              <div className="text-right">
                                <p className="text-xs text-muted-foreground">Est. Ready</p>
                                <p className="text-sm font-medium text-foreground">
                                  {new Date(order.estimatedReadyTime).toLocaleDateString()}
                                </p>
                              </div>
                            )}
                          </div>

                          {/* Order Details Grid */}
                          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                            {/* Medication Details */}
                            <div className="space-y-1">
                              <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                                <Pill className="h-3 w-3" />
                                Medication
                              </div>
                              <p className="text-sm text-foreground">{order.medicationDetails.dosage}</p>
                              <p className="text-xs text-muted-foreground">Qty: {order.medicationDetails.quantity}</p>
                            </div>

                            {/* Pharmacy Details */}
                            {order.pharmacy && (
                              <div className="space-y-1">
                                <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                                  <Building2 className="h-3 w-3" />
                                  Pharmacy
                                </div>
                                <p className="text-sm font-semibold text-foreground">{order.pharmacy.name}</p>
                                {order.pharmacy.chainName && (
                                  <p className="text-xs text-muted-foreground">{order.pharmacy.chainName}</p>
                                )}
                              </div>
                            )}

                            {/* Delivery Method */}
                            <div className="space-y-1">
                              <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                                {order.deliveryMethod === "delivery" ? <Truck className="h-3 w-3" /> : <ShoppingCart className="h-3 w-3" />}
                                Fulfillment
                              </div>
                              <p className="text-sm text-foreground capitalize">{order.deliveryMethod}</p>
                              {order.deliveryMethod === "delivery" && order.deliveryAddress && (
                                <p className="text-xs text-muted-foreground">
                                  {order.deliveryAddress.street}, {order.deliveryAddress.city}
                                </p>
                              )}
                            </div>
                          </div>

                          {/* Pharmacy Notes */}
                          {order.pharmacyNotes && (
                            <div className="p-3 bg-background rounded border">
                              <div className="flex items-center gap-2 mb-2">
                                <Building2 className="h-4 w-4 text-primary" />
                                <span className="text-sm font-medium text-foreground">Pharmacy Notes</span>
                              </div>
                              <p className="text-sm text-muted-foreground">{order.pharmacyNotes}</p>
                            </div>
                          )}

                          {/* Timestamps */}
                          <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t border-border">
                            <span>Ordered: {new Date(order.createdAt).toLocaleDateString()}</span>
                            {order.actualReadyTime && (
                              <span>Ready: {new Date(order.actualReadyTime).toLocaleDateString()}</span>
                            )}
                            {order.pickedUpAt && (
                              <span>Picked up: {new Date(order.pickedUpAt).toLocaleDateString()}</span>
                            )}
                            {order.deliveredAt && (
                              <span>Delivered: {new Date(order.deliveredAt).toLocaleDateString()}</span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          </div>
        </ScrollArea>
      </CardContent>

      {/* Schedule Appointment Dialog */}
      {doctorProfile && (
        <ScheduleAppointmentDialog
          open={scheduleDialogOpen}
          onOpenChange={setScheduleDialogOpen}
          treatment={treatment}
          doctorProfile={doctorProfile}
        />
      )}
    </Card>
  );
});

TreatmentDetails.displayName = "TreatmentDetails";
