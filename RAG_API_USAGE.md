# MedScribe Dual-Role RAG API Usage Guide

## Overview

The MedScribe RAG (Retrieval-Augmented Generation) system provides intelligent knowledge storage and retrieval for both **doctors** and **patients** with complete data isolation. This guide provides comprehensive cURL examples and integration patterns for frontend developers.

## Base URL
```
http://localhost:8000/api/v1/rag
```

## Authentication
Currently, no authentication is required for testing. In production, add appropriate headers.

---

## 🏥 Doctor APIs

### 1. Store Doctor Data (Embedding)

**Endpoint:** `POST /rag/embed`

#### Schedule Management
```bash
curl -X POST http://localhost:8000/api/v1/rag/embed \
  -H "Content-Type: application/json" \
  -d '{
    "doctor_id": "doctor_001",
    "event_type": "schedule_slots",
    "data": "Available appointments for July 20, 2025: 9:00 AM consultation (30 min), 10:30 AM consultation (30 min), 2:00 PM procedure (60 min), 3:30 PM consultation (30 min)",
    "metadata": {
      "specialty": "cardiology",
      "location": "clinic_room_1",
      "date": "2025-07-20"
    }
  }'
```

**Response:**
```json
{
  "success": true,
  "message": "Successfully stored schedule_slots data for doctor doctor_001",
  "error": null,
  "role_type": "doctor",
  "role_id": "doctor_001",
  "event_type": "schedule_slots",
  "data_length": 179,
  "processing_time_seconds": 1.68,
  "knowledge_base_stats": {
    "total_entries": 1,
    "event_types": {
      "schedule_slots": 1
    },
    "latest_entry": "2025-07-16T18:07:56.458612+00:00",
    "earliest_entry": "2025-07-16T18:07:56.458612+00:00",
    "role_type": "doctor",
    "role_id": "doctor_001"
  },
  "stored_at": "2025-07-16T18:07:56.537775+00:00"
}
```

#### Patient Notes
```bash
curl -X POST http://localhost:8000/api/v1/rag/embed \
  -H "Content-Type: application/json" \
  -d '{
    "doctor_id": "doctor_001",
    "event_type": "patient_notes",
    "data": "Patient John Doe (ID: patient_123) visited for routine checkup. Blood pressure: 120/80, Heart rate: 72 bpm. Prescribed metoprolol 50mg twice daily. Follow-up in 4 weeks.",
    "metadata": {
      "patient_id": "patient_123",
      "visit_type": "routine_checkup",
      "medications_prescribed": ["metoprolol"],
      "follow_up_weeks": 4
    }
  }'
```

#### Medication Prescriptions
```bash
curl -X POST http://localhost:8000/api/v1/rag/embed \
  -H "Content-Type: application/json" \
  -d '{
    "doctor_id": "doctor_001",
    "event_type": "medication_prescription",
    "data": "Prescribed lisinopril 10mg daily for patient_456 with mild hypertension. Monitor blood pressure weekly. Avoid potassium supplements.",
    "metadata": {
      "patient_id": "patient_456",
      "medication": "lisinopril",
      "dosage": "10mg daily",
      "condition": "mild_hypertension",
      "monitoring": "weekly_bp_check"
    }
  }'
```

### 2. Search Doctor Knowledge

**Endpoint:** `POST /rag/search/doctor`

#### Query Schedule
```bash
curl -X POST http://localhost:8000/api/v1/rag/search/doctor \
  -H "Content-Type: application/json" \
  -d '{
    "doctor_id": "doctor_001",
    "query": "What appointments do I have available tomorrow?",
    "similarity_threshold": 0.7,
    "max_results": 5,
    "include_context": true
  }'
```

