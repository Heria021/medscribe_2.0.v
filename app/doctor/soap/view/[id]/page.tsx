"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import { useQuery } from "convex/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { SOAPDocumentView } from "@/components/patient/soap-document-view";
import { DoctorActionModal } from "@/components/doctor/doctor-action-modal";
import { ArrowLeft, Stethoscope, Download } from "lucide-react";
import { api } from "@/convex/_generated/api";

export default function DoctorSOAPViewPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const soapId = params.id as string;
  const [showActionModal, setShowActionModal] = useState(false);

  // Get doctor profile
  const doctorProfile = useQuery(
    api.doctors.getDoctorProfile,
    session?.user?.id ? { userId: session.user.id as any } : "skip"
  );

  // Validate the ID format - Convex IDs are typically 32 characters long
  const isValidSoapId = soapId && soapId.length >= 30;

  // Get the specific SOAP note
  const soapNote = useQuery(
    api.soapNotes.getById,
    isValidSoapId ? { id: soapId as any } : "skip"
  );

  // Get patient info from SOAP note
  const patient = useQuery(
    api.patients.getPatientById,
    soapNote?.patientId ? { patientId: soapNote.patientId } : "skip"
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

    // If the ID format is invalid, redirect back
    if (!isValidSoapId) {
      router.back();
      return;
    }
  }, [session, status, router, isValidSoapId]);

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

  // If ID is invalid, don't render anything (useEffect will redirect)
  if (!isValidSoapId) {
    return null;
  }

  if (!soapNote) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <Button variant="outline" onClick={() => router.back()}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </div>
          <div className="text-center py-8">
            <h2 className="text-xl font-semibold mb-2">SOAP Note Not Found</h2>
            <p className="text-muted-foreground mb-4">
              The requested SOAP note could not be found.
            </p>
            <Button onClick={() => router.back()}>Go Back</Button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const handleDownload = () => {
    if (!soapNote) return;

    const content = `SOAP Note - ${patient ? `${patient.firstName} ${patient.lastName}` : 'Patient'}
Generated: ${new Date(soapNote.createdAt).toLocaleDateString()}

SUBJECTIVE:
${soapNote.subjective}

OBJECTIVE:
${soapNote.objective}

ASSESSMENT:
${soapNote.assessment}

PLAN:
${soapNote.plan}

${soapNote.recommendations ? `RECOMMENDATIONS:\n${soapNote.recommendations.join('\n')}` : ''}
`;

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `soap-note-${soapNote._id.slice(-8)}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 h-full flex flex-col">
        {/* Navigation */}
        <div className="flex-shrink-0">
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 min-h-0">
          <SOAPDocumentView
            soapNote={soapNote}
            patientName={patient ? `${patient.firstName} ${patient.lastName}` : undefined}
            showActions={false}
          />
        </div>

        {/* Enhanced Doctor Actions */}
        <Card className="border border-border">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <h3 className="font-semibold text-lg text-foreground">Clinical Actions</h3>
                <p className="text-sm text-muted-foreground">
                  Provide assistance, schedule appointments, or refer to specialists
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDownload}
                >
                  <Download className="h-4 w-4 mr-1" />
                  Download
                </Button>
                <Button
                  onClick={() => setShowActionModal(true)}
                  className="flex items-center gap-2"
                >
                  <Stethoscope className="h-4 w-4" />
                  Take Action
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Doctor Action Modal */}
        {showActionModal && soapNote && patient && doctorProfile && (
          <DoctorActionModal
            isOpen={showActionModal}
            onClose={() => setShowActionModal(false)}
            soapNoteId={soapNote._id}
            patientId={patient._id}
            doctorId={doctorProfile._id}
            patientName={`${patient.firstName} ${patient.lastName}`}
          />
        )}
      </div>
    </DashboardLayout>
  );
}
