# 🚀 MedScribe Enhanced SOAP Generation - Integration Guide

## 📋 Overview

The Enhanced SOAP Generation System provides AI-powered medical documentation with automatic specialty detection, quality metrics, and safety assessments. This guide covers complete integration for the MedScribe application.

## 🌐 API Endpoints

**Base URL**: `http://localhost:8000`

### Available Endpoints
- **Audio Processing**: `POST /api/v1/process-audio`
- **Text Processing**: `POST /api/v1/process-text`

---

## 🎤 Audio Processing Integration

### cURL Example
```bash
curl -X POST "http://localhost:8000/api/v1/process-audio" \
  -H "Content-Type: multipart/form-data" \
  -F "audio_file=@path/to/your/audio.mp3" \
  -F "patient_id=patient_123"
```

### TypeScript Input Interface
```typescript
interface AudioProcessingRequest {
  audio_file: File;  // Audio file (.mp3, .wav, .m4a, .flac)
  patient_id: string;
}
```

### JavaScript Integration
```typescript
async function processAudio(audioFile: File, patientId: string) {
  const formData = new FormData();
  formData.append('audio_file', audioFile);
  formData.append('patient_id', patientId);

  const response = await fetch('http://localhost:8000/api/v1/process-audio', {
    method: 'POST',
    body: formData,
  });

  const result: SOAPProcessingResponse = await response.json();
  return result;
}
```

---

## 📝 Text Processing Integration

### cURL Example
```bash
curl -X POST "http://localhost:8000/api/v1/process-text" \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Patient presents with chest pain...",
    "patient_id": "patient_123"
  }'
```

### TypeScript Input Interface
```typescript
interface TextProcessingRequest {
  text: string;      // Transcribed medical text
  patient_id: string;
}
```

### JavaScript Integration
```typescript
async function processText(text: string, patientId: string) {
  const requestBody: TextProcessingRequest = {
    text: text,
    patient_id: patientId
  };

  const response = await fetch('http://localhost:8000/api/v1/process-text', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(requestBody),
  });

  const result: SOAPProcessingResponse = await response.json();
  return result;
}
```

---

## 📊 TypeScript Interfaces - Response

### Main Response Interface
```typescript
interface SOAPProcessingResponse {
  status: "success" | "error";
  message: string;
  timestamp: string;
  data: ProcessingData;
}

interface ProcessingData {
  status: "completed";
  message: string;
  session_id: string;
  transcription: TranscriptionResult;
  validation: ValidationResult;
  specialty_detection: SpecialtyDetection;
  soap_notes: EnhancedSOAPNotes;
  quality_metrics: QualityMetrics;
  safety_check: SafetyCheck;
  enhanced_pipeline: boolean;
}
```

### Core Data Interfaces
```typescript
interface TranscriptionResult {
  text: string;
  confidence: number;  // 0.0 to 1.0
  language: string;    // e.g., "en"
  duration: number;    // in seconds
}

interface ValidationResult {
  validated_text: string;
  corrections: any[];
  flags: string[];     // Medical flags identified
  confidence: number;  // 0.0 to 1.0
}

interface SpecialtyDetection {
  detected_specialty: string;  // e.g., "Cardiology", "Endocrinology"
  confidence: number;          // 0.0 to 1.0
  focus_areas: string[];       // e.g., ["Acute Coronary Syndrome"]
}

interface QualityMetrics {
  completeness_score: number;      // 0.0 to 1.0
  clinical_accuracy: number;       // 0.0 to 1.0
  documentation_quality: number;   // 0.0 to 1.0
  red_flags: string[];            // Clinical red flags
  missing_information: string[];   // Missing required fields
}

interface SafetyCheck {
  is_safe: boolean;
  red_flags: string[];      // Safety concerns
  critical_items: string[]; // Critical safety items
}
```

---

## 🏗️ Enhanced SOAP Structure

### SOAP Notes Interface
```typescript
interface EnhancedSOAPNotes {
  soap_notes: StructuredSOAP;
  quality_metrics: QualityMetrics;
  session_id: string;
  specialty: string;
  // Legacy format for backward compatibility
  subjective: string;
  objective: string;
  assessment: string;
  plan: string;
  icd_codes: string[];
}

interface StructuredSOAP {
  subjective: SubjectiveSection;
  objective: ObjectiveSection;
  assessment: AssessmentSection;
  plan: PlanSection;
  clinical_notes: string;
}
```

### Detailed SOAP Sections
```typescript
interface SubjectiveSection {
  chief_complaint: string;
  history_present_illness: string;
  review_of_systems: string[];
  past_medical_history: string[];
  medications: string[];
  allergies: string[];
  social_history: string;
}

interface ObjectiveSection {
  vital_signs: {
    blood_pressure?: string;
    heart_rate?: string;
    temperature?: string;
    respiratory_rate?: string;
  };
  physical_exam: Record<string, string>;
  diagnostic_results: string[];
  mental_status: string;
  functional_status: string;
}

interface AssessmentSection {
  primary_diagnosis: {
    diagnosis: string;
    icd10_code: string;
    confidence: number;
    severity: "mild" | "moderate" | "severe";
    clinical_reasoning: string;
  };
  differential_diagnoses: Array<{
    diagnosis: string;
    icd10_code: string;
    probability: number;
    ruling_out_criteria: string;
  }>;
  problem_list: Array<{
    problem: string;
    status: "active" | "chronic" | "resolved";
    priority: "high" | "medium" | "low";
  }>;
  risk_level: "low" | "medium" | "high" | "critical";
  risk_factors: string[];
  prognosis: string;
}

interface PlanSection {
  diagnostic_workup: string[];
  treatments: string[];
  medications: string[];
  follow_up: Array<{
    provider: string;
    timeframe: string;
    urgency: "routine" | "urgent" | "stat";
  }>;
  patient_education: string[];
  referrals: string[];
}
```

---

## 🔧 Complete Integration Class

### MedScribe API Client
```typescript
export class MedScribeAPI {
  constructor(private baseUrl: string = 'http://localhost:8000') {}

  async processAudio(audioFile: File, patientId: string): Promise<SOAPProcessingResponse> {
    const formData = new FormData();
    formData.append('audio_file', audioFile);
    formData.append('patient_id', patientId);

    const response = await fetch(`${this.baseUrl}/api/v1/process-audio`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  async processText(text: string, patientId: string): Promise<SOAPProcessingResponse> {
    const response = await fetch(`${this.baseUrl}/api/v1/process-text`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: text,
        patient_id: patientId
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }
}
```

### Usage Example
```typescript
// Initialize API client
const medscribeAPI = new MedScribeAPI();

// Process audio
try {
  const audioResult = await medscribeAPI.processAudio(audioFile, 'patient_123');
  console.log('Detected specialty:', audioResult.data.specialty_detection.detected_specialty);
  console.log('Quality score:', audioResult.data.quality_metrics.completeness_score);
} catch (error) {
  console.error('Audio processing failed:', error);
}

// Process text
try {
  const textResult = await medscribeAPI.processText(
    'Patient presents with chest pain...', 
    'patient_123'
  );
  console.log('Primary diagnosis:', textResult.data.soap_notes.soap_notes.assessment.primary_diagnosis.diagnosis);
} catch (error) {
  console.error('Text processing failed:', error);
}
```

---

## 🎯 React Component Example

