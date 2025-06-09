"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useQuery } from "convex/react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Search,
  Users,
  Calendar,
  UserPlus,
  Mail,
  Phone,
  Activity,
  Eye
} from "lucide-react";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { api } from "@/convex/_generated/api";

export default function PatientsPage() {
  const { data: session } = useSession();
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

  if (!session || session.user.role !== "doctor") {
    return null;
  }

  if (!doctorProfile || !assignedPatients) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-sm text-muted-foreground">Loading patients...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-4">
        {/* Header */}
        <div className="space-y-1">
          <h1 className="text-xl font-bold tracking-tight">
            My Patients
          </h1>
          <p className="text-muted-foreground text-sm">
            Manage and view all patients under your care
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search patients by name, email, or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 rounded-xl"
          />
        </div>

        {/* Patients List */}
        {filteredPatients.length === 0 ? (
          <div className="border rounded-xl p-8 text-center">
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
        ) : (
          <div className="border rounded-xl">
            <ScrollArea className="h-[600px]">
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
    </DashboardLayout>
  );
}