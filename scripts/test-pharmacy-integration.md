# Testing Pharmacy Integration (TypeScript)

## Prerequisites

1. **Install dependencies:**
   ```bash
   npm install
   # tsx should be installed automatically from package.json
   ```

2. **Start your MedScribe app:**
   ```bash
   npm run dev
   # App should be running on http://localhost:3000
   ```

## Testing Methods

### Method 1: Web-Based Testing (Easiest) 🌐
```bash
# Go to: http://localhost:3000/test/pharmacy
# Click "Run All Tests" button
```

### Method 2: TypeScript Test Script 🧪
```bash
npm run test:pharmacy
# or
npx tsx scripts/test-pharmacy-api.ts
```

### Method 3: Manual UI Testing 🖱️
```bash
# 1. Login as doctor
# 2. Go to patient → treatments → add treatment plan
# 3. Look for "E-Prescribing" section
# 4. Test prescription form
```

### Method 4: API Testing with curl 📡
```bash
# See examples below
```

## Step 1: Initialize Test Data

### 1.1 Seed Pharmacy and Drug Data
```bash
# Method 1: Using API endpoint (if you have admin access)
curl -X POST http://localhost:3000/api/setup/pharmacy-integration \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"

# Method 2: Using Convex dashboard
# Go to Convex Dashboard > Functions
# Run: api.pharmacies.seedPharmacyData({})
# Run: api.drugInteractions.seedInteractionData({})
```

### 1.2 Verify Data was Created
```bash
# Check pharmacies
curl http://localhost:3000/api/pharmacies/search?limit=10

# Expected response:
{
  "success": true,
  "data": [
    {
      "ncpdpId": "0000001",
      "name": "CVS Pharmacy #1234",
      "address": {...},
      "phone": "(555) 123-4567"
    }
  ]
}
```

## Step 2: Test Drug Interaction Checking

### 2.1 Test Basic Drug Interaction
```bash
curl -X POST http://localhost:3000/api/drug-interactions/check \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_DOCTOR_TOKEN" \
  -d '{
    "medications": ["Warfarin", "Aspirin"]
  }'

# Expected response:
{
  "success": true,
  "data": {
    "hasInteractions": true,
    "interactions": [
      {
        "severity": "major",
        "description": "Increased risk of bleeding when warfarin is combined with aspirin"
      }
    ]
  }
}
```

### 2.2 Test Patient-Specific Interaction Check
```bash
curl -X POST http://localhost:3000/api/drug-interactions/check \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_DOCTOR_TOKEN" \
  -d '{
    "patientId": "PATIENT_ID_HERE",
    "newMedication": "Warfarin"
  }'
```

## Step 3: Test Prescription Creation

### 3.1 Create a Test Prescription
```bash
curl -X POST http://localhost:3000/api/prescriptions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_DOCTOR_TOKEN" \
  -d '{
    "patientId": "PATIENT_ID_HERE",
    "medication": {
      "name": "Amoxicillin",
      "genericName": "Amoxicillin",
      "strength": "500mg",
      "dosageForm": "tablet"
    },
    "dosage": {
      "quantity": "30 tablets",
      "frequency": "Three times daily",
      "instructions": "Take one tablet by mouth three times daily with food",
      "refills": 2
    },
    "pharmacy": {
      "ncpdpId": "0000001",
      "name": "CVS Pharmacy #1234",
      "address": "123 Main St, New York, NY 10001",
      "phone": "(555) 123-4567"
    },
    "deliveryMethod": "electronic",
    "priority": "routine"
  }'

# Expected response:
{
  "success": true,
  "data": {
    "prescriptionId": "PRESCRIPTION_ID",
    "safetyChecks": {...},
    "sendResult": {...}
  }
}
```

### 3.2 Test Prescription with Drug Interaction
```bash
curl -X POST http://localhost:3000/api/prescriptions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_DOCTOR_TOKEN" \
  -d '{
    "patientId": "PATIENT_ID_WITH_WARFARIN",
    "medication": {
      "name": "Aspirin",
      "strength": "325mg",
      "dosageForm": "tablet"
    },
    "dosage": {
      "quantity": "30 tablets",
      "frequency": "Once daily",
      "instructions": "Take one tablet by mouth once daily",
      "refills": 0
    }
  }'

# Expected response should include safety warnings
```

## Step 4: Test UI Components

### 4.1 Test Prescription Form
1. Go to a patient's treatment plan page
2. Create a new treatment plan
3. Look for "E-Prescribing" section
4. Click "Add Prescription"
5. Fill out the form:
   - Medication: "Lisinopril"
   - Strength: "10mg"
   - Quantity: "30 tablets"
   - Frequency: "Once daily"
   - Instructions: "Take one tablet by mouth once daily"

### 4.2 Test Drug Interaction Warnings
1. In prescription form, enter "Warfarin"
2. Should see safety warnings if patient has conflicting medications
3. Try entering "Aspirin" for a patient already on Warfarin

### 4.3 Test Pharmacy Selection
1. In prescription form, click pharmacy dropdown
2. Should see list of pharmacies (CVS, Walgreens, etc.)
3. Select a pharmacy
4. Should see pharmacy details displayed

## Step 5: Test Error Scenarios

### 5.1 Test Missing Required Fields
```bash
curl -X POST http://localhost:3000/api/prescriptions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_DOCTOR_TOKEN" \
  -d '{
    "patientId": "PATIENT_ID_HERE"
  }'

# Expected: 400 error with validation message
```

### 5.2 Test Unauthorized Access
```bash
curl -X POST http://localhost:3000/api/prescriptions \
  -H "Content-Type: application/json" \
  -d '{
    "patientId": "PATIENT_ID_HERE",
    "medication": {...}
  }'

# Expected: 401 Unauthorized error
```

### 5.3 Test Invalid Patient ID
```bash
curl -X POST http://localhost:3000/api/prescriptions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_DOCTOR_TOKEN" \
  -d '{
    "patientId": "INVALID_ID",
    "medication": {...}
  }'

# Expected: 404 Patient not found error
```

## Step 6: Test Prescription Status Flow

### 6.1 Create Prescription (Status: pending)
### 6.2 Send Prescription Electronically
```bash
curl -X POST http://localhost:3000/api/prescriptions/send \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_DOCTOR_TOKEN" \
  -d '{
    "prescriptionId": "PRESCRIPTION_ID_HERE"
  }'

# Expected: Status changes to "sent"
```

### 6.3 Check Prescription Status
```bash
curl http://localhost:3000/api/prescriptions?patientId=PATIENT_ID_HERE \
  -H "Authorization: Bearer YOUR_DOCTOR_TOKEN"

# Should show updated status
```

## Step 7: Performance Testing

### 7.1 Test Multiple Prescriptions
Create 10+ prescriptions for the same patient and verify:
- UI loads quickly
- Drug interactions are checked for all
- No performance degradation

### 7.2 Test Large Pharmacy Directory
- Search pharmacies by zip code
- Verify search is fast
- Test pagination if implemented

## Step 8: Integration Testing

### 8.1 Test with Treatment Plans
1. Create treatment plan with medications
2. Add prescription for same medication
3. Verify data consistency

### 8.2 Test with Patient Allergies
1. Add allergy to patient profile
2. Try prescribing that medication
3. Should see allergy alert

## Expected Test Results

### ✅ Success Criteria
- [ ] Pharmacy data loads successfully
- [ ] Drug interactions are detected correctly
- [ ] Prescriptions can be created and sent
- [ ] Safety warnings appear appropriately
- [ ] UI components render without errors
- [ ] API responses are properly formatted
- [ ] Error handling works as expected

### ❌ Common Issues to Watch For
- Missing authentication tokens
- Invalid patient/doctor IDs
- Network connectivity issues
- Database schema mismatches
- Missing environment variables

## Troubleshooting

### Issue: "Pharmacy data not found"
**Solution:** Run the seed data scripts first

### Issue: "Drug interaction check fails"
**Solution:** Verify drug names match exactly (case-sensitive)

### Issue: "Prescription creation fails"
**Solution:** Check all required fields are provided

### Issue: "UI components don't load"
**Solution:** Verify imports and component paths are correct
