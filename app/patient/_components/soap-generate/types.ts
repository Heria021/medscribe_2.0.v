import { ReactNode } from "react";

// Core types
export interface PatientProfile {
  _id: string;
  firstName: string;
  lastName: string;
  userId: string;
  dateOfBirth?: string;
  gender?: string;
  phone?: string;
  email?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
  };
  emergencyContact?: {
    name?: string;
    relationship?: string;
    phone?: string;
  };
  medicalHistory?: {
    allergies?: string[];
    medications?: string[];
    conditions?: string[];
    surgeries?: string[];
  };
  createdAt: number;
  updatedAt: number;
}

export interface AudioRecordingState {
  audioBlob: Blob | null;
  fileName: string;
  isRecording: boolean;
  duration: number;
}

export interface ProcessingState {
  isProcessing: boolean;
  progress: number;
  stage: 'uploading' | 'transcribing' | 'analyzing' | 'generating' | 'complete';
  message: string;
}

// Component prop types
export interface SOAPGenerateHeaderProps {
  patientProfile?: PatientProfile;
  className?: string;
}

export interface SOAPGenerateContentProps {
  patientProfile?: PatientProfile;
  className?: string;
}

export interface SOAPGenerateSkeletonProps {
  className?: string;
}

export interface AudioRecordingSectionProps {
  onAudioReady: (blob: Blob, fileName: string) => void;
  onAudioRemove: () => void;
  onGenerateSOAP: () => void;
  audioBlob: Blob | null;
  fileName: string;
  isProcessing: boolean;
  disabled?: boolean;
  className?: string;
}

export interface RecordingTipsSectionProps {
  className?: string;
}

export interface HowItWorksSectionProps {
  className?: string;
}

export interface ProcessingIndicatorProps {
  isProcessing: boolean;
  processingState: ProcessingState;
  className?: string;
}

// Hook return types
export interface UseSOAPGenerateReturn {
  patientProfile?: PatientProfile;
  audioBlob: Blob | null;
  fileName: string;
  isProcessing: boolean;
  processingState: ProcessingState;
  handleAudioReady: (blob: Blob, fileName: string) => void;
  handleAudioRemove: () => void;
  handleGenerateSOAP: () => Promise<void>;
  loading: boolean;
  error: string | null;
}

export interface UseAudioRecordingReturn {
  audioBlob: Blob | null;
  fileName: string;
  isRecording: boolean;
  duration: number;
  handleAudioReady: (blob: Blob, fileName: string) => void;
  handleAudioRemove: () => void;
  startRecording: () => void;
  stopRecording: () => void;
  resetRecording: () => void;
}
