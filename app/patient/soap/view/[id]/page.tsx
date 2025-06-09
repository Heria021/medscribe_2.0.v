"use client";

import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import { useEffect } from "react";
import { useQuery } from "convex/react";
import { Button } from "@/components/ui/button";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { SOAPDocumentView } from "@/components/patient/soap-document-view";
import { ArrowLeft, FileText, Calendar, User } from "lucide-react";
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
        <div className="flex flex-col h-full space-y-6">
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
      <div className="space-y-6 h-full flex flex-col">
        {/* Enhanced Navigation */}
        <div className="flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/patient/soap/history">
                <Button variant="outline">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to History
                </Button>
              </Link>
              <div className="hidden sm:flex items-center gap-2 text-sm text-muted-foreground">
                <FileText className="h-4 w-4" />
                <span>SOAP Note</span>
                <span>•</span>
                <Calendar className="h-4 w-4" />
                <span>{new Date(soapNote.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Link href="/patient/soap/generate">
                <Button variant="outline" size="sm">
                  Generate New
                </Button>
              </Link>
              <Link href="/patient/soap/history">
                <Button variant="outline" size="sm">
                  View All Notes
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 min-h-0">
          <SOAPDocumentView
            soapNote={soapNote}
            patientName={patientProfile ? `${patientProfile.firstName} ${patientProfile.lastName}` : undefined}
            showActions={true}
          />
        </div>
      </div>
    </DashboardLayout>
  );
}
