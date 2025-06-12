"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useMemo } from "react";
import { useQuery } from "convex/react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Calendar,
  Clock,
  Plus,
  Video,
  Phone,
  MapPin,
  Search,
  User,
  CheckCircle,
  XCircle,
  AlertCircle,
  PlayCircle,
  ArrowRight
} from "lucide-react";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { api } from "@/convex/_generated/api";
import Link from "next/link";

// Skeleton Loading Component
function AppointmentsSkeleton() {
  return (
    <DashboardLayout>
      <div className="space-y-4">
        {/* Header Skeleton */}
        <div className="space-y-1">
          <Skeleton className="h-7 w-48" />
          <Skeleton className="h-4 w-80" />
        </div>

        {/* Search and Filters Skeleton */}
        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <Skeleton className="h-10 w-full rounded-xl" />
          </div>
          <Skeleton className="h-10 w-24 rounded-lg" />
        </div>

        {/* Category Tabs Skeleton */}
        <div className="flex items-center gap-1 border-b">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-20" />
          ))}
        </div>

        {/* Appointments List Skeleton */}
        <div className="border rounded-xl">
          <div className="divide-y">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    {/* Time and Date Skeleton */}
                    <div className="flex flex-col items-center gap-1 min-w-[80px]">
                      <Skeleton className="h-6 w-16" />
                      <Skeleton className="h-3 w-20" />
                      <Skeleton className="h-3 w-12" />
                    </div>

                    {/* Patient Info Skeleton */}
                    <div className="flex items-start gap-3">
                      <Skeleton className="h-12 w-12 rounded-full" />
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-3 w-40" />
                        <Skeleton className="h-3 w-36" />
                        <Skeleton className="h-3 w-44" />
                      </div>
                    </div>

                    {/* Appointment Details Skeleton */}
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-3 w-32" />
                      <div className="flex items-center gap-2">
                        <Skeleton className="h-4 w-4" />
                        <Skeleton className="h-3 w-28" />
                      </div>
                    </div>
                  </div>

                  {/* Status and Actions Skeleton */}
                  <div className="flex flex-col items-end gap-3">
                    <Skeleton className="h-6 w-20" />
                    <div className="flex gap-2">
                      <Skeleton className="h-8 w-20" />
                      <Skeleton className="h-8 w-16" />
                      <Skeleton className="h-8 w-24" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