**Response:**
```json
{
  "success": true,
  "message": "Successfully generated response for doctor doctor_001",
  "error": null,
  "role_type": "doctor",
  "role_id": "doctor_001",
  "query": "What appointments do I have available tomorrow?",
  "response": "Based on the provided context, your available appointments for July 20, 2025, are as follows:\n\n1. 9:00 AM - Consultation (30 min)\n2. 10:30 AM - Consultation (30 min)\n3. 2:00 PM - Procedure (60 min)\n4. 3:30 PM - Consultation (30 min)",
  "structured_response": {
    "type": "schedule_overview",
    "summary": "Schedule and appointment information",
    "data": {
      "available_slots": [
        {
          "date": "2025-07-20",
          "content": "[DOCTOR] SCHEDULE_SLOTS: Available appointments for July 20, 2025: 9:00 AM consultation (30 min), 10:30 AM consultation (30 min), 2:00 PM procedure (60 min), 3:30 PM consultation (30 min)"
        }
      ],
      "booked_appointments": []
    },
    "timestamp": "2025-07-16T18:17:13.875071+00:00"
  },
  "relevant_documents_count": 1,
  "relevant_documents": [
    {
      "id": "f3e64d28-36c5-4733-bc71-a63f777624be",
      "role_type": "doctor",
      "role_id": "doctor_001",
      "event_type": "schedule_slots",
      "content": "Available appointments for July 20, 2025: 9:00 AM consultation (30 min), 10:30 AM consultation (30 min), 2:00 PM procedure (60 min), 3:30 PM consultation (30 min)",
      "similarity_score": 0.8234567890123456,
      "created_at": "2025-07-16T18:07:56.458612+00:00",
      "metadata": {
        "specialty": "cardiology",
        "location": "clinic_room_1",
        "date": "2025-07-20"
      }
    }
  ],
  "context_used": true,
  "similarity_threshold": 0.7,
  "max_results": 5,
  "processing_time_seconds": 2.55,
  "generated_at": "2025-07-16T18:17:13.875071+00:00"
}
```

#### Query Patient Information
```bash
curl -X POST http://localhost:8000/api/v1/rag/search/doctor \
  -H "Content-Type: application/json" \
  -d '{
    "doctor_id": "doctor_001",
    "query": "What medications did I prescribe for patient_123?",
    "similarity_threshold": 0.6,
    "max_results": 10,
    "include_context": true
  }'
```

### 3. Get Doctor Knowledge Summary

**Endpoint:** `GET /rag/doctor/{doctor_id}/summary`

```bash
curl -s http://localhost:8000/api/v1/rag/doctor/doctor_001/summary
```

**Response:**
```json
{
  "success": true,
  "role_type": "doctor",
  "role_id": "doctor_001",
  "knowledge_base_summary": {
    "total_entries": 3,
    "event_types": {
      "schedule_slots": 1,
      "patient_notes": 1,
      "medication_prescription": 1
    },
    "latest_entry": "2025-07-16T18:07:56.458612+00:00",
    "earliest_entry": "2025-07-16T17:54:23.105430+00:00",
    "role_type": "doctor",
    "role_id": "doctor_001"
  },
  "generated_at": "2025-07-16T18:45:08.484531+00:00"
}
```

---

## 👤 Patient APIs

### 1. Store Patient Data (Embedding)

**Endpoint:** `POST /rag/embed`

#### Symptom Reports
```bash
curl -X POST http://localhost:8000/api/v1/rag/embed \
  -H "Content-Type: application/json" \
  -d '{
    "patient_id": "patient_123",
    "event_type": "symptom_report",
    "data": "I have been experiencing mild dizziness in the mornings, especially when I stand up quickly. This started about a week after I increased my blood pressure medication.",
    "metadata": {
      "severity": "mild",
      "frequency": "daily_morning",
      "related_medication": "metoprolol",
      "duration": "1_week"
    }
  }'
```

