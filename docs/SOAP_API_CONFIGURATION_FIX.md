# SOAP API Configuration Fix

## Issue Identified
The backend was returning a 404 error for `/api/v1/process` because the environment variable was pointing to an incorrect endpoint.

## Root Cause
The `SOAP_API_URL` environment variable was set to:
```
SOAP_API_URL=http://localhost:8000/api/v1/process
```

But according to the backend documentation, the correct endpoints are:
- Audio Processing: `/api/v1/process-audio`
- Text Processing: `/api/v1/process-text`

## Changes Made

### 1. Updated Environment Variables (.env.local)
```bash
# Before
SOAP_API_URL=http://localhost:8000/api/v1/process

# After
SOAP_API_BASE_URL=http://localhost:8000
SOAP_API_URL=http://localhost:8000/api/v1/process-audio
SOAP_TEXT_API_URL=http://localhost:8000/api/v1/process-text
```

### 2. Updated Text Processing Route
Updated `app/api/patient/soap/text/route.ts` to use the new environment variable:
```typescript
// Before
const externalApiUrl = process.env.SOAP_API_URL || "http://localhost:8000/api/v1/process-text";

// After
const externalApiUrl = process.env.SOAP_TEXT_API_URL || "http://localhost:8000/api/v1/process-text";
```

### 3. Added Health Check Endpoint
Created `app/api/health/soap/route.ts` to test backend connectivity:
- Endpoint: `GET /api/health/soap`
- Tests connection to SOAP API backend
- Returns backend status and available endpoints

### 4. Fixed Error Logging
Updated error logging in SOAP generation components to properly serialize Error objects instead of showing `{}`.

## Backend Verification
Confirmed that the backend is running correctly:
- Health endpoint: ✅ `http://localhost:8000/health`
- Audio endpoint: ✅ `http://localhost:8000/api/v1/process-audio`
- Text endpoint: ✅ `http://localhost:8000/api/v1/process-text`

## Next Steps
1. **Restart Next.js development server** to pick up new environment variables
2. Test SOAP generation functionality
3. Monitor logs for any remaining issues

## Testing
You can test the configuration using:
```bash
# Test health check
curl http://localhost:3000/api/health/soap

# Test backend directly
curl http://localhost:8000/health
```

## Architecture Overview
```
Frontend (Next.js) → Next.js API Routes → Backend (FastAPI)
                   ↓
/patient/soap-generate → /api/patient/soap → /api/v1/process-audio
                      → /api/patient/soap/text → /api/v1/process-text
```

The configuration is now properly aligned with the backend API documentation.
