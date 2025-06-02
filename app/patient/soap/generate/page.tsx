"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useQuery } from "convex/react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { AudioRecorder } from "@/components/patient/audio-recorder";
import {
  FileText,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  Mic
} from "lucide-react";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";

export default function GenerateSOAPPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [fileName, setFileName] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState(false);


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

  const handleAudioReady = (blob: Blob, name: string) => {
    setAudioBlob(blob);
    setFileName(name);
  };

  const handleAudioRemove = () => {
    setAudioBlob(null);
    setFileName("");
  };


  const handleGenerateSOAP = async () => {
    if (!audioBlob || !patientProfile) {
      toast.error("Please record or upload an audio file first");
      return;
    }

    setIsProcessing(true);

    try {
      const formData = new FormData();
      formData.append('audio_file', audioBlob, fileName);
      formData.append('patient_id', patientProfile._id);

      // Call our internal API route
      const response = await fetch('/api/patient/soap', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`API call failed: ${response.statusText}`);
      }

      const result = await response.json();

      if (result.success) {
        toast.success("SOAP note generated successfully!");

        // Redirect to the generated SOAP note
        if (result.data.soap_note_id) {
          router.push(`/patient/soap/view/${result.data.soap_note_id}`);
        } else {
          // Fallback to history page
          router.push('/patient/soap/history');
        }
      } else {
        // Handle quality assurance failure specifically
        if (response.status === 422 && result.details?.qa_results) {
          const qaResults = result.details.qa_results;
          toast.error(
            `Quality check failed (Score: ${qaResults.quality_score}%). ${result.details.message}`,
            { duration: 8000 }
          );
          console.log("QA Details:", result.details);
        } else {
          throw new Error(result.error || 'Failed to generate SOAP note');
        }
      }

    } catch (error) {
      console.error('Error generating SOAP:', error);
      toast.error("Failed to generate SOAP note. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

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

  if (!patientProfile) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <Alert>
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
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Audio Recording Section */}
        <Card className="bg-card text-card-foreground border border-border rounded-lg shadow-none">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mic className="h-5 w-5" />
              Audio Recording
            </CardTitle>
            <CardDescription>
              Record or upload audio to generate SOAP notes
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <AudioRecorder
              onAudioReady={handleAudioReady}
              onAudioRemove={handleAudioRemove}
              disabled={isProcessing}
              maxDuration={600} // 10 minutes
            />

            {audioBlob && !isProcessing && (
              <Card className="border rounded-lg shadow-none p-6">
                <CardContent className="flex flex-col gap-2">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-sm font-medium">Ready to generate</span>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {(audioBlob.size / 1024 / 1024).toFixed(2)} MB
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mb-3">
                    File: <span className="text-foreground">{fileName}</span>
                  </p>
                  <Button onClick={handleGenerateSOAP} className="w-full" size="sm">
                    <FileText className="h-4 w-4 mr-2" />
                    Generate SOAP Notes
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>
            )}
          </CardContent>
        </Card>

        {/* How it Works Card */}
        <Card className="border rounded-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <FileText className="h-4 w-4" />
              How it Works
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              <div className="flex items-start gap-2">
                <div className="w-4 h-4 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-[10px] font-bold mt-1 flex-shrink-0">1</div>
                <div>
                  <p className="font-medium">Audio Processing</p>
                  <p className="text-muted-foreground">Speech-to-text conversion</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-4 h-4 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-[10px] font-bold mt-1 flex-shrink-0">2</div>
                <div>
                  <p className="font-medium">Medical Analysis</p>
                  <p className="text-muted-foreground">AI categorizes clinical info</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-4 h-4 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-[10px] font-bold mt-1 flex-shrink-0">3</div>
                <div>
                  <p className="font-medium">SOAP Structure</p>
                  <p className="text-muted-foreground">Organized clinical format</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-4 h-4 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-[10px] font-bold mt-1 flex-shrink-0">4</div>
                <div>
                  <p className="font-medium">Quality Check</p>
                  <p className="text-muted-foreground">Accuracy validation</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