#### Medication Adherence
```bash
curl -X POST http://localhost:8000/api/v1/rag/embed \
  -H "Content-Type: application/json" \
  -d '{
    "patient_id": "patient_123",
    "event_type": "medication_adherence",
    "data": "I have been taking my metoprolol 50mg twice daily as prescribed. I take it at 8 AM and 8 PM with food. I missed one dose last Tuesday but have been consistent otherwise.",
    "metadata": {
      "medication": "metoprolol",
      "adherence_rate": "95%",
      "missed_doses": 1,
      "timing": "8am_8pm_with_food"
    }
  }'
```

#### Vital Signs
```bash
curl -X POST http://localhost:8000/api/v1/rag/embed \
  -H "Content-Type: application/json" \
  -d '{
    "patient_id": "patient_123",
    "event_type": "vital_signs",
    "data": "Blood pressure reading: 125/82 mmHg, Heart rate: 68 bpm, Weight: 75 kg, Temperature: 98.6°F. Measured at home using digital monitor.",
    "metadata": {
      "bp_systolic": 125,
      "bp_diastolic": 82,
      "heart_rate": 68,
      "weight_kg": 75,
      "temperature_f": 98.6,
      "measurement_location": "home"
    }
  }'
```

### 2. Search Patient Knowledge

**Endpoint:** `POST /rag/search/patient`

#### Query Symptoms
```bash
curl -X POST http://localhost:8000/api/v1/rag/search/patient \
  -H "Content-Type: application/json" \
  -d '{
    "patient_id": "patient_123",
    "query": "What symptoms have I reported recently?",
    "similarity_threshold": 0.5,
    "max_results": 5,
    "include_context": true
  }'
```

**Response:**
```json
{
  "success": true,
  "message": "Successfully generated response for patient patient_123",
  "error": null,
  "role_type": "patient",
  "role_id": "patient_123",
  "query": "What symptoms have I reported recently?",
  "response": "Based on the provided context, you have recently reported experiencing mild dizziness in the mornings, especially when you stand up quickly. This symptom started about a week after you increased your blood pressure medication.",
  "structured_response": {
    "type": "symptom_analysis",
    "summary": "Symptom and health status information",
    "data": {
      "reports": [
        {
          "type": "symptom_report",
          "date": "2025-07-16T18:20:07.006008+00:00",
          "content": "[PATIENT] SYMPTOM_REPORT: I have been experiencing mild dizziness in the mornings, especially when I stand up quickly. This started about a week after I increased my blood pressure medication."
        }
      ],
      "assessments": []
    },
    "timestamp": "2025-07-16T18:21:03.306151+00:00"
  },
  "relevant_documents_count": 1,
  "relevant_documents": [
    {
      "id": "f0a05669-5d1d-4cd9-a165-f98c4c820b69",
      "role_type": "patient",
      "role_id": "patient_123",
      "event_type": "symptom_report",
      "content": "I have been experiencing mild dizziness in the mornings, especially when I stand up quickly. This started about a week after I increased my blood pressure medication.",
      "similarity_score": 0.8876392185688019,
      "created_at": "2025-07-16T18:20:07.006008+00:00",
      "metadata": {
        "severity": "mild",
        "frequency": "daily_morning",
        "related_medication": "metoprolol",
        "duration": "1_week"
      }
    }
  ],
  "context_used": true,
  "similarity_threshold": 0.5,
  "max_results": 5,
  "processing_time_seconds": 1.74,
  "generated_at": "2025-07-16T18:21:03.306151+00:00"
}
```

#### Query Medication History
```bash
curl -X POST http://localhost:8000/api/v1/rag/search/patient \
  -H "Content-Type: application/json" \
  -d '{
    "patient_id": "patient_123",
    "query": "How well am I taking my medications?",
    "similarity_threshold": 0.6,
    "max_results": 5,
    "include_context": true
  }'
```

### 3. Get Patient Knowledge Summary

**Endpoint:** `GET /rag/patient/{patient_id}/summary`

```bash
curl -s http://localhost:8000/api/v1/rag/patient/patient_123/summary
```

