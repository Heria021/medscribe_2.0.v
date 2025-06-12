"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useQuery } from "convex/react";
import { useState, useEffect, useMemo } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Search,
  Users,
  Calendar,
  UserPlus,
  Mail,
  Phone,
  Activity,
  Eye,
  ArrowRight
} from "lucide-react";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { api } from "@/convex/_generated/api";
import Link from "next/link";

// Skeleton Loading Component
function PatientsSkeleton() {
  return (
    <DashboardLayout>
      <div className="space-y-4">
        {/* Header Skeleton */}
        <div className="space-y-1">
          <Skeleton className="h-7 w-48" />
          <Skeleton className="h-4 w-80" />
        </div>

        {/* Search Bar Skeleton */}
        <div className="relative">
          <Skeleton className="h-10 w-full rounded-xl" />
        </div>

        {/* Patients List Skeleton */}
        <div className="border rounded-xl">
          <div className="divide-y">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    {/* Avatar Skeleton */}
                    <Skeleton className="h-10 w-10 rounded-full" />

                    {/* Patient Info Skeleton */}
                    <div className="space-y-2">
                      {/* Name and Badge */}
                      <div className="flex items-center gap-2">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-5 w-16" />
                      </div>

                      {/* Details Row */}
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1">
                          <Skeleton className="h-3 w-3" />
                          <Skeleton className="h-3 w-12" />
                        </div>
                        <div className="flex items-center gap-1">
                          <Skeleton className="h-3 w-3" />
                          <Skeleton className="h-3 w-24" />
                        </div>
                        <div className="flex items-center gap-1">
                          <Skeleton className="h-3 w-3" />
                          <Skeleton className="h-3 w-32" />
                        </div>
                        <div className="flex items-center gap-1">
                          <Skeleton className="h-3 w-3" />
                          <Skeleton className="h-3 w-16" />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Action Button Skeleton */}
                  <Skeleton className="h-7 w-16" />
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
    <div className="h-full w-full flex items-center justify-center p-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-primary/10">
              <Users className="h-8 w-8 text-primary" />
            </div>
          </div>
          <CardTitle className="text-2xl">Complete Your Profile to Manage Patients</CardTitle>
          <p className="text-muted-foreground">
            {!doctorProfile
              ? "Set up your professional profile to start managing patients."
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
                <Users className="h-4 w-4" />
                Patient Management
              </h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• View and manage all assigned patients</li>
                <li>• Access patient medical records and history</li>
                <li>• Track patient assignments and referrals</li>
                <li>• Communicate with patients and care teams</li>
              </ul>
            </div>

            <p className="text-sm text-muted-foreground text-center">
              Complete your professional profile to start managing your patient roster.
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

export default function PatientsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");

  // Get doctor profile
  const doctorProfile = useQuery(
    api.doctors.getDoctorProfile,
    session?.user?.id ? { userId: session.user.id as any } : "skip"
  );

  // Get assigned patients
  const assignedPatients = useQuery(
    api.doctorPatients.getPatientsByDoctor,
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

  const calculateAge = (dateOfBirth: string) => {
    return new Date().getFullYear() - new Date(dateOfBirth).getFullYear();
  };

  const getAssignmentBadge = (assignedBy: string) => {
    const labels = {
      referral_acceptance: "Referral",
      appointment_scheduling: "Appointment",
      direct_assignment: "Direct"
    };

    return (
      <Badge variant="secondary" className="text-xs">
        {labels[assignedBy as keyof typeof labels] || assignedBy}
      </Badge>
    );
  };

  useEffect(() => {
    if (status === "loading") return;

    if (!session || session.user.role !== "doctor") {
      router.push("/auth/login");
    }
  }, [session, status, router]);

  // Show loading skeleton while session or profile is loading
  if (status === "loading" || (session?.user?.id && doctorProfile === undefined)) {
    return <PatientsSkeleton />;
  }

  // Redirect if not authenticated or wrong role
  if (!session || session.user.role !== "doctor") {
    return null;
  }

  // Filter patients based on search
  const filteredPatients = assignedPatients?.filter(relationship => {
    const patient = relationship.patient;
    if (!patient) return false;

    const matchesSearch = searchTerm === "" ||
      `${patient.firstName} ${patient.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.primaryPhone?.includes(searchTerm);

    return matchesSearch;
  }) || [];

  // Show dashboard with profile completion content if profile is not complete
  return (
    <DashboardLayout>
      {!isProfileComplete ? (
        <ProfileCompletionContent doctorProfile={doctorProfile} />
      ) : (
        <div className="h-full flex flex-col space-y-4">
          {/* Header */}
          <div className="flex-shrink-0 space-y-1">
            <h1 className="text-xl font-bold tracking-tight">
              My Patients
            </h1>
            <p className="text-muted-foreground text-sm">
              Manage and view all patients under your care
            </p>
          </div>

        {/* Search Bar */}
        <div className="flex-shrink-0 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search patients by name, email, or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 rounded-xl"
          />
        </div>

        {/* Patients List - Takes remaining height */}
        <div className="flex-1 min-h-0">
          {filteredPatients.length === 0 ? (
            <div className="h-full border rounded-xl flex items-center justify-center p-8">
              <div className="text-center">
                <Users className="h-10 w-10 text-muted-foreground mb-3 mx-auto" />
                <h3 className="font-semibold mb-1">No Patients Found</h3>
                <p className="text-muted-foreground text-sm">
                  {searchTerm
                    ? "No patients match your search criteria."
                    : "You don't have any assigned patients yet."}
                </p>
                <Button className="mt-3 rounded-lg" size="sm">
                  <UserPlus className="h-4 w-4 mr-2" />
                  Add Patient
                </Button>
              </div>
            </div>
          ) : (
            <div className="h-full border rounded-xl flex flex-col">
              <ScrollArea className="flex-1">
                <div className="divide-y">
                {filteredPatients.map((relationship) => {
                  const patient = relationship.patient!;
                  const age = calculateAge(patient.dateOfBirth);

                  return (
                    <div
                      key={relationship._id}
                      className="p-4 cursor-pointer hover:bg-muted/50 transition-colors"
                      onClick={() => router.push(`/doctor/patients/${patient._id}`)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <Avatar className="h-10 w-10">
                            <AvatarFallback className="text-sm font-medium bg-primary text-primary-foreground">
                              {patient.firstName[0]}{patient.lastName[0]}
                            </AvatarFallback>
                          </Avatar>

                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-medium">
                                {patient.firstName} {patient.lastName}
                              </h3>
                              {getAssignmentBadge(relationship.assignedBy)}
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

                        <Button
                          variant="outline"
                          size="sm"
                          className="h-7 px-2 rounded-lg"
                          onClick={(e) => {
                            e.stopPropagation();
                            router.push(`/doctor/patients/${patient._id}`);
                          }}
                        >
                          <Eye className="h-3 w-3 mr-1" />
                          View
                        </Button>
                      </div>
                    </div>
                  );
                })}
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