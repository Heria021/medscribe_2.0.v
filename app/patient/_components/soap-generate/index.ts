// Main exports - components
export {
  SOAPGenerateHeader,
  SOAPGenerateContent,
  SOAPGenerateSkeleton,
  SOAPErrorBoundary,
  AudioRecordingSection,
  RecordingTipsSection,
  HowItWorksSection,
  ProcessingIndicator,
} from "./components";

// Main exports - hooks
export {
  useSOAPGenerate,
  useAudioRecording,
} from "./hooks";

// Type exports
export type {
  // Core types
  PatientProfile,
  AudioRecordingState,
  ProcessingState,
  
  // Component prop types
  SOAPGenerateHeaderProps,
  SOAPGenerateContentProps,
  SOAPGenerateSkeletonProps,
  AudioRecordingSectionProps,
  RecordingTipsSectionProps,
  HowItWorksSectionProps,
  ProcessingIndicatorProps,
  
  // Hook return types
  UseSOAPGenerateReturn,
  UseAudioRecordingReturn,
} from "./types";
