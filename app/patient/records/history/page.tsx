"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { FileText, Download, Eye, ArrowLeft, Calendar, User } from "lucide-react";
import Link from "next/link";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";

export default function MedicalHistoryPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

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

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!session || session.user.role !== "patient") {
    return null;
  }

  // Mock medical history data
  const medicalRecords = [
    {
      id: 1,
      date: "2024-01-15",
      doctor: "Dr. Sarah Wilson",
      specialty: "Cardiologist",
      type: "Follow-up Visit",
      diagnosis: "Hypertension - Well Controlled",
      treatment: "Continue current medication regimen",
      notes: "Blood pressure readings within normal range. Patient reports feeling well.",
      attachments: ["blood_pressure_log.pdf", "ecg_results.pdf"],
    },
    {
      id: 2,
      date: "2024-01-10",
      doctor: "Dr. Michael Brown",
      specialty: "General Practitioner",
      type: "Annual Physical",
      diagnosis: "General Health Assessment",
      treatment: "Routine preventive care recommendations",
      notes: "Overall health excellent. Recommended annual screenings up to date.",
      attachments: ["lab_results.pdf", "physical_exam_summary.pdf"],
    },
    {
      id: 3,
      date: "2023-12-20",
      doctor: "Dr. Emily Davis",
      specialty: "Dermatologist",
      type: "Consultation",
      diagnosis: "Benign Skin Lesion",
      treatment: "Topical treatment prescribed",
      notes: "Skin lesion examined and determined to be benign. Follow-up in 6 months.",
      attachments: ["dermatology_photos.pdf"],
    },
    {
      id: 4,
      date: "2023-11-05",
      doctor: "Dr. Sarah Wilson",
      specialty: "Cardiologist",
      type: "Initial Consultation",
      diagnosis: "Mild Hypertension",
      treatment: "Lifestyle modifications and medication initiated",
      notes: "Blood pressure elevated. Started on ACE inhibitor. Diet and exercise counseling provided.",
      attachments: ["treatment_plan.pdf", "medication_guide.pdf"],
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link href="/patient/records">
            <Button variant="outline" size="sm" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Records
            </Button>
          </Link>
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Medical History</h2>
            <p className="text-muted-foreground">
              Complete record of your medical visits and treatments
            </p>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="border-0 shadow-md">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Records</p>
                  <p className="text-2xl font-bold">{medicalRecords.length}</p>
                </div>
                <FileText className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">This Year</p>
                  <p className="text-2xl font-bold">
                    {medicalRecords.filter(record => record.date.startsWith("2024")).length}
                  </p>
                </div>
                <Calendar className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Doctors Seen</p>
                  <p className="text-2xl font-bold">
                    {new Set(medicalRecords.map(record => record.doctor)).size}
                  </p>
                </div>
                <User className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Attachments</p>
                  <p className="text-2xl font-bold">
                    {medicalRecords.reduce((total, record) => total + record.attachments.length, 0)}
                  </p>
                </div>
                <Download className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Medical Records Timeline */}
        <Card className="border-0 shadow-md">
          <CardHeader>
            <CardTitle>Medical Records Timeline</CardTitle>
            <CardDescription>
              Chronological history of your medical visits and treatments
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {medicalRecords.map((record, index) => (
                <div 
                  key={record.id}
                  className="relative flex gap-6 p-6 rounded-lg border border-border hover:bg-muted/50 transition-colors"
                >
                  {/* Timeline indicator */}
                  <div className="flex flex-col items-center">
                    <div className="w-3 h-3 rounded-full bg-primary" />
                    {index < medicalRecords.length - 1 && (
                      <div className="w-px h-full bg-border mt-2" />
                    )}
                  </div>

                  {/* Record Content */}
                  <div className="flex-1 space-y-4">
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src="" alt={record.doctor} />
                          <AvatarFallback>
                            {record.doctor.split(" ").map(n => n[0]).join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h4 className="font-medium">{record.doctor}</h4>
                          <p className="text-sm text-muted-foreground">{record.specialty}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge variant="outline" className="text-xs">
                          {record.type}
                        </Badge>
                        <span className="text-sm text-muted-foreground">{record.date}</span>
                      </div>
                    </div>

                    {/* Medical Details */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h5 className="text-sm font-medium mb-1">Diagnosis</h5>
                        <p className="text-sm text-muted-foreground">{record.diagnosis}</p>
                      </div>
                      <div>
                        <h5 className="text-sm font-medium mb-1">Treatment</h5>
                        <p className="text-sm text-muted-foreground">{record.treatment}</p>
                      </div>
                    </div>

                    {/* Notes */}
                    <div>
                      <h5 className="text-sm font-medium mb-1">Notes</h5>
                      <p className="text-sm text-muted-foreground">{record.notes}</p>
                    </div>

                    {/* Attachments */}
                    {record.attachments.length > 0 && (
                      <div>
                        <h5 className="text-sm font-medium mb-2">Attachments</h5>
                        <div className="flex flex-wrap gap-2">
                          {record.attachments.map((attachment, attachIndex) => (
                            <div 
                              key={attachIndex}
                              className="flex items-center gap-2 px-3 py-1 bg-muted rounded-md text-xs"
                            >
                              <FileText className="h-3 w-3" />
                              <span>{attachment}</span>
                              <Button size="sm" variant="ghost" className="h-4 w-4 p-0 ml-1">
                                <Download className="h-3 w-3" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-2 pt-2 border-t border-border">
                      <Button size="sm" variant="outline" className="flex items-center gap-2">
                        <Eye className="h-3 w-3" />
                        View Details
                      </Button>
                      <Button size="sm" variant="outline" className="flex items-center gap-2">
                        <Download className="h-3 w-3" />
                        Download
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Empty State */}
        {medicalRecords.length === 0 && (
          <Card className="border-0 shadow-md">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-4">
                <FileText className="h-6 w-6 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No medical records yet</h3>
              <p className="text-muted-foreground text-center mb-4">
                Your medical history will appear here after your first appointment.
              </p>
              <Button>
                <Calendar className="h-4 w-4 mr-2" />
                Book Your First Appointment
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
