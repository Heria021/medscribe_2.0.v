"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import { useQuery } from "convex/react";
import { Button } from "@/components/ui/button";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { SOAPDocumentView } from "@/components/patient/soap-document-view";
import { ArrowLeft } from "lucide-react";
import { api } from "@/convex/_generated/api";

export default function DoctorSOAPViewPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const soapId = params.id as string;

  // Get patient profile
  const patientProfile = useQuery(
    api.patients.getPatientByUserId,
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
    api.patients.getById,
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

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Navigation */}
        <div className="flex items-center justify-between">
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </div>

        {/* SOAP Note Display */}
        <SOAPDocumentView
          soapNote={soapNote}
          patientName={patient ? `${patient.firstName} ${patient.lastName}` : undefined}
          showActions={false}
        />
      </div>
    </DashboardLayout>
  );
}