### MedScribe Integration Component
```typescript
import React, { useState } from 'react';

interface MedScribeIntegrationProps {
  apiBaseUrl?: string;
}

const MedScribeIntegration: React.FC<MedScribeIntegrationProps> = ({ 
  apiBaseUrl = 'http://localhost:8000' 
}) => {
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<SOAPProcessingResponse | null>(null);

  const handleAudioUpload = async (file: File, patientId: string) => {
    setProcessing(true);
    try {
      const api = new MedScribeAPI(apiBaseUrl);
      const result = await api.processAudio(file, patientId);
      setResult(result);
    } catch (error) {
      console.error('Audio processing failed:', error);
    } finally {
      setProcessing(false);
    }
  };

  const handleTextSubmit = async (text: string, patientId: string) => {
    setProcessing(true);
    try {
      const api = new MedScribeAPI(apiBaseUrl);
      const result = await api.processText(text, patientId);
      setResult(result);
    } catch (error) {
      console.error('Text processing failed:', error);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div>
      {processing && <div>Processing...</div>}
      
      {result && result.status === 'success' && (
        <div>
          <h3>🎯 Processing Results</h3>
          <div>
            <strong>Detected Specialty:</strong> {result.data.specialty_detection.detected_specialty}
            <span> ({Math.round(result.data.specialty_detection.confidence * 100)}% confidence)</span>
          </div>
          <div>
            <strong>Quality Scores:</strong>
            <ul>
              <li>Completeness: {Math.round(result.data.quality_metrics.completeness_score * 100)}%</li>
              <li>Clinical Accuracy: {Math.round(result.data.quality_metrics.clinical_accuracy * 100)}%</li>
              <li>Documentation Quality: {Math.round(result.data.quality_metrics.documentation_quality * 100)}%</li>
            </ul>
          </div>
          <div>
            <strong>Primary Diagnosis:</strong> {result.data.soap_notes.soap_notes.assessment.primary_diagnosis.diagnosis}
          </div>
          <div>
            <strong>Safety Status:</strong> 
            <span style={{color: result.data.safety_check.is_safe ? 'green' : 'red'}}>
              {result.data.safety_check.is_safe ? ' ✅ Safe' : ' ⚠️ Needs Review'}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default MedScribeIntegration;
```

---

## ❌ Error Handling

### Error Response Interface
```typescript
interface ErrorResponse {
  status: "error";
  message: string;
  timestamp: string;
  error?: string;
}
```

### Error Handling Example
```typescript
try {
  const result = await medscribeAPI.processText(text, patientId);
  
  if (result.status === 'error') {
    console.error('Processing failed:', result.message);
    // Handle error in UI
    return;
  }
  
  // Handle successful result
  console.log('Success:', result.data);
  
} catch (error) {
  console.error('Network or parsing error:', error);
  // Handle network errors
}
```

---

## 🚀 Quick Start Checklist

### Integration Steps
1. ✅ **Install Dependencies**: Ensure fetch API or axios is available
2. ✅ **Copy Interfaces**: Add TypeScript interfaces to your project
3. ✅ **Initialize API Client**: Create MedScribeAPI instance
4. ✅ **Handle File Upload**: For audio processing endpoint
5. ✅ **Handle Text Input**: For text processing endpoint
6. ✅ **Process Results**: Display SOAP notes and quality metrics
7. ✅ **Error Handling**: Implement proper error handling
8. ✅ **UI Integration**: Create components for your MedScribe app

### Key Features Available
- 🎤 **Audio Processing**: Upload and process medical audio recordings
- 📝 **Text Processing**: Process transcribed medical text
- 🤖 **AI Specialty Detection**: Automatic medical specialty identification
- 📊 **Quality Metrics**: Real-time documentation quality assessment
- 🛡️ **Safety Checks**: Red flag and critical item identification
- 📋 **Structured SOAP**: Comprehensive nested SOAP note format
- 🏥 **ICD-10 Codes**: Automatic medical coding
- 🔄 **Legacy Support**: Backward compatible with existing formats

---

## 📞 Support

For integration support or questions:
- Check server logs for detailed error information
- Ensure proper content types for requests
- Validate input data before sending requests
- Monitor response status codes for error handling

**Your Enhanced SOAP Generation System is ready for seamless MedScribe integration!** 🏥✨