**Response:**
```json
{
  "success": true,
  "patient_id": "patient_123",
  "knowledge_base_summary": {
    "total_entries": 3,
    "event_types": {
      "symptom_report": 1,
      "medication_adherence": 1,
      "vital_signs": 1
    },
    "latest_entry": "2025-07-16T18:20:07.006008+00:00",
    "earliest_entry": "2025-07-16T17:55:30.378170+00:00",
    "role_type": "patient",
    "role_id": "patient_123"
  },
  "generated_at": "2025-07-16T18:45:18.167807+00:00"
}
```

---

## 🔄 Legacy Compatibility

### Legacy Patient Search (Backward Compatibility)

**Endpoint:** `POST /rag/search`

```bash
curl -X POST http://localhost:8000/api/v1/rag/search \
  -H "Content-Type: application/json" \
  -d '{
    "patient_id": "patient_123",
    "query": "medication adherence",
    "similarity_threshold": 0.5,
    "max_results": 5,
    "include_context": true
  }'
```

**Response (Legacy Format):**
```json
{
  "success": true,
  "message": "Successfully generated response for patient patient_123",
  "error": null,
  "patient_id": "patient_123",
  "query": "medication adherence",
  "response": "Based on the provided context, you have been taking your metoprolol 50mg twice daily as prescribed...",
  "relevant_documents_count": 1,
  "relevant_documents": [...],
  "context_used": true,
  "similarity_threshold": 0.5,
  "max_results": 5,
  "processing_time_seconds": 1.67,
  "generated_at": "2025-07-16T18:00:02.105124+00:00"
}
```

---

## 🏥 System Health

### RAG System Health Check

**Endpoint:** `GET /rag/health`

```bash
curl -s http://localhost:8000/api/v1/rag/health
```

**Response:**
```json
{
  "status": "healthy",
  "service": "RAG",
  "timestamp": "2024-01-01T00:00:00Z",
  "endpoints": [
    "/rag/embed",
    "/rag/search/doctor",
    "/rag/search/patient",
    "/rag/search",
    "/rag/doctor/{doctor_id}/summary",
    "/rag/patient/{patient_id}/summary",
    "/rag/embed-form",
    "/rag/search-form"
  ],
  "features": [
    "Dual-role support (doctors and patients)",
    "Structured response types",
    "Cross-role search for doctors",
    "Backward compatibility",
    "Event type validation"
  ]
}
```

---

## 📋 Event Types Reference

### Doctor Event Types
- `schedule_slots` - Available appointment slots
- `patient_notes` - Clinical notes about patients
- `medication_prescription` - Prescribed medications
- `procedure_notes` - Procedure documentation
- `consultation_summary` - Consultation summaries
- `referral_notes` - Patient referrals

### Patient Event Types
- `symptom_report` - Patient-reported symptoms
- `medication_adherence` - Medication compliance reports
- `vital_signs` - Self-measured vital signs
- `appointment_request` - Appointment booking requests
- `health_goals` - Personal health objectives
- `lifestyle_changes` - Diet, exercise, lifestyle updates

---

## 🔒 Data Isolation & Security

### Role-Based Access Control
- **Doctors** can only access their own data via `doctor_id`
- **Patients** can only access their own data via `patient_id`
- **Cross-role queries** are automatically blocked
- **Data isolation** is enforced at the database level

### Error Handling
```json
{
  "error": "Cannot specify both doctor_id and patient_id",
  "timestamp": "2025-07-16T17:46:11.169279+00:00"
}
```

```json
{
  "error": "Must specify either doctor_id or patient_id",
  "timestamp": "2025-07-16T17:58:01.149112+00:00"
}
```

---

## 📊 Response Structure Types

### Structured Response Types

#### Doctor Responses
- `schedule_overview` - Schedule and appointment information
- `patient_summary` - Patient information and notes
- `prescription_history` - Medication prescription records

#### Patient Responses  
- `symptom_analysis` - Symptom reports and analysis
- `medication_status` - Medication adherence and status
- `appointment_status` - Appointment requests and history
- `health_tracking` - Vital signs and health metrics

---

## 🚀 Integration Best Practices

### 1. Error Handling
Always check the `success` field and handle errors gracefully:

```javascript
const response = await fetch('/api/v1/rag/search/patient', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(searchData)
});

const result = await response.json();

if (!result.success) {
  console.error('RAG API Error:', result.error);
  // Handle error appropriately
  return;
}

// Process successful response
console.log('AI Response:', result.response);
console.log('Structured Data:', result.structured_response);
```

### 2. Similarity Threshold Guidelines
- **0.8-1.0**: Very high similarity (exact matches)
- **0.6-0.8**: High similarity (recommended for most queries)
- **0.4-0.6**: Medium similarity (broader search)
- **0.2-0.4**: Low similarity (very broad search)
- **0.0-0.2**: Very low similarity (may include irrelevant results)

### 3. Metadata Best Practices
Include relevant metadata for better search and organization:

```json
{
  "metadata": {
    "severity": "mild|moderate|severe",
    "frequency": "daily|weekly|monthly|occasional",
    "duration": "1_day|1_week|1_month|ongoing",
    "related_medication": "medication_name",
    "measurement_location": "home|clinic|hospital",
    "follow_up_required": true|false
  }
}
```

### 4. Structured Response Usage
Use the `structured_response` field for UI components:

```javascript
if (result.structured_response) {
  switch (result.structured_response.type) {
    case 'schedule_overview':
      renderScheduleComponent(result.structured_response.data);
      break;
    case 'symptom_analysis':
      renderSymptomChart(result.structured_response.data);
      break;
    case 'medication_status':
      renderMedicationTracker(result.structured_response.data);
      break;
    default:
      renderGenericResponse(result.response);
  }
}
```

### 5. Performance Optimization
- Use appropriate `max_results` values (5-10 for most cases)
- Set reasonable `similarity_threshold` values
- Include `include_context: false` if you don't need document details
- Cache knowledge base summaries for dashboard views

---

## 🔧 Troubleshooting

### Common Issues

1. **No results found**: Lower the `similarity_threshold` or check if data exists
2. **Slow responses**: Reduce `max_results` or check server performance
3. **Invalid role errors**: Ensure only one of `doctor_id` or `patient_id` is specified
4. **Empty responses**: Verify data has been embedded before searching

### Debug Information
Each response includes:
- `processing_time_seconds` - Performance metrics
- `similarity_score` - Relevance scoring for each document
- `generated_at` - Response timestamp
- `relevant_documents_count` - Number of matching documents

---

## 💡 Advanced Use Cases

### Multi-Document Search
Search across multiple event types:

```bash
curl -X POST http://localhost:8000/api/v1/rag/search/doctor \
  -H "Content-Type: application/json" \
  -d '{
    "doctor_id": "doctor_001",
    "query": "Show me all information about patient_123",
    "similarity_threshold": 0.4,
    "max_results": 20,
    "include_context": true
  }'
```

### Temporal Queries
Search for time-specific information:

```bash
curl -X POST http://localhost:8000/api/v1/rag/search/patient \
  -H "Content-Type: application/json" \
  -d '{
    "patient_id": "patient_123",
    "query": "What were my symptoms last week?",
    "similarity_threshold": 0.5,
    "max_results": 10,
    "include_context": true
  }'
```

### Medication Interaction Queries
```bash
curl -X POST http://localhost:8000/api/v1/rag/search/doctor \
  -H "Content-Type: application/json" \
  -d '{
    "doctor_id": "doctor_001",
    "query": "What medications did I prescribe that might interact with lisinopril?",
    "similarity_threshold": 0.6,
    "max_results": 15,
    "include_context": true
  }'
```

---

## 🔄 Batch Operations

### Bulk Data Import
For importing historical data, make multiple embed calls:

