"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useQuery } from "convex/react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";
import { api } from "@/convex/_generated/api";
import {
  SOAPGenerateHeader,
  SOAPGenerateContent,
  SOAPGenerateSkeleton,
  SOAPErrorBoundary,
} from "@/app/patient/_components/soap-generate";



export default function GenerateSOAPPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // Get patient profile
  const patientProfile = useQuery(
    api.patients.getPatientByUserId,
    session?.user?.id ? { userId: session.user.id as any } : "skip"
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
  }, [session, status, router]);

  if (status === "loading" || (session?.user?.id && patientProfile === undefined)) {
    return <SOAPGenerateSkeleton />;
  }

  if (!session || session.user.role !== "patient") {
    return null;
  }

  if (!patientProfile) {
    return (
      <div className="flex flex-col h-full w-full overflow-hidden">
        <div className="flex-1 flex items-center justify-center p-4">
          <Alert className="max-w-md">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Please complete your patient profile before generating SOAP notes.
              <Button
                variant="link"
                className="p-0 h-auto ml-2"
                onClick={() => router.push("/patient/settings/profile")}
              >
                Complete Profile
              </Button>
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  return (
    <SOAPErrorBoundary>
      <div className="flex flex-col h-full w-full overflow-hidden gap-4">
        {/* Header - Mobile First */}
        <div className="flex-shrink-0">
          <SOAPGenerateHeader patientProfile={patientProfile} />
        </div>

        {/* Main Content - Scrollable */}
        <div className="flex-1 min-h-0 overflow-y-auto">
          <div className="pb-4 sm:pb-6">
            <SOAPGenerateContent patientProfile={patientProfile} />
          </div>
        </div>
      </div>
    </SOAPErrorBoundary>
  );
}