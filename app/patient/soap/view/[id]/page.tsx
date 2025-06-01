"use client";

import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import { useEffect } from "react";
import { useQuery } from "convex/react";
import { Button } from "@/components/ui/button";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { SOAPDocumentView } from "@/components/patient/soap-document-view";
import { ArrowLeft } from "lucide-react";
import { api } from "@/convex/_generated/api";
import Link from "next/link";

export default function ViewSOAPPage() {
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

    // If the ID format is invalid, redirect to history
    if (!isValidSoapId) {
      router.push("/patient/soap/history");
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

  if (!session || session.user.role !== "patient") {
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
            <Link href="/patient/soap/history">
              <Button variant="outline">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to History
              </Button>
            </Link>
          </div>
          <div className="text-center py-8">
            <h2 className="text-xl font-semibold mb-2">SOAP Note Not Found</h2>
            <p className="text-muted-foreground mb-4">
              The requested SOAP note could not be found.
            </p>
            <Link href="/patient/soap/history">
              <Button>View All SOAP Notes</Button>
            </Link>
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
          <Link href="/patient/soap/history">
            <Button variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to History
            </Button>
          </Link>
          <div className="flex items-center gap-2">
            <Link href="/patient/soap/generate">
              <Button variant="outline">
                Generate New SOAP
              </Button>
            </Link>
          </div>
        </div>

        {/* SOAP Note Display */}
        <SOAPDocumentView
          soapNote={soapNote}
          patientName={patientProfile ? `${patientProfile.firstName} ${patientProfile.lastName}` : undefined}
        />
      </div>
    </DashboardLayout>
  );
}