```javascript
const historicalData = [
  {
    doctor_id: "doctor_001",
    event_type: "patient_notes",
    data: "Patient visit 1...",
    metadata: { patient_id: "patient_123", date: "2025-01-15" }
  },
  {
    doctor_id: "doctor_001",
    event_type: "patient_notes",
    data: "Patient visit 2...",
    metadata: { patient_id: "patient_123", date: "2025-02-15" }
  }
];

for (const item of historicalData) {
  await fetch('/api/v1/rag/embed', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(item)
  });

  // Add delay to avoid rate limiting
  await new Promise(resolve => setTimeout(resolve, 100));
}
```

---

## � TypeScript Interfaces

### Core API Types

```typescript
// Base types
export type RoleType = 'doctor' | 'patient';

export interface BaseRequest {
  similarity_threshold?: number;
  max_results?: number;
  include_context?: boolean;
}

export interface EmbedRequest {
  doctor_id?: string;
  patient_id?: string;
  event_type: string;
  data: string;
  metadata?: Record<string, any>;
}

export interface SearchRequest extends BaseRequest {
  doctor_id?: string;
  patient_id?: string;
  query: string;
}

// Response types
export interface BaseResponse {
  success: boolean;
  error?: string;
  timestamp?: string;
}

export interface EmbedResponse extends BaseResponse {
  message?: string;
  role_type: RoleType;
  role_id: string;
  event_type: string;
  data_length: number;
  processing_time_seconds: number;
  knowledge_base_stats: KnowledgeBaseStats;
  stored_at: string;
}

export interface KnowledgeBaseStats {
  total_entries: number;
  event_types: Record<string, number>;
  latest_entry: string;
  earliest_entry: string;
  role_type: RoleType;
  role_id: string;
}

export interface RelevantDocument {
  id: string;
  role_type: RoleType;
  role_id: string;
  event_type: string;
  content: string;
  content_chunk: string;
  metadata: Record<string, any>;
  created_at: string;
  similarity_score: number;
}

export interface StructuredResponse {
  type: 'schedule_overview' | 'symptom_analysis' | 'medication_status' | 'appointment_status' | 'patient_summary' | 'prescription_history' | 'health_tracking';
  summary: string;
  data: Record<string, any>;
  timestamp: string;
}

export interface SearchResponse extends BaseResponse {
  message?: string;
  role_type?: RoleType;
  role_id?: string;
  patient_id?: string; // For legacy compatibility
  query: string;
  response: string;
  structured_response?: StructuredResponse;
  relevant_documents_count: number;
  relevant_documents: RelevantDocument[];
  context_used: boolean;
  similarity_threshold: number;
  max_results: number;
  processing_time_seconds: number;
  generated_at: string;
}

export interface SummaryResponse extends BaseResponse {
  role_type?: RoleType;
  role_id?: string;
  patient_id?: string; // For legacy compatibility
  knowledge_base_summary: KnowledgeBaseStats;
  generated_at: string;
}

export interface HealthResponse {
  status: string;
  service: string;
  timestamp: string;
  endpoints: string[];
  features: string[];
}

// Event-specific metadata types
export interface ScheduleMetadata {
  specialty?: string;
  location?: string;
  date?: string;
  duration_minutes?: number;
}

export interface SymptomMetadata {
  severity?: 'mild' | 'moderate' | 'severe';
  frequency?: 'daily' | 'weekly' | 'monthly' | 'occasional';
  duration?: string;
  related_medication?: string;
  triggers?: string;
}

export interface MedicationMetadata {
  medication?: string;
  dosage?: string;
  adherence_rate?: string;
  missed_doses?: number;
  timing?: string;
  condition?: string;
}

export interface VitalSignsMetadata {
  bp_systolic?: number;
  bp_diastolic?: number;
  heart_rate?: number;
  weight_kg?: number;
  temperature_f?: number;
  measurement_location?: 'home' | 'clinic' | 'hospital';
}
```

---

**Happy coding! 🚀**
