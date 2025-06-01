"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useQuery } from "convex/react";
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Search,
  Users,
  Calendar,
  UserPlus,
  Stethoscope,
  Clock,
  FileText,
  Mail,
  Phone
} from "lucide-react";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { api } from "@/convex/_generated/api";

export default function PatientsPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterBy, setFilterBy] = useState("all");

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

  // Get patient statistics
  const patientStats = useQuery(
    api.doctorPatients.getDoctorPatientStats,
    doctorProfile ? { doctorId: doctorProfile._id } : "skip"
  );

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getAssignmentBadge = (assignedBy: string) => {
    switch (assignedBy) {
      case "referral_acceptance":
        return <Badge variant="default" className="bg-purple-600">Referral</Badge>;
      case "appointment_scheduling":
        return <Badge variant="default" className="bg-green-600">Appointment</Badge>;
      case "direct_assignment":
        return <Badge variant="outline">Direct</Badge>;
      default:
        return <Badge variant="outline">{assignedBy}</Badge>;
    }
  };

  // Filter patients based on search and filter criteria
  const filteredPatients = assignedPatients?.filter(relationship => {
    const patient = relationship.patient;
    if (!patient) return false;

    const matchesSearch = searchTerm === "" ||
      `${patient.firstName} ${patient.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.email?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilter = filterBy === "all" || relationship.assignedBy === filterBy;

    return matchesSearch && matchesFilter;
  }) || [];

  if (!session || session.user.role !== "doctor") {
    return null;
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">My Patients</h1>
            <p className="text-muted-foreground">
              Manage patients assigned to your care
            </p>
          </div>
        </div>

        {/* Statistics Cards */}
        {patientStats && (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Patients</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{patientStats.totalPatients}</div>
                <p className="text-xs text-muted-foreground">
                  Active patient relationships
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Via Referrals</CardTitle>
                <UserPlus className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{patientStats.referralAssignments}</div>
                <p className="text-xs text-muted-foreground">
                  Assigned through referrals
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Via Appointments</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{patientStats.appointmentAssignments}</div>
                <p className="text-xs text-muted-foreground">
                  Assigned through appointments
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Assignments</CardTitle>
                <Stethoscope className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{patientStats.totalAssignments}</div>
                <p className="text-xs text-muted-foreground">
                  All time assignments
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Search and Filter */}
        <div className="flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search patients by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <select
            value={filterBy}
            onChange={(e) => setFilterBy(e.target.value)}
            className="px-3 py-2 border border-input bg-background rounded-md text-sm"
          >
            <option value="all">All Assignments</option>
            <option value="referral_acceptance">Referrals</option>
            <option value="appointment_scheduling">Appointments</option>
            <option value="direct_assignment">Direct</option>
          </select>
        </div>

        {/* Patients List */}
        <div className="grid gap-4">
          {filteredPatients.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-8">
                <Users className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Patients Found</h3>
                <p className="text-muted-foreground text-center">
                  {searchTerm || filterBy !== "all"
                    ? "No patients match your search criteria."
                    : "You don't have any assigned patients yet. Patients will be assigned when you accept referrals or schedule appointments."}
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredPatients.map((relationship) => {
              const patient = relationship.patient!;
              return (
                <Card key={relationship._id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <Avatar className="h-12 w-12">
                          <AvatarFallback>
                            {patient.firstName[0]}{patient.lastName[0]}
                          </AvatarFallback>
                        </Avatar>

                        <div className="space-y-1">
                          <h3 className="font-semibold text-lg">
                            {patient.firstName} {patient.lastName}
                          </h3>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span>DOB: {new Date(patient.dateOfBirth).toLocaleDateString()}</span>
                            <span>Gender: {patient.gender}</span>
                            {patient.email && <span>Email: {patient.email}</span>}
                          </div>
                          <div className="flex items-center gap-2">
                            {getAssignmentBadge(relationship.assignedBy)}
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              Assigned {formatDate(relationship.assignedAt)}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => router.push(`/doctor/patients/${patient._id}`)}
                        >
                          <FileText className="h-4 w-4 mr-1" />
                          View Details
                        </Button>
                      </div>
                    </div>

                    {relationship.notes && (
                      <div className="mt-4 p-3 bg-muted rounded-lg">
                        <p className="text-sm text-muted-foreground">
                          <strong>Assignment Notes:</strong> {relationship.notes}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
