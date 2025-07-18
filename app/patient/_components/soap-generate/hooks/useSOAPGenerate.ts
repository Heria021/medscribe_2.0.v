/**
 * Main hook for SOAP generation functionality
 * Handles both audio and text processing with the new enhanced API
 */

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation } from 'convex/react';
import { toast } from 'sonner';
import { api } from '@/convex/_generated/api';
import { medscribeAPI } from '@/lib/api/medscribe-api';
import {
  UseSOAPGenerateReturn,
  SOAPGenerationState,
  PatientProfile,
  SOAPGenerationError,
} from '../types';
import {
  ProcessingState,
  SOAPProcessingResponse,
} from '@/lib/types/soap-api';

const initialProcessingState: ProcessingState = {
  isProcessing: false,
  progress: 0,
  stage: 'uploading',
  message: '',
};

const initialState: SOAPGenerationState = {
  isProcessing: false,
  processingState: initialProcessingState,
  audioBlob: null,
  fileName: '',
  textInput: '',
  mode: 'audio',
  error: null,
  result: null,
};

export function useSOAPGenerate(patientProfile?: PatientProfile): UseSOAPGenerateReturn {
  const router = useRouter();
  const [state, setState] = useState<SOAPGenerationState>(initialState);
  
  // Convex mutation for saving SOAP notes
  const createSOAPNote = useMutation(api.soapNotes.createEnhanced);

  // ============================================================================
  // STATE MANAGEMENT ACTIONS
  // ============================================================================

  const setMode = useCallback((mode: 'audio' | 'text' | 'conversation') => {
    setState(prev => ({ ...prev, mode, error: null }));
  }, []);

  const setTextInput = useCallback((textInput: string) => {
    setState(prev => ({ ...prev, textInput, error: null }));
  }, []);

  const handleAudioReady = useCallback((blob: Blob, fileName: string) => {
    setState(prev => ({
      ...prev,
      audioBlob: blob,
      fileName,
      error: null,
    }));
  }, []);

  const handleAudioRemove = useCallback(() => {
    setState(prev => ({
      ...prev,
      audioBlob: null,
      fileName: '',
      error: null,
    }));
  }, []);

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  const reset = useCallback(() => {
    setState(initialState);
  }, []);

  // ============================================================================
  // PROCESSING ACTIONS
  // ============================================================================

  const updateProcessingState = useCallback((processingState: ProcessingState) => {
    setState(prev => ({
      ...prev,
      isProcessing: processingState.isProcessing,
      processingState,
    }));
  }, []);

  const handleError = useCallback((error: unknown, type: SOAPGenerationError['type'] = 'unknown') => {
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
    
    const soapError: SOAPGenerationError = {
      type,
      message: errorMessage,
      details: error instanceof Error ? error.stack : undefined,
      timestamp: Date.now(),
    };

    setState(prev => ({
      ...prev,
      isProcessing: false,
      processingState: {
        ...prev.processingState,
        isProcessing: false,
        stage: 'error',
        message: errorMessage,
        error: errorMessage,
      },
      error: errorMessage,
    }));

    toast.error(errorMessage);
    console.error('SOAP Generation Error:', soapError);
  }, []);

  const handleTextProcess = useCallback(async () => {
    if (!patientProfile) {
      handleError(new Error('Patient profile is required'), 'validation');
      return;
    }

    if (!state.textInput.trim()) {
      handleError(new Error('Please enter medical text to process'), 'validation');
      return;
    }

    // Validate text input
    const validation = medscribeAPI.validateText(state.textInput);
    if (!validation.valid) {
      handleError(new Error(validation.error || 'Invalid text input'), 'validation');
      return;
    }

    try {
      setState(prev => ({ ...prev, isProcessing: true, error: null }));

      const result = await medscribeAPI.processText(
        state.textInput,
        patientProfile._id,
        updateProcessingState
      );

      if (result.status === 'error') {
        throw new Error(result.message);
      }

      setState(prev => ({
        ...prev,
        result,
        isProcessing: false,
        processingState: {
          ...prev.processingState,
          isProcessing: false,
          stage: 'complete',
          message: 'SOAP notes generated successfully!',
        },
      }));

      toast.success('SOAP notes generated successfully!');

    } catch (error) {
      handleError(error, 'processing');
    }
  }, [patientProfile, state.textInput, updateProcessingState, handleError]);

  const handleAudioProcess = useCallback(async () => {
    if (!patientProfile) {
      handleError(new Error('Patient profile is required'), 'validation');
      return;
    }

    if (!state.audioBlob) {
      handleError(new Error('Please record or upload an audio file'), 'validation');
      return;
    }

    // Convert blob to file for validation
    const audioFile = new File([state.audioBlob], state.fileName, {
      type: state.audioBlob.type,
    });

    // Validate audio file
    const validation = medscribeAPI.validateAudioFile(audioFile);
    if (!validation.valid) {
      handleError(new Error(validation.error || 'Invalid audio file'), 'validation');
      return;
    }

    try {
      setState(prev => ({ ...prev, isProcessing: true, error: null }));

      const result = await medscribeAPI.processAudio(
        audioFile,
        patientProfile._id,
        updateProcessingState
      );

      if (result.status === 'error') {
        throw new Error(result.message);
      }

      setState(prev => ({
        ...prev,
        result,
        isProcessing: false,
        processingState: {
          ...prev.processingState,
          isProcessing: false,
          stage: 'complete',
          message: 'SOAP notes generated successfully!',
        },
      }));

      toast.success('SOAP notes generated successfully!');

    } catch (error) {
      handleError(error, 'processing');
    }
  }, [patientProfile, state.audioBlob, state.fileName, updateProcessingState, handleError]);

  const handleConversationProcess = useCallback(async () => {
    if (!patientProfile) {
      handleError(new Error('Patient profile is required'), 'validation');
      return;
    }

    try {
      setState(prev => ({ ...prev, isProcessing: true, error: null }));

      // Simulate conversation processing with mock data
      updateProcessingState({
        isProcessing: true,
        progress: 20,
        stage: 'analyzing',
        message: 'Analyzing conversation...'
      });

      // Mock delay for processing
      await new Promise(resolve => setTimeout(resolve, 2000));

      updateProcessingState({
        isProcessing: true,
        progress: 60,
        stage: 'generating',
        message: 'Generating SOAP notes from conversation...'
      });

      await new Promise(resolve => setTimeout(resolve, 1500));

      // Mock SOAP result from conversation
      const mockResult = {
        status: 'success' as const,
        message: 'SOAP notes generated successfully from conversation',
        timestamp: new Date().toISOString(),
        data: {
          status: 'completed' as const,
          message: 'Conversation analysis complete',
          session_id: `conv_${Date.now()}`,
          transcription: {
            text: 'Conversation-based medical interview completed',
            confidence: 0.95,
            language: 'en',
            duration: 300
          },
          validation: {
            validated_text: 'Validated conversation content',
            corrections: [],
            flags: [],
            confidence: 0.95
          },
          specialty_detection: {
            detected_specialty: 'Emergency Medicine',
            confidence: 0.92,
            focus_areas: ['Acute Coronary Syndrome', 'Chest Pain Evaluation']
          },
          soap_notes: {
            subjective: '58-year-old male with acute onset chest pain x 2 hours. Pain described as heavy pressure in center of chest, radiating to left arm and jaw. Associated with shortness of breath, diaphoresis, and nausea. Onset while mowing lawn.',
            objective: 'Vital Signs: BP 160/95, HR 95, O2 sat 96%. Patient appears uncomfortable, diaphoretic. EKG shows acute changes consistent with ACS.',
            assessment: 'Acute coronary syndrome/STEMI. Multiple cardiac risk factors including HTN, DM, smoking history, and strong family history of premature CAD.',
            plan: 'ACS protocol initiated, cardiology consultation, plan for cardiac catheterization. Patient education provided, family notification arranged.',
            icd_codes: ['I21.9', 'I25.10']
          },
          quality_metrics: {
            completeness_score: 0.92,
            clinical_accuracy: 0.95,
            documentation_quality: 0.88,
            red_flags: ['Acute chest pain with radiation', 'Multiple cardiac risk factors'],
            missing_information: ['Allergies confirmation', 'Current medications dosages']
          },
          safety_check: {
            is_safe: false,
            red_flags: ['Acute coronary syndrome', 'High-risk chest pain'],
            critical_items: ['Immediate cardiology consultation required', 'Continuous cardiac monitoring']
          },
          enhanced_pipeline: true
        }
      };

      setState(prev => ({
        ...prev,
        result: mockResult,
        isProcessing: false,
        processingState: {
          ...prev.processingState,
          isProcessing: false,
          stage: 'complete',
          message: 'SOAP notes generated successfully from conversation!',
        },
      }));

      toast.success('SOAP notes generated successfully from conversation!');

    } catch (error) {
      handleError(error, 'processing');
    }
  }, [patientProfile, updateProcessingState, handleError]);

  // ============================================================================
  // SAVE SOAP NOTE (will be implemented after database schema update)
  // ============================================================================

  const saveSOAPNote = useCallback(async (result: SOAPProcessingResponse) => {
    if (!patientProfile || !result.data) {
      throw new Error('Missing required data for saving SOAP note');
    }

    try {
      // Use the enhanced create mutation with full data structure
      const soapNoteId = await createSOAPNote({
        patientId: patientProfile._id,
        // Legacy SOAP fields (for backward compatibility)
        subjective: result.data.soap_notes.subjective,
        objective: result.data.soap_notes.objective,
        assessment: result.data.soap_notes.assessment,
        plan: result.data.soap_notes.plan,
        qualityScore: Math.round(result.data.quality_metrics.completeness_score * 100),
        processingTime: `${result.data.transcription?.duration || 0} seconds`,
        recommendations: result.data.quality_metrics.missing_information || [],
        // Enhanced fields
        sessionId: result.data.session_id,
        specialty: result.data.specialty_detection.detected_specialty,
        specialtyConfidence: result.data.specialty_detection.confidence,
        focusAreas: result.data.specialty_detection.focus_areas,
        // Quality metrics
        completenessScore: result.data.quality_metrics.completeness_score,
        clinicalAccuracy: result.data.quality_metrics.clinical_accuracy,
        documentationQuality: result.data.quality_metrics.documentation_quality,
        redFlags: result.data.quality_metrics.red_flags,
        missingInformation: result.data.quality_metrics.missing_information,
        // Safety assessment
        isSafe: result.data.safety_check.is_safe,
        safetyRedFlags: result.data.safety_check.red_flags,
        criticalItems: result.data.safety_check.critical_items,
        // Transcription data
        transcriptionText: result.data.transcription?.text,
        transcriptionConfidence: result.data.transcription?.confidence,
        transcriptionLanguage: result.data.transcription?.language,
        transcriptionDuration: result.data.transcription?.duration,
        // Enhanced structured data (serialize complex objects as JSON)
        structuredSubjective: JSON.stringify(result.data.soap_notes.soap_notes?.subjective || {}),
        structuredObjective: JSON.stringify(result.data.soap_notes.soap_notes?.objective || {}),
        structuredAssessment: JSON.stringify(result.data.soap_notes.soap_notes?.assessment || {}),
        structuredPlan: JSON.stringify(result.data.soap_notes.soap_notes?.plan || {}),
      });

      toast.success('SOAP note saved successfully!');

      // Navigate to the saved SOAP note
      router.push(`/patient/soap/view/${soapNoteId}`);

      return soapNoteId;
    } catch (error) {
      handleError(error, 'processing');
      throw error;
    }
  }, [patientProfile, createSOAPNote, router, handleError]);

  // ============================================================================
  // RETURN HOOK INTERFACE
  // ============================================================================

  return {
    state,
    actions: {
      setMode,
      setTextInput,
      handleAudioReady,
      handleAudioRemove,
      handleTextProcess,
      handleAudioProcess,
      handleConversationProcess,
      clearError,
      reset,
      saveSOAPNote,
    },
  };
}
