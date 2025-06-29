/**
 * Example usage of SOAP Generate components
 * 
 * This file demonstrates how to use the SOAP generate components
 * in different scenarios and configurations.
 */

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
  AudioRecordingSection,
  RecordingTipsSection,
  HowItWorksSection,
  useSOAPGenerate,
  type PatientProfile,
} from "./index";

// Example 1: Full page implementation (recommended)
export function FullSOAPGeneratePage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const patientProfile = useQuery(
    api.patients.getPatientByUserId,
    session?.user?.id ? { userId: session.user.id as any } : "skip"
  );

  useEffect(() => {
    if (status === "loading") return;
    if (!session || session.user.role !== "patient") {
      router.push("/auth/login");
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
        <div className="flex-shrink-0">
          <SOAPGenerateHeader patientProfile={patientProfile} />
        </div>
        <div className="flex-1 min-h-0 overflow-y-auto">
          <div className="pb-4 sm:pb-6">
            <SOAPGenerateContent patientProfile={patientProfile} />
          </div>
        </div>
      </div>
    </SOAPErrorBoundary>
  );
}

// Example 2: Custom layout with individual components
export function CustomSOAPGenerateLayout({ patientProfile }: { patientProfile: PatientProfile }) {
  const {
    audioBlob,
    fileName,
    isProcessing,
    processingState,
    handleAudioReady,
    handleAudioRemove,
    handleGenerateSOAP,
  } = useSOAPGenerate(patientProfile);

  return (
    <SOAPErrorBoundary>
      <div className="container mx-auto p-4 space-y-6">
        {/* Custom header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">AI-Powered SOAP Notes</h1>
          <p className="text-muted-foreground">
            Transform your voice into professional clinical documentation
          </p>
        </div>

        {/* Two-column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-6">
            <AudioRecordingSection
              onAudioReady={handleAudioReady}
              onAudioRemove={handleAudioRemove}
              onGenerateSOAP={handleGenerateSOAP}
              audioBlob={audioBlob}
              fileName={fileName}
              isProcessing={isProcessing}
            />
            <HowItWorksSection />
          </div>
          
          <div>
            <RecordingTipsSection />
          </div>
        </div>
      </div>
    </SOAPErrorBoundary>
  );
}

// Example 3: Minimal implementation for embedding
export function MinimalSOAPGenerate({ patientProfile }: { patientProfile: PatientProfile }) {
  const {
    audioBlob,
    fileName,
    isProcessing,
    handleAudioReady,
    handleAudioRemove,
    handleGenerateSOAP,
  } = useSOAPGenerate(patientProfile);

  return (
    <div className="max-w-2xl mx-auto p-4">
      <AudioRecordingSection
        onAudioReady={handleAudioReady}
        onAudioRemove={handleAudioRemove}
        onGenerateSOAP={handleGenerateSOAP}
        audioBlob={audioBlob}
        fileName={fileName}
        isProcessing={isProcessing}
      />
    </div>
  );
}

// Example 4: With custom error boundary
export function SOAPGenerateWithCustomError() {
  const customErrorFallback = (
    <div className="flex items-center justify-center h-64">
      <div className="text-center space-y-4">
        <AlertCircle className="h-12 w-12 text-red-500 mx-auto" />
        <div>
          <h3 className="text-lg font-semibold">Unable to load SOAP generator</h3>
          <p className="text-muted-foreground">Please refresh the page or contact support</p>
        </div>
        <Button onClick={() => window.location.reload()}>
          Refresh Page
        </Button>
      </div>
    </div>
  );

  return (
    <SOAPErrorBoundary fallback={customErrorFallback}>
      {/* Your SOAP generate content */}
    </SOAPErrorBoundary>
  );
}