// Profile Completion Component (Inside Dashboard Layout)
function ProfileCompletionContent({ doctorProfile }: { doctorProfile: any }) {
  // Define required fields for profile completion
  const requiredFields = [
    { key: 'firstName', label: 'First Name' },
    { key: 'lastName', label: 'Last Name' },
    { key: 'phone', label: 'Phone Number' },
    { key: 'email', label: 'Email' },
    { key: 'primarySpecialty', label: 'Primary Specialty' },
    { key: 'licenseNumber', label: 'License Number' },
  ];

  const completedRequired = useMemo(() => {
    if (!doctorProfile) return [];
    return requiredFields.filter(field => {
      const value = doctorProfile[field.key];
      return value && (Array.isArray(value) ? value.length > 0 : value.toString().trim() !== "");
    });
  }, [doctorProfile, requiredFields]);

  const requiredCompletion = (completedRequired.length / requiredFields.length) * 100;
  const missingRequired = requiredFields.length - completedRequired.length;

  return (
    <div className="h-full flex items-center justify-center p-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-primary/10">
              <Calendar className="h-8 w-8 text-primary" />
            </div>
          </div>
          <CardTitle className="text-2xl">Complete Your Profile to Manage Appointments</CardTitle>
          <p className="text-muted-foreground">
            {!doctorProfile
              ? "Set up your professional profile to start managing appointments."
              : `${missingRequired} required field${missingRequired !== 1 ? 's' : ''} remaining`
            }
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {doctorProfile && (
            <div className="space-y-4">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Profile Completion</span>
                <span className="font-medium">{completedRequired.length}/{requiredFields.length} fields</span>
              </div>
              <div className="w-full bg-secondary rounded-full h-3">
                <div
                  className="bg-primary h-3 rounded-full transition-all duration-500"
                  style={{ width: `${requiredCompletion}%` }}
                />
              </div>
              <div className="flex justify-center">
                <Badge variant="secondary" className="text-sm px-3 py-1">
                  {Math.round(requiredCompletion)}% Complete
                </Badge>
              </div>
            </div>
          )}

          <div className="space-y-4">
            <div className="bg-muted/50 rounded-lg p-4">
              <h4 className="font-medium mb-2 flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Appointment Management
              </h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• View and manage your schedule</li>
                <li>• Schedule new appointments with patients</li>
                <li>• Handle appointment confirmations and cancellations</li>
                <li>• Access patient information and visit details</li>
              </ul>
            </div>

            <p className="text-sm text-muted-foreground text-center">
              Complete your professional profile to start managing your appointment schedule.
            </p>

            <Link href="/doctor/settings/profile" className="block">
              <Button className="w-full" size="lg">
                {!doctorProfile ? "Get Started" : "Complete Profile"}
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

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

  // Check if profile is complete
  const isProfileComplete = useMemo(() => {
    if (!doctorProfile) return false;

    const requiredFields = ['firstName', 'lastName', 'phone', 'email', 'primarySpecialty', 'licenseNumber'] as const;
    return requiredFields.every(field => {
      const value = doctorProfile[field as keyof typeof doctorProfile];
      return value && (Array.isArray(value) ? value.length > 0 : value.toString().trim() !== "");
    });
  }, [doctorProfile]);

  useEffect(() => {
    if (status === "loading") return;

    if (!session || session.user.role !== "doctor") {
      router.push("/auth/login");
    }
  }, [session, status, router]);

  // Show loading skeleton while session or profile is loading
  if (status === "loading" || (session?.user?.id && doctorProfile === undefined)) {
    return <AppointmentsSkeleton />;
  }

  // Redirect if not authenticated or wrong role
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

  // Show dashboard with profile completion content if profile is not complete
  return (
    <DashboardLayout>
      {!isProfileComplete ? (
        <ProfileCompletionContent doctorProfile={doctorProfile} />
      ) : (
        <div className="h-full flex flex-col space-y-4">
          {/* Header */}
          <div className="flex-shrink-0 space-y-1">
            <h1 className="text-xl font-bold tracking-tight">Appointments</h1>
            <p className="text-muted-foreground text-sm">
              Manage your schedule and upcoming appointments
            </p>
          </div>

        {/* Search and Filters */}
        <div className="flex-shrink-0 flex items-center gap-4">
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
        <div className="flex-shrink-0 flex items-center gap-1 border-b">
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

        {/* Appointments List - Takes remaining height */}
        <div className="flex-1 min-h-0">
          {allAppointments === undefined ? (
            <div className="h-full border rounded-xl flex flex-col">
              <div className="divide-y">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="p-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        {/* Time and Date Skeleton */}
                        <div className="flex flex-col items-center gap-1 min-w-[70px]">
                          <Skeleton className="h-5 w-14" />
                          <Skeleton className="h-3 w-16" />
                          <Skeleton className="h-3 w-10" />
                        </div>

                        {/* Patient Info Skeleton */}
                        <div className="flex items-start gap-3">
                          <Skeleton className="h-10 w-10 rounded-full" />
                          <div className="space-y-1">
                            <Skeleton className="h-4 w-32" />
                            <Skeleton className="h-3 w-40" />
                            <Skeleton className="h-3 w-36" />
                            <Skeleton className="h-3 w-44" />
                          </div>
                        </div>

                        {/* Appointment Details Skeleton */}
                        <div className="space-y-1">
                          <Skeleton className="h-4 w-24" />
                          <Skeleton className="h-3 w-32" />
                          <div className="flex items-center gap-2">
                            <Skeleton className="h-4 w-4" />
                            <Skeleton className="h-3 w-28" />
                          </div>
                        </div>
                      </div>

                      {/* Status and Actions Skeleton */}
                      <div className="flex flex-col items-end gap-2">
                        <Skeleton className="h-5 w-16" />
                        <div className="flex gap-1">
                          <Skeleton className="h-7 w-16" />
                          <Skeleton className="h-7 w-14" />
                          <Skeleton className="h-7 w-20" />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : filteredAppointments.length === 0 ? (
            <div className="h-full border rounded-xl flex items-center justify-center p-8">
              <div className="text-center space-y-4">
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
            <div className="h-full border rounded-xl flex flex-col">
              <ScrollArea className="flex-1">
                <div className="divide-y">
                {filteredAppointments.map((appointment: any) => (
                  <div
                    key={appointment._id}
                    className="p-3 hover:bg-muted/30 transition-colors border-l-2 border-l-transparent hover:border-l-primary/20"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {/* Time and Date - More Compact */}
                        <div className="flex flex-col items-center min-w-[60px]">
                          <div className="text-sm font-semibold">
                            {formatTime(appointment.appointmentDateTime)}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {formatDate(appointment.appointmentDateTime).split(',')[0]}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {appointment.duration}m
                          </div>
                        </div>

                        {/* Patient Info - Compact */}
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback className="bg-primary/10 text-primary text-xs">
                              {appointment.patient?.firstName?.[0]}{appointment.patient?.lastName?.[0]}
                            </AvatarFallback>
                          </Avatar>
                          <div className="min-w-0">
                            <h4 className="font-medium text-sm truncate">
                              {appointment.patient?.firstName} {appointment.patient?.lastName}
                            </h4>
                            <div className="flex items-center gap-3 text-xs text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <User className="h-3 w-3" />
                                {appointment.patient?.gender}, {appointment.patient?.dateOfBirth ? new Date().getFullYear() - new Date(appointment.patient.dateOfBirth).getFullYear() : 'N/A'}y
                              </span>
                              <span className="flex items-center gap-1">
                                <Phone className="h-3 w-3" />
                                {appointment.patient?.primaryPhone}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Appointment Details - Compact */}
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-medium text-xs capitalize text-muted-foreground">
                              {appointment.appointmentType.replace('_', ' ')}
                            </p>
                            <div className="flex items-center gap-1">
                              {appointment.location?.type === "telemedicine" ? (
                                <Video className="h-3 w-3 text-blue-600" />
                              ) : (
                                <MapPin className="h-3 w-3 text-green-600" />
                              )}
                              <span className="text-xs text-muted-foreground">
                                {appointment.location?.type === "telemedicine" ? "Virtual" : "In-person"}
                              </span>
                            </div>
                          </div>
                          {appointment.visitReason && (
                            <p className="text-xs text-muted-foreground truncate max-w-[200px]">
                              {appointment.visitReason}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Status and Actions - Compact */}
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className={`${getStatusColor(appointment.status)} flex items-center gap-1 text-xs h-5`}>
                          {getStatusIcon(appointment.status)}
                          {appointment.status.replace('_', ' ')}
                        </Badge>

                        <div className="flex gap-1">
                          <Button size="sm" variant="ghost" className="h-7 px-2 text-xs">
                            <Calendar className="h-3 w-3" />
                          </Button>
                          <Button size="sm" variant="ghost" className="h-7 px-2 text-xs">
                            <XCircle className="h-3 w-3" />
                          </Button>
                          <Button size="sm" className="h-7 px-3 text-xs">
                            {appointment.location?.type === "telemedicine" ? "Join" : "Start"}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              </ScrollArea>
            </div>
          )}
        </div>
      </div>
      )}
    </DashboardLayout>
  );
}
