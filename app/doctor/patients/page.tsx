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
import { DataTableCompact } from "@/components/ui/data-table-compact";
import { MetricCard } from "@/components/ui/metric-card";
import { StatusIndicator } from "@/components/ui/status-indicator";
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
            <MetricCard
              title="Total Patients"
              value={patientStats.totalPatients}
              icon={<Users className="h-4 w-4" />}
              description="Active patient relationships"
              variant="compact"
            />
            <MetricCard
              title="Via Referrals"
              value={patientStats.referralAssignments}
              icon={<UserPlus className="h-4 w-4" />}
              description="Assigned through referrals"
              variant="compact"
              status="info"
            />
            <MetricCard
              title="Via Appointments"
              value={patientStats.appointmentAssignments}
              icon={<Calendar className="h-4 w-4" />}
              description="Assigned through appointments"
              variant="compact"
              status="success"
            />
            <MetricCard
              title="Total Assignments"
              value={patientStats.totalAssignments}
              icon={<Stethoscope className="h-4 w-4" />}
              description="All time assignments"
              variant="compact"
            />
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

        {/* Patients Table */}
        <DataTableCompact
          title="Patient List"
          description="Manage patients assigned to your care"
          data={filteredPatients.map(relationship => ({
            ...relationship,
            patient: relationship.patient!,
            fullName: `${relationship.patient!.firstName} ${relationship.patient!.lastName}`,
            age: new Date().getFullYear() - new Date(relationship.patient!.dateOfBirth).getFullYear(),
          }))}
          columns={[
            {
              key: "fullName",
              label: "Patient",
              sortable: true,
              render: (_, item) => (
                <div className="flex items-center gap-3">
                  <Avatar className="h-8 w-8 border border-border">
                    <AvatarFallback className="text-xs font-medium">
                      {item.patient.firstName[0]}{item.patient.lastName[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-semibold text-sm">
                      {item.patient.firstName} {item.patient.lastName}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {item.patient.email}
                    </div>
                  </div>
                </div>
              ),
            },
            {
              key: "age",
              label: "Age",
              sortable: true,
              render: (value, item) => (
                <div className="text-sm">
                  <div>{value} years</div>
                  <div className="text-xs text-muted-foreground">{item.patient.gender}</div>
                </div>
              ),
            },
            {
              key: "assignedBy",
              label: "Assignment",
              render: (value) => getAssignmentBadge(value),
            },
            {
              key: "assignedAt",
              label: "Assigned",
              sortable: true,
              render: (value) => (
                <div className="text-sm">
                  <div>{formatDate(value)}</div>
                  <StatusIndicator
                    status="active"
                    label="Active"
                    variant="dot"
                    size="sm"
                  />
                </div>
              ),
            },
          ]}
          actions={(item) => (
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push(`/doctor/patients/${item.patient._id}`)}
            >
              <FileText className="h-4 w-4 mr-1" />
              View
            </Button>
          )}
          searchable
          searchPlaceholder="Search patients by name or email..."
          emptyState={
            <div className="flex flex-col items-center justify-center py-8">
              <Users className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Patients Found</h3>
              <p className="text-muted-foreground text-center">
                {searchTerm || filterBy !== "all"
                  ? "No patients match your search criteria."
                  : "You don't have any assigned patients yet. Patients will be assigned when you accept referrals or schedule appointments."}
              </p>
            </div>
          }
        />
      </div>
    </DashboardLayout>
  );
}
