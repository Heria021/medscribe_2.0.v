"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { PatientProfile, UseSOAPGenerateReturn, ProcessingState } from "../types";

export function useSOAPGenerate(patientProfile?: PatientProfile): UseSOAPGenerateReturn {
  const router = useRouter();
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [fileName, setFileName] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [processingState, setProcessingState] = useState<ProcessingState>({
    isProcessing: false,
    progress: 0,
    stage: 'uploading',
    message: ''
  });

  const handleAudioReady = useCallback((blob: Blob, name: string) => {
    setAudioBlob(blob);
    setFileName(name);
    setError(null);
  }, []);

  const handleAudioRemove = useCallback(() => {
    setAudioBlob(null);
    setFileName("");
    setError(null);
  }, []);

  const handleGenerateSOAP = useCallback(async () => {
    if (!audioBlob || !patientProfile) {
      toast.error("Please record or upload an audio file first");
      return;
    }

    setIsProcessing(true);
    setError(null);
    setProcessingState({
      isProcessing: true,
      progress: 0,
      stage: 'uploading',
      message: 'Uploading audio file...'
    });

    try {
      const formData = new FormData();
      formData.append('audio_file', audioBlob, fileName);
      formData.append('patient_id', patientProfile._id);

      setProcessingState(prev => ({
        ...prev,
        progress: 25,
        stage: 'transcribing',
        message: 'Transcribing audio...'
      }));

      // Call our internal API route
      const response = await fetch('/api/patient/soap', {
        method: 'POST',
        body: formData,
      });

      setProcessingState(prev => ({
        ...prev,
        progress: 75,
        stage: 'generating',
        message: 'Generating SOAP notes...'
      }));

      if (!response.ok) {
        throw new Error(`API call failed: ${response.statusText}`);
      }

      const result = await response.json();

      if (result.success) {
        setProcessingState(prev => ({
          ...prev,
          progress: 100,
          stage: 'complete',
          message: 'SOAP notes generated successfully!'
        }));

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
          const errorMessage = `Quality check failed (Score: ${qaResults.quality_score}%). ${result.details.message}`;
          setError(errorMessage);
          toast.error(errorMessage, { duration: 8000 });
          console.log("QA Details:", result.details);
        } else {
          const errorMessage = result.error || 'Failed to generate SOAP note';
          setError(errorMessage);
          throw new Error(errorMessage);
        }
      }

    } catch (error) {
      console.error('Error generating SOAP:', error);
      const errorMessage = error instanceof Error ? error.message : "Failed to generate SOAP note. Please try again.";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsProcessing(false);
      setProcessingState(prev => ({
        ...prev,
        isProcessing: false
      }));
    }
  }, [audioBlob, patientProfile, fileName, router]);

  return {
    patientProfile,
    audioBlob,
    fileName,
    isProcessing,
    processingState,
    handleAudioReady,
    handleAudioRemove,
    handleGenerateSOAP,
    loading: false,
    error,
  };
}
