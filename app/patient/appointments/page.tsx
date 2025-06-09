"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Calendar,
  Clock,
  Plus,
  Video,
  MapPin,
  AlertCircle,
  X,
  ExternalLink
} from "lucide-react";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { StatusIndicator } from "@/components/ui/status-indicator";
import { ActionCard, ActionCardGrid } from "@/components/ui/action-card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import Link from "next/link";

export default function PatientAppointmentsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // State for dialogs and interactions
  const [cancelDialog, setCancelDialog] = useState<{
    open: boolean;
    appointmentId: Id<"appointments"> | null;
  }>({ open: false, appointmentId: null });

  const [rescheduleDialog, setRescheduleDialog] = useState<{
    open: boolean;
    appointmentId: Id<"appointments"> | null;
  }>({ open: false, appointmentId: null });

  // Get patient profile
  const patientProfile = useQuery(
    api.patients.getPatientByUserId,
    session?.user?.id ? { userId: session.user.id as any } : "skip"
  );

  // Get upcoming appointments
  const upcomingAppointments = useQuery(
    api.appointments.getUpcomingByPatient,
    patientProfile?._id ? { patientId: patientProfile._id as any } : "skip"
  );

  // Get all appointments to filter past ones
  const allAppointments = useQuery(
    api.appointments.getByPatient,
    patientProfile?._id ? { patientId: patientProfile._id as any } : "skip"
  );

  // Mutations for appointment actions
  const cancelAppointment = useMutation(api.appointments.cancel);
  const rescheduleAppointment = useMutation(api.appointments.reschedule);

  useEffect(() => {
    if (status === "loading") return;

    if (!session) {
      router.push("/auth/login");
      return;
    }

    if (session.user.role !== "patient") {
      router.push("/auth/login");
      return;
    }
  }, [session, status, router]);

  if (status === "loading" || patientProfile === undefined) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!session || session.user.role !== "patient" || !patientProfile) {
    return null;
  }

  // Filter past appointments (completed or cancelled)
  const pastAppointments = allAppointments?.filter(appointment =>
    appointment.status === "completed" ||
    appointment.status === "cancelled" ||
    appointment.appointmentDateTime < Date.now()
  ) || [];

  // Helper functions
  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const getAppointmentTypeLabel = (type: string) => {
    const typeMap: Record<string, string> = {
      'new_patient': 'New Patient',
      'follow_up': 'Follow-up',
      'consultation': 'Consultation',
      'procedure': 'Procedure',
      'telemedicine': 'Telemedicine',
      'emergency': 'Emergency'
    };
    return typeMap[type] || type;
  };

  const getStatusLabel = (status: string) => {
    const statusMap: Record<string, string> = {
      'scheduled': 'Scheduled',
      'confirmed': 'Confirmed',
      'checked_in': 'Checked In',
      'in_progress': 'In Progress',
      'completed': 'Completed',
      'cancelled': 'Cancelled',
      'no_show': 'No Show'
    };
    return statusMap[status] || status;
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'cancelled':
      case 'no_show':
        return 'error';
      case 'in_progress':
        return 'warning';
      default:
        return 'pending';
    }
  };

  // Action handlers
  const handleCancelAppointment = async (appointmentId: Id<"appointments">) => {
    try {
      await cancelAppointment({
        appointmentId,
        reason: "Cancelled by patient"
      });
      setCancelDialog({ open: false, appointmentId: null });
    } catch (error) {
      console.error("Failed to cancel appointment:", error);
    }
  };

  const handleJoinCall = (meetingLink?: string) => {
    if (meetingLink) {
      window.open(meetingLink, '_blank');
    } else {
      // Fallback to a generic telemedicine platform
      window.open('/patient/telemedicine', '_blank');
    }
  };

  return (
    <DashboardLayout>
      <div className="h-full flex flex-col space-y-4">
        {/* Header */}
        <div className="flex-shrink-0 space-y-1">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold tracking-tight">My Appointments</h1>
              <p className="text-muted-foreground text-sm">View and manage your medical appointments</p>
            </div>
            <Link href="/patient/appointments/book">
              <Button size="sm" className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Book Appointment
              </Button>
            </Link>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Upcoming Appointments - Takes 2 columns */}
          <div className="lg:col-span-2 flex flex-col min-h-0">
            <Card className="flex-1 min-h-0 flex flex-col">
              <CardHeader className="pb-3 flex-shrink-0">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">Upcoming Appointments</CardTitle>
                  {upcomingAppointments && upcomingAppointments.length > 0 && (
                    <Badge variant="outline" className="text-xs">
                      {upcomingAppointments.length} scheduled
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="flex-1 min-h-0 p-0">
                <ScrollArea className="h-full scrollbar-hide">
                  <div className="p-4">
                    {!upcomingAppointments || upcomingAppointments.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-8 text-center">
                        <Calendar className="h-8 w-8 text-muted-foreground mb-3" />
                        <h3 className="font-medium mb-2">No upcoming appointments</h3>
                        <p className="text-muted-foreground text-sm mb-3">
                          Schedule your next appointment with your healthcare provider
                        </p>
                        <Link href="/patient/appointments/book">
                          <Button size="sm" className="gap-2">
                            <Plus className="h-4 w-4" />
                            Book Appointment
                          </Button>
                        </Link>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {upcomingAppointments.map((appointment) => {
                          const doctorName = appointment.doctor ?
                            `${appointment.doctor.firstName} ${appointment.doctor.lastName}` :
                            'Unknown Doctor';
                          const doctorInitials = appointment.doctor ?
                            `${appointment.doctor.firstName[0]}${appointment.doctor.lastName[0]}` :
                            'UD';
                          const isTelemedicine = appointment.location?.type === 'telemedicine';
                          const locationText = isTelemedicine ?
                            'Online Meeting' :
                            appointment.location?.address || 'Medical Center';

                          return (
                            <div key={appointment._id} className="p-3 hover:bg-muted/50 transition-colors border rounded-lg">
                              <div className="flex items-center gap-3">
                                {/* Date & Time - Compact */}
                                <div className="flex flex-col items-center gap-1 p-2 rounded bg-primary/5 min-w-[80px]">
                                  <div className="text-xs font-bold">{formatDate(appointment.appointmentDateTime)}</div>
                                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                    <Clock className="h-3 w-3" />
                                    {formatTime(appointment.appointmentDateTime)}
                                  </div>
                                  <div className="text-xs text-muted-foreground">
                                    {appointment.duration}min
                                  </div>
                                </div>

                                {/* Doctor Info - Compact */}
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2">
                                    <Avatar className="h-8 w-8">
                                      <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                                        {doctorInitials}
                                      </AvatarFallback>
                                    </Avatar>
                                    <div className="min-w-0">
                                      <h3 className="font-medium text-sm truncate">{doctorName}</h3>
                                      <p className="text-xs text-muted-foreground truncate">
                                        {appointment.doctor?.primarySpecialty || 'General Practice'}
                                      </p>
                                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                        {isTelemedicine ? (
                                          <Video className="h-3 w-3" />
                                        ) : (
                                          <MapPin className="h-3 w-3" />
                                        )}
                                        <span className="truncate">{locationText}</span>
                                      </div>
                                    </div>
                                  </div>
                                </div>

                                {/* Status & Actions */}
                                <div className="flex flex-col gap-1 items-end">
                                  <div className="flex items-center gap-1">
                                    <Badge variant="outline" className="text-xs h-5">
                                      {getAppointmentTypeLabel(appointment.appointmentType)}
                                    </Badge>
                                    <StatusIndicator
                                      status={getStatusVariant(appointment.status)}
                                      label={getStatusLabel(appointment.status)}
                                      variant="pill"
                                      size="sm"
                                    />
                                  </div>
                                  <div className="flex gap-1">
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      className="h-6 px-2 text-xs"
                                      onClick={() => setRescheduleDialog({ open: true, appointmentId: appointment._id })}
                                    >
                                      <Calendar className="h-3 w-3" />
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      className="h-6 px-2 text-xs"
                                      onClick={() => setCancelDialog({ open: true, appointmentId: appointment._id })}
                                    >
                                      <X className="h-3 w-3" />
                                    </Button>
                                    {isTelemedicine && (
                                      <Button
                                        size="sm"
                                        className="h-6 px-2 text-xs"
                                        onClick={() => handleJoinCall(appointment.location?.meetingLink)}
                                      >
                                        <Video className="h-3 w-3" />
                                      </Button>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>

          {/* Right Sidebar - Past Appointments & Quick Actions */}
          <div className="flex flex-col space-y-4 min-h-0">
            {/* Past Appointments */}
            <Card className="flex-1 min-h-0 flex flex-col">
              <CardHeader className="pb-3 flex-shrink-0">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">Past Appointments</CardTitle>
                  {pastAppointments.length > 0 && (
                    <Badge variant="outline" className="text-xs">
                      {pastAppointments.length} completed
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="flex-1 min-h-0 p-0">
                <ScrollArea className="h-full scrollbar-hide">
                  <div className="p-4">

                    {pastAppointments.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-8 text-center">
                        <Clock className="h-8 w-8 text-muted-foreground mb-3" />
                        <p className="text-sm text-muted-foreground">No past appointments</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {pastAppointments.slice(0, 8).map((appointment) => {
                          const doctorName = appointment.doctor ?
                            `${appointment.doctor.firstName} ${appointment.doctor.lastName}` :
                            'Unknown Doctor';
                          const doctorInitials = appointment.doctor ?
                            `${appointment.doctor.firstName[0]}${appointment.doctor.lastName[0]}` :
                            'UD';

                          return (
                            <div key={appointment._id} className="p-2 hover:bg-muted/50 transition-colors rounded">
                              <div className="flex items-center gap-2">
                                <Avatar className="h-6 w-6">
                                  <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                                    {doctorInitials}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center justify-between">
                                    <h4 className="font-medium text-xs truncate">{doctorName}</h4>
                                    <div className="text-xs text-muted-foreground">
                                      {formatDate(appointment.appointmentDateTime)}
                                    </div>
                                  </div>
                                  <div className="flex items-center justify-between">
                                    <p className="text-xs text-muted-foreground truncate">
                                      {appointment.doctor?.primarySpecialty || 'General Practice'}
                                    </p>
                                    <div className="flex items-center gap-1">
                                      <Badge variant="outline" className="text-xs h-4 px-1">
                                        {getAppointmentTypeLabel(appointment.appointmentType)}
                                      </Badge>
                                      <StatusIndicator
                                        status={getStatusVariant(appointment.status)}
                                        label={getStatusLabel(appointment.status)}
                                        variant="pill"
                                        size="sm"
                                      />
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                        {pastAppointments.length > 8 && (
                          <div className="pt-2 border-t">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="w-full h-6 text-xs"
                              onClick={() => router.push("/patient/appointments/history")}
                            >
                              View all {pastAppointments.length} appointments
                            </Button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="flex-shrink-0">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="p-3 pt-0">
                <div className="grid grid-cols-3 gap-1">
                  <ActionCard
                    title="Book"
                    description="New appointment"
                    icon={<Calendar className="h-5 w-5" />}
                    href="/patient/appointments/book"
                    className="border-0 shadow-none p-2 text-xs"
                  />
                  <ActionCard
                    title="Virtual"
                    description="Online consultation"
                    icon={<Video className="h-5 w-5" />}
                    href="/patient/appointments/virtual"
                    className="border-0 shadow-none p-2 text-xs"
                  />
                  <ActionCard
                    title="Emergency"
                    description="Immediate help"
                    icon={<AlertCircle className="h-5 w-5" />}
                    href="/patient/emergency"
                    className="border-0 shadow-none p-2 text-xs"
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Cancel Appointment Dialog */}
      <Dialog open={cancelDialog.open} onOpenChange={(open) => setCancelDialog({ open, appointmentId: null })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel Appointment</DialogTitle>
            <DialogDescription>
              Are you sure you want to cancel this appointment? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setCancelDialog({ open: false, appointmentId: null })}
            >
              Keep Appointment
            </Button>
            <Button
              variant="destructive"
              onClick={() => cancelDialog.appointmentId && handleCancelAppointment(cancelDialog.appointmentId)}
            >
              Cancel Appointment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reschedule Appointment Dialog */}
      <Dialog open={rescheduleDialog.open} onOpenChange={(open) => setRescheduleDialog({ open, appointmentId: null })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reschedule Appointment</DialogTitle>
            <DialogDescription>
              Contact your healthcare provider to reschedule this appointment.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setRescheduleDialog({ open: false, appointmentId: null })}
            >
              Close
            </Button>
            <Button onClick={() => router.push('/patient/appointments/book')}>
              Book New Appointment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
