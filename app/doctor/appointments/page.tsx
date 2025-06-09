"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useQuery } from "convex/react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import {
  Calendar,
  Clock,
  Plus,
  Video,
  Phone,
  MapPin,
  Search,
  User,
  Mail,
  CheckCircle,
  XCircle,
  AlertCircle,
  PlayCircle
} from "lucide-react";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { api } from "@/convex/_generated/api";

export default function AppointmentsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  // Get doctor profile
  const doctorProfile = useQuery(
    api.doctors.getDoctorProfile,
    session?.user?.id ? { userId: session.user.id as any } : "skip"
  );

  // Get doctor's appointments
  const allAppointments = useQuery(
    api.appointments.getByDoctor,
    doctorProfile ? { doctorId: doctorProfile._id } : "skip"
  );

  useEffect(() => {
    if (status === "loading") return;

    if (!session) {
      router.push("/auth/login");
      return;
    }

    if (session.user.role !== "doctor") {
      router.push("/auth/login");
      return;
    }
  }, [session, status, router]);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!session || session.user.role !== "doctor") {
    return null;
  }

  // Helper functions
  const getStatusColor = (status: string) => {
    switch (status) {
      case "scheduled":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400";
      case "confirmed":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
      case "in_progress":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400";
      case "completed":
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400";
      case "cancelled":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "scheduled":
        return <Clock className="h-3 w-3" />;
      case "confirmed":
        return <CheckCircle className="h-3 w-3" />;
      case "in_progress":
        return <PlayCircle className="h-3 w-3" />;
      case "completed":
        return <CheckCircle className="h-3 w-3" />;
      case "cancelled":
        return <XCircle className="h-3 w-3" />;
      default:
        return <AlertCircle className="h-3 w-3" />;
    }
  };

  const formatTime = (dateTime: number) => {
    return new Date(dateTime).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const formatDate = (dateTime: number) => {
    return new Date(dateTime).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Categorize appointments
  const categorizeAppointments = () => {
    if (!allAppointments) return {};

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const weekFromNow = new Date(today);
    weekFromNow.setDate(weekFromNow.getDate() + 7);

    return {
      today: allAppointments.filter(apt => {
        const aptDate = new Date(apt.appointmentDateTime);
        aptDate.setHours(0, 0, 0, 0);
        return aptDate.getTime() === today.getTime();
      }),
      tomorrow: allAppointments.filter(apt => {
        const aptDate = new Date(apt.appointmentDateTime);
        aptDate.setHours(0, 0, 0, 0);
        return aptDate.getTime() === tomorrow.getTime();
      }),
      thisWeek: allAppointments.filter(apt => {
        const aptDate = new Date(apt.appointmentDateTime);
        return aptDate > tomorrow && aptDate <= weekFromNow;
      }),
      upcoming: allAppointments.filter(apt => {
        const aptDate = new Date(apt.appointmentDateTime);
        return aptDate > weekFromNow;
      }),
      past: allAppointments.filter(apt => {
        const aptDate = new Date(apt.appointmentDateTime);
        return aptDate < today;
      })
    };
  };

  const categories = categorizeAppointments();

  // Filter appointments based on search and category
  const getFilteredAppointments = () => {
    let appointments = [];

    switch (selectedCategory) {
      case "today":
        appointments = categories.today || [];
        break;
      case "tomorrow":
        appointments = categories.tomorrow || [];
        break;
      case "thisWeek":
        appointments = categories.thisWeek || [];
        break;
      case "upcoming":
        appointments = categories.upcoming || [];
        break;
      case "past":
        appointments = categories.past || [];
        break;
      default:
        appointments = allAppointments || [];
    }

    if (searchTerm) {
      appointments = appointments.filter(apt =>
        apt.patient?.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        apt.patient?.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        apt.visitReason?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        apt.appointmentType?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return appointments;
  };

  const filteredAppointments = getFilteredAppointments();

  return (
    <DashboardLayout>
      <div className="space-y-4">
        {/* Header */}
        <div className="space-y-1">
          <h1 className="text-xl font-bold tracking-tight">Appointments</h1>
          <p className="text-muted-foreground text-sm">
            Manage your schedule and upcoming appointments
          </p>
        </div>

        {/* Search and Filters */}
        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search appointments..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 rounded-xl"
            />
          </div>
          <Button className="rounded-lg">
            <Plus className="h-4 w-4 mr-1" />
            Schedule
          </Button>
        </div>

        {/* Category Tabs */}
        <div className="flex items-center gap-1 border-b">
          {[
            { key: "all", label: "All", count: allAppointments?.length || 0 },
            { key: "today", label: "Today", count: categories.today?.length || 0 },
            { key: "tomorrow", label: "Tomorrow", count: categories.tomorrow?.length || 0 },
            { key: "thisWeek", label: "This Week", count: categories.thisWeek?.length || 0 },
            { key: "upcoming", label: "Upcoming", count: categories.upcoming?.length || 0 },
            { key: "past", label: "Past", count: categories.past?.length || 0 },
          ].map((category) => (
            <button
              key={category.key}
              onClick={() => setSelectedCategory(category.key)}
              className={`px-3 py-2 text-sm font-medium border-b-2 transition-colors ${
                selectedCategory === category.key
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              {category.label} ({category.count})
            </button>
          ))}
        </div>

        {/* Appointments List */}
        <div className="border rounded-xl">
          <ScrollArea className="h-[600px]">
            {allAppointments === undefined ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : filteredAppointments.length === 0 ? (
              <div className="flex items-center justify-center py-12 text-center">
                <div className="space-y-4">
                  <Calendar className="h-12 w-12 text-muted-foreground mx-auto" />
                  <h3 className="font-medium">No appointments found</h3>
                  <p className="text-sm text-muted-foreground">
                    {searchTerm ? "Try adjusting your search terms" : "No appointments in this category"}
                  </p>
                  <Button variant="outline" size="sm" className="rounded-lg">
                    <Plus className="h-4 w-4 mr-1" />
                    Schedule Appointment
                  </Button>
                </div>
              </div>
            ) : (
              <div className="divide-y">
                {filteredAppointments.map((appointment: any) => (
                  <div
                    key={appointment._id}
                    className="p-4 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4">
                        {/* Time and Date */}
                        <div className="flex flex-col items-center gap-1 min-w-[80px]">
                          <div className="text-lg font-bold">
                            {formatTime(appointment.appointmentDateTime)}
                          </div>
                          <div className="text-xs text-muted-foreground text-center">
                            {formatDate(appointment.appointmentDateTime)}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {appointment.duration} min
                          </div>
                        </div>

                        {/* Patient Info */}
                        <div className="flex items-start gap-3">
                          <Avatar className="h-12 w-12">
                            <AvatarFallback className="bg-primary/10 text-primary">
                              {appointment.patient?.firstName?.[0]}{appointment.patient?.lastName?.[0]}
                            </AvatarFallback>
                          </Avatar>
                          <div className="space-y-1">
                            <h4 className="font-medium">
                              {appointment.patient?.firstName} {appointment.patient?.lastName}
                            </h4>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <User className="h-3 w-3" />
                              <span>{appointment.patient?.gender}, {appointment.patient?.dateOfBirth ? new Date().getFullYear() - new Date(appointment.patient.dateOfBirth).getFullYear() : 'N/A'} years</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Phone className="h-3 w-3" />
                              <span>{appointment.patient?.primaryPhone}</span>
                            </div>
                            {appointment.patient?.email && (
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Mail className="h-3 w-3" />
                                <span>{appointment.patient.email}</span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Appointment Details */}
                        <div className="space-y-2">
                          <div>
                            <p className="font-medium text-sm capitalize">
                              {appointment.appointmentType.replace('_', ' ')}
                            </p>
                            {appointment.visitReason && (
                              <p className="text-sm text-muted-foreground">
                                {appointment.visitReason}
                              </p>
                            )}
                          </div>

                          <div className="flex items-center gap-2">
                            {appointment.location?.type === "telemedicine" ? (
                              <Video className="h-4 w-4 text-blue-600" />
                            ) : (
                              <MapPin className="h-4 w-4 text-green-600" />
                            )}
                            <span className="text-sm text-muted-foreground">
                              {appointment.location?.type === "telemedicine" ? "Virtual Meeting" : "In-person"}
                            </span>
                            {appointment.location?.room && (
                              <span className="text-sm text-muted-foreground">
                                • Room {appointment.location.room}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Status and Actions */}
                      <div className="flex flex-col items-end gap-3">
                        <Badge variant="secondary" className={`${getStatusColor(appointment.status)} flex items-center gap-1`}>
                          {getStatusIcon(appointment.status)}
                          {appointment.status.replace('_', ' ')}
                        </Badge>

                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" className="rounded-lg">
                            Reschedule
                          </Button>
                          <Button size="sm" variant="outline" className="rounded-lg">
                            Cancel
                          </Button>
                          <Button size="sm" className="rounded-lg">
                            {appointment.location?.type === "telemedicine" ? "Join Meeting" : "Start Appointment"}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </div>
      </div>
    </DashboardLayout>
  );
}
