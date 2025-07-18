# SOAP Generation APIs Documentation

This document provides comprehensive documentation for the MedScribe SOAP generation APIs, including curl examples, TypeScript interfaces, and response structures.

## Table of Contents
- [Overview](#overview)
- [API Endpoints](#api-endpoints)
- [Authentication](#authentication)
- [Input Interfaces](#input-interfaces)
- [Output Interfaces](#output-interfaces)
- [Curl Examples](#curl-examples)
- [Error Handling](#error-handling)

## Overview

The MedScribe backend provides two main endpoints for SOAP note generation:
- `/process-audio` - Processes audio files through the complete pipeline
- `/process-text` - Processes transcribed text directly

Both APIs use an enhanced agentic pipeline that includes:
1. Audio transcription (audio only)
2. Medical terminology validation
3. Specialty detection
4. SOAP note generation
5. Clinical reasoning enhancement
6. Quality assurance
7. Safety checks

## API Endpoints

### Base URL
```
http://localhost:8000/api/v1
```

### Endpoints
- `POST /process-audio` - Process audio file for SOAP generation
- `POST /process-text` - Process text for SOAP generation

## Authentication

Currently, the APIs do not require authentication. In production, implement appropriate authentication mechanisms.

## Input Interfaces

### Process Audio Request
```typescript
interface ProcessAudioRequest {
  audio_file: File; // Audio file (.mp3, .wav, .m4a, .flac)
  patient_id: string; // Patient identifier
}
```

### Process Text Request
```typescript
interface ProcessTextRequest {
  text: string; // Transcribed medical text (minimum 10 characters)
  patient_id: string; // Patient identifier
}
```

## Output Interfaces

### Main Response Structure
```typescript
interface SOAPGenerationResponse {
  status: "success" | "error";
  message: string;
  timestamp: string; // ISO 8601 format
  data?: ProcessingResult;
  error?: string;
}
```

### Core Processing Result
```typescript
interface ProcessingResult {
  // Enhanced pipeline fields
  session_id: string;
  patient_id: string;
  transcription?: TranscriptionResult; // Only for process-audio
  validation_result: ValidationResult;
  specialty_detection: SpecialtyConfiguration;
  soap_notes: SOAPNotesData;
  quality_metrics: QualityMetrics;
  safety_check: SafetyCheck;
  qa_results: QualityAssessment;
  document?: DocumentResult;
  enhanced_pipeline: boolean;
  
  // Legacy compatibility fields
  status?: string;
  message?: string;
  processing_summary?: ProcessingSummary;
  deliverables?: Deliverables;
  recommendations?: string[];
  total_processing_time?: string; // Format: "MM:SS"
  completed_at?: string; // ISO 8601 format
}
```

### SOAP Notes Structure
```typescript
interface SOAPNotesData {
  soap_notes: SOAPNotesStructured;
  quality_metrics: QualityMetrics;
  session_id: string;
  specialty: string;
  
  // Legacy compatibility fields
  subjective: string;
  objective: string;
  assessment: string;
  plan: string;
  icd_codes: string[];
}

interface SOAPNotesStructured {
  subjective: SubjectiveSection;
  objective: ObjectiveSection;
  assessment: AssessmentSection;
  plan: PlanSection;
  clinical_notes: string;
}
```

### Detailed Section Interfaces
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
  vital_signs: Record<string, any>;
  physical_exam: Record<string, any>;
  diagnostic_results: string[];
  mental_status: string;
  functional_status: string;
}

interface AssessmentSection {
  primary_diagnosis: PrimaryDiagnosis;
  differential_diagnoses: DifferentialDiagnosis[];
  problem_list: ProblemListItem[];
  risk_level: "low" | "moderate" | "high";
  risk_factors: string[];
  prognosis: string;
}

interface PlanSection {
  diagnostic_workup: string[];
  treatments: string[];
  medications: string[];
  follow_up: FollowUpItem[];
  patient_education: string[];
  referrals: string[];
}
```

### Supporting Data Structures
```typescript
interface PrimaryDiagnosis {
  diagnosis: string;
  icd10_code: string;
  confidence: number;
  severity: "mild" | "moderate" | "severe";
  clinical_reasoning: string;
}

interface DifferentialDiagnosis {
  diagnosis: string;
  icd10_code: string;
  probability: number;
  ruling_out_criteria: string;
}

interface ProblemListItem {
  problem: string;
  status: "active" | "resolved" | "chronic";
  priority: "high" | "medium" | "low";
}

interface FollowUpItem {
  provider: string;
  timeframe: string;
  urgency: "routine" | "urgent" | "stat";
}

interface QualityMetrics {
  completeness_score: number;
  clinical_accuracy: number;
  documentation_quality: number;
  red_flags: string[];
  missing_information: string[];
}

interface QualityAssessment {
  quality_score: number;
  errors: string[];
  warnings: string[];
  recommendations: string[];
  critical_flags: Record<string, any>[];
  approved: boolean;
}

interface SafetyCheck {
  is_safe: boolean;
  red_flags: string[];
  critical_items: string[];
}

interface TranscriptionResult {
  text: string;
  confidence: number;
  language: string;
  duration: number;
}

interface ValidationResult {
  validated_text: string;
  corrections: Record<string, any>[];
  flags: Record<string, any>[];
  confidence: number;
}

interface SpecialtyConfiguration {
  specialty: string;
  confidence: number;
  reasoning: string;
  templates: Record<string, any>;
}

interface DocumentResult {
  document_path?: string;
  success: boolean;
  error?: string;
}

interface ProcessingSummary {
  transcription: string;
  validation: string;
  soap_generation: string;
  quality_assurance: string;
  highlighting: string;
  document_creation: string;
  ehr_integration: string;
}

interface Deliverables {
  clinical_notes: {
    subjective: string;
    objective: string;
    assessment: string;
    plan: string;
  };
  highlighted_html: string;
  google_doc_url?: string;
  ehr_record_id?: string;
}
```

## Curl Examples

### Process Audio File

```bash
curl -X POST "http://localhost:8000/api/v1/process-audio" \
  -H "Content-Type: multipart/form-data" \
  -F "audio_file=@/path/to/audio/file.mp3" \
  -F "patient_id=PATIENT_12345"
```

### Process Text

```bash
curl -X POST "http://localhost:8000/api/v1/process-text" \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Patient presents with chest pain that started 2 hours ago. Pain is described as sharp, 8/10 intensity, radiating to left arm. Patient has history of hypertension and diabetes. Vital signs: BP 150/90, HR 95, RR 18, O2 sat 98%. Physical exam reveals tenderness over precordium. EKG shows ST elevation in leads II, III, aVF.",
    "patient_id": "PATIENT_12345"
  }'
```

### Example Response (Success)

```json
{
  "status": "success",
  "message": "Enhanced audio processing completed successfully",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "data": {
    "session_id": "audio_PATIENT_12345_1705312200",
    "patient_id": "PATIENT_12345",
    "transcription": {
      "text": "Patient presents with chest pain...",
      "confidence": 0.95,
      "language": "en",
      "duration": 120.5
    },
    "soap_notes": {
      "soap_notes": {
        "subjective": {
          "chief_complaint": "Chest pain",
          "history_present_illness": "Patient presents with acute onset chest pain...",
          "review_of_systems": ["Cardiovascular: Positive for chest pain"],
          "past_medical_history": ["Hypertension", "Diabetes mellitus"],
          "medications": ["Metformin", "Lisinopril"],
          "allergies": ["NKDA"],
          "social_history": "Non-smoker, occasional alcohol use"
        },
        "objective": {
          "vital_signs": {
            "blood_pressure": "150/90",
            "heart_rate": 95,
            "respiratory_rate": 18,
            "oxygen_saturation": 98
          },
          "physical_exam": {
            "cardiovascular": "Tenderness over precordium",
            "respiratory": "Clear to auscultation bilaterally"
          },
          "diagnostic_results": ["EKG shows ST elevation in leads II, III, aVF"],
          "mental_status": "Alert and oriented",
          "functional_status": "Ambulatory"
        },
        "assessment": {
          "primary_diagnosis": {
            "diagnosis": "ST-elevation myocardial infarction (STEMI)",
            "icd10_code": "I21.9",
            "confidence": 0.9,
            "severity": "severe",
            "clinical_reasoning": "Based on clinical presentation and EKG findings"
          },
          "differential_diagnoses": [
            {
              "diagnosis": "Unstable angina",
              "icd10_code": "I20.0",
              "probability": 0.1,
              "ruling_out_criteria": "ST elevation present"
            }
          ],
          "problem_list": [
            {
              "problem": "Acute myocardial infarction",
              "status": "active",
              "priority": "high"
            }
          ],
          "risk_level": "high",
          "risk_factors": ["Hypertension", "Diabetes"],
          "prognosis": "Guarded, requires immediate intervention"
        },
        "plan": {
          "diagnostic_workup": ["Cardiac enzymes", "Chest X-ray"],
          "treatments": ["Aspirin 325mg", "Clopidogrel 600mg loading dose"],
          "medications": ["Atorvastatin 80mg daily"],
          "follow_up": [
            {
              "provider": "Cardiology",
              "timeframe": "Within 24 hours",
              "urgency": "stat"
            }
          ],
          "patient_education": ["Signs of cardiac emergency"],
          "referrals": ["Emergency cardiology consultation"]
        },
        "clinical_notes": "Patient requires immediate cardiac catheterization"
      },
      "quality_metrics": {
        "completeness_score": 0.95,
        "clinical_accuracy": 0.92,
        "documentation_quality": 0.88,
        "red_flags": ["Acute MI - requires immediate intervention"],
        "missing_information": ["Family history"]
      },
      "session_id": "audio_PATIENT_12345_1705312200",
      "specialty": "cardiology"
    },
    "safety_check": {
      "is_safe": false,
      "red_flags": ["Acute STEMI"],
      "critical_items": ["Requires immediate cardiac catheterization"]
    },
    "enhanced_pipeline": true
  }
}
```

## Error Handling

### Error Response Structure
```typescript
interface ErrorResponse {
  status: "error";
  message: string;
  timestamp: string;
  error: string;
  path?: string;
}
```

### Common Error Scenarios

#### Invalid File Format (Audio)
```bash
# Response: 400 Bad Request
{
  "status": "error",
  "message": "Invalid file format",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "error": "Only .mp3, .wav, .m4a, .flac files are supported"
}
```

#### Text Too Short
```bash
# Response: 400 Bad Request
{
  "status": "error",
  "message": "Text validation failed",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "error": "Text must be at least 10 characters long"
}
```

#### Processing Failure
```bash
# Response: 500 Internal Server Error
{
  "status": "error",
  "message": "Enhanced audio processing failed",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "error": "Transcription service unavailable"
}
```

## Notes

1. **File Size Limits**: Audio files should be under 100MB
2. **Processing Time**: Audio processing typically takes 30-120 seconds depending on file length
3. **Text Processing**: Text processing is faster, typically 10-30 seconds
4. **Quality Scores**: Range from 0.0 to 1.0, with higher scores indicating better quality
5. **Safety Checks**: Critical findings trigger safety flags and require immediate attention
6. **Specialty Detection**: Automatically detects medical specialty based on content
7. **Legacy Compatibility**: Response includes both structured and legacy format fields
```
