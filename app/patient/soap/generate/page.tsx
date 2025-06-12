"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { useQuery } from "convex/react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { AudioRecorder, AudioRecorderRef } from "@/components/patient/audio-recorder";
import {
  FileText,
  AlertCircle,
  ArrowRight,
  Mic
} from "lucide-react";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";

// Skeleton Loading Component
function GenerateSOAPSkeleton() {
  return (
    <DashboardLayout>
      <div className="h-full flex flex-col space-y-4">
        {/* Header Skeleton */}
        <div className="flex-shrink-0 space-y-2">
          <Skeleton className="h-7 w-64" />
          <Skeleton className="h-4 w-96" />
        </div>

        {/* Main Content Skeleton */}
        <div className="flex-1 min-h-0 overflow-y-auto">
          <div className="space-y-6 pb-6">
            {/* Audio Recording Section with Tips Skeleton */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
              {/* Audio Recording Skeleton - Takes 2 columns */}
              <div className="lg:col-span-2 flex">
                <Card className="border w-full flex flex-col">
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-5 w-5" />
                      <Skeleton className="h-5 w-32" />
                    </div>
                    <Skeleton className="h-4 w-full" />
                  </CardHeader>
                  <CardContent className="space-y-4 w-full flex-1 flex flex-col">
                    <div className="flex-1">
                      <div className="space-y-6">
                        <div className="flex flex-col items-center space-y-4">
                          <Skeleton className="h-12 w-40 rounded-lg" />
                          <Skeleton className="h-4 w-48" />
                        </div>
                        <div className="relative">
                          <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t" />
                          </div>
                          <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-background px-2 text-muted-foreground">or</span>
                          </div>
                        </div>
                        <div className="flex flex-col items-center space-y-3">
                          <Skeleton className="h-12 w-40 rounded-lg" />
                          <Skeleton className="h-3 w-56" />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Recording Tips Skeleton - Takes 1 column */}
              <div className="lg:col-span-1 flex">
                <Card className="border w-full flex flex-col">
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-5 w-5" />
                      <Skeleton className="h-5 w-28" />
                    </div>
                  </CardHeader>
                  <CardContent className="flex-1">
                    <div className="space-y-4 text-sm h-full flex flex-col justify-center">
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-24" />
                        <div className="space-y-1">
                          {Array.from({ length: 4 }).map((_, i) => (
                            <Skeleton key={i} className="h-3 w-full" />
                          ))}
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-32" />
                        <div className="space-y-1">
                          {Array.from({ length: 4 }).map((_, i) => (
                            <Skeleton key={i} className="h-3 w-full" />
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* How it Works Skeleton */}
            <Card className="border w-full">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Skeleton className="h-5 w-5" />
                  <Skeleton className="h-5 w-48" />
                </div>
                <Skeleton className="h-4 w-full" />
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="flex flex-col items-center text-center space-y-3 p-4 border rounded-lg">
                      <Skeleton className="w-8 h-8 rounded-full" />
                      <div className="space-y-2 w-full">
                        <Skeleton className="h-4 w-24 mx-auto" />
                        <Skeleton className="h-3 w-full" />
                        <Skeleton className="h-3 w-3/4 mx-auto" />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default function GenerateSOAPPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [fileName, setFileName] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState(false);
  const audioRecorderRef = useRef<AudioRecorderRef>(null);


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

  if (status === "loading" || (session?.user?.id && patientProfile === undefined)) {
    return <GenerateSOAPSkeleton />;
  }

  if (!session || session.user.role !== "patient") {
    return null;
  }

  if (!patientProfile) {
    return (
      <DashboardLayout>
        <div className="flex flex-col h-full w-full overflow-hidden">
          <div className="flex-1 flex items-center justify-center">
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
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="flex flex-col h-full w-full overflow-hidden gap-4">
        {/* Header - Fixed height */}
        <div className="flex-shrink-0 flex items-start justify-between">
          <div className="space-y-1">
            <h1 className="text-xl font-bold tracking-tight">
              Generate SOAP Notes
            </h1>
            <p className="text-muted-foreground text-sm">
              Record or upload audio to generate AI-powered clinical documentation
            </p>
          </div>
          <div className="">
            {patientProfile && (
              <Badge variant="outline" className="flex items-center gap-2">
                <FileText className="h-3 w-3" />
                Patient: {patientProfile.firstName} {patientProfile.lastName}
              </Badge>
            )}
          </div>
        </div>

        {/* Main Content - Scrollable */}
        <div className="flex-1 min-h-0 overflow-y-auto">
          <div className="space-y-6 pb-6">
            {/* Audio Recording Section with Tips */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
              {/* Audio Recording - Takes 2 columns */}
              <div className="lg:col-span-2 flex">
                <Card className="border w-full flex flex-col">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Mic className="h-5 w-5" />
                    Audio Recording
                  </CardTitle>
                  <CardDescription>
                    Record your voice or upload an audio file to generate structured SOAP notes
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 w-full flex-1 flex flex-col">
                  <div className="flex-1 h-full flex flex-col gap-3">
                    <AudioRecorder
                    ref={audioRecorderRef}
                    onAudioReady={handleAudioReady}
                    onAudioRemove={handleAudioRemove}
                    disabled={isProcessing}
                    maxDuration={600} // 10 minutes
                  />

                  {audioBlob && !isProcessing && (
                    <div className="flex justify-center gap-3 pt-4">
                      <Button
                        onClick={() => {
                          audioRecorderRef.current?.removeAudio();
                          setAudioBlob(null);
                          setFileName("");
                        }}
                        variant="outline"
                        size="lg"
                        className="px-6 py-3"
                      >
                        Cancel
                      </Button>
                      <Button onClick={handleGenerateSOAP} size="lg" className="px-8 py-3">
                        <FileText className="h-5 w-5 mr-2" />
                        Generate SOAP Notes
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </Button>
                    </div>
                  )}

                  {isProcessing && (
                    <Card className="border bg-blue-50 dark:bg-blue-950/20">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                          <div>
                            <p className="text-sm font-medium text-blue-800 dark:text-blue-200">Processing Audio...</p>
                            <p className="text-xs text-blue-600 dark:text-blue-400">
                              AI is analyzing your audio and generating SOAP notes. This may take a few moments.
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                  </div>
                </CardContent>
                </Card>
              </div>

              {/* Recording Tips - Takes 1 column */}
              <div className="lg:col-span-1 flex">
                <Card className="border w-full flex flex-col">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertCircle className="h-5 w-5" />
                    Recording Tips
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex-1">
                  <div className="space-y-4 text-sm h-full flex flex-col justify-center">
                    <div className="space-y-2">
                      <h4 className="font-medium">For Best Results:</h4>
                      <ul className="space-y-1 text-muted-foreground">
                        <li>• Speak clearly and at a moderate pace</li>
                        <li>• Use medical terminology when appropriate</li>
                        <li>• Include patient symptoms, observations, and plans</li>
                        <li>• Minimize background noise</li>
                      </ul>
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-medium">Supported Formats:</h4>
                      <ul className="space-y-1 text-muted-foreground">
                        <li>• Audio recordings up to 10 minutes</li>
                        <li>• MP3, WAV, M4A, WebM formats</li>
                        <li>• Maximum file size: 50MB</li>
                        <li>• Clear audio quality recommended</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
                </Card>
              </div>
            </div>

            {/* How it Works Card */}
            <Card className="border w-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                How SOAP Generation Works
              </CardTitle>
              <CardDescription>
                Our AI-powered system transforms your audio into structured clinical documentation
              </CardDescription>
            </CardHeader>
            <CardContent className="w-full">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="flex flex-col items-center text-center space-y-3 p-4 border rounded-lg bg-muted/50">
                  <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">1</div>
                  <div>
                    <p className="font-medium text-sm">Audio Processing</p>
                    <p className="text-xs text-muted-foreground">Advanced speech-to-text conversion with medical terminology recognition</p>
                  </div>
                </div>
                <div className="flex flex-col items-center text-center space-y-3 p-4 border rounded-lg bg-muted/50">
                  <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">2</div>
                  <div>
                    <p className="font-medium text-sm">Medical Analysis</p>
                    <p className="text-xs text-muted-foreground">AI categorizes clinical information using medical knowledge</p>
                  </div>
                </div>
                <div className="flex flex-col items-center text-center space-y-3 p-4 border rounded-lg bg-muted/50">
                  <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">3</div>
                  <div>
                    <p className="font-medium text-sm">SOAP Structure</p>
                    <p className="text-xs text-muted-foreground">Organizes content into Subjective, Objective, Assessment, Plan format</p>
                  </div>
                </div>
                <div className="flex flex-col items-center text-center space-y-3 p-4 border rounded-lg bg-muted/50">
                  <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">4</div>
                  <div>
                    <p className="font-medium text-sm">Quality Assurance</p>
                    <p className="text-xs text-muted-foreground">Validates accuracy and completeness of clinical documentation</p>
                  </div>
                </div>
              </div>
            </CardContent>
            </Card>


          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}