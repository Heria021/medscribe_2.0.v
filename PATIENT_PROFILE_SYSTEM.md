# Patient Profile System Documentation

## Overview
The Patient Profile System provides comprehensive patient data management with a complete profile interface, medical history tracking, allergy management, and insurance information storage.

## Database Schema

### Core Tables

#### 1. `patients` Table
```typescript
{
  userId: Id<"users">,              // Reference to users table
  firstName: string,               // Required
  lastName: string,                // Required
  dateOfBirth: string,             // ISO date string, required
  gender: "Male" | "Female" | "Other", // Required
  phone?: string,                  // Optional
  email?: string,                  // Optional
  address?: string,                // Optional
  nationality?: string,            // Optional
  ethnicity?: string,              // Optional
  maritalStatus?: "Single" | "Married" | "Divorced" | "Widowed",
  occupation?: string,             // Optional
  employerName?: string,           // Optional
  employerContact?: string,        // Optional
  governmentId?: string,           // Optional
  preferredLanguage?: string,      // Optional, defaults to "English"
  profileImageUrl?: string,        // Optional
  emergencyContactName?: string,   // Optional
  emergencyContactPhone?: string,  // Optional
  bloodGroup?: string,             // Optional (A+, A-, B+, B-, AB+, AB-, O+, O-)
  consentToContact: boolean,       // Defaults to false
  consentToDataShare: boolean,     // Defaults to false
  accountType: "Patient" | "Guardian", // Defaults to "Patient"
  createdAt: number,               // Timestamp
  updatedAt: number,               // Timestamp
}
```

#### 2. `patientMedicalHistory` Table
```typescript
{
  patientId: Id<"patients">,       // Reference to patients table
  condition: string,               // Required
  diagnosisDate?: string,          // ISO date string, optional
  notes?: string,                  // Optional
  createdAt: number,               // Timestamp
}
```

#### 3. `patientAllergies` Table
```typescript
{
  patientId: Id<"patients">,       // Reference to patients table
  allergen: string,                // Required
  reaction?: string,               // Optional
  severity?: "Mild" | "Moderate" | "Severe", // Optional
  createdAt: number,               // Timestamp
}
```

#### 4. `patientInsurance` Table
```typescript
{
  patientId: Id<"patients">,       // Reference to patients table
  providerName: string,            // Required
  policyNumber: string,            // Required
  coverageDetails?: string,        // Optional
  validFrom?: string,              // ISO date string, optional
  validUntil?: string,             // ISO date string, optional
  createdAt: number,               // Timestamp
}
```

## API Functions

### Patient Profile Management

#### `createPatientProfile`
Creates a new patient profile with default values.
```typescript
await createPatientProfile({
  userId: "user_id",
  firstName: "John",
  lastName: "Doe",
  dateOfBirth: "1990-01-01",
  gender: "Male",
  email: "john@example.com",
  phone: "+1234567890"
});
```

#### `getPatientByUserId`
Retrieves patient profile by user ID.
```typescript
const patient = await getPatientByUserId({ userId: "user_id" });
```

#### `updatePatientProfile`
Updates patient profile information.
```typescript
await updatePatientProfile({
  patientId: "patient_id",
  firstName: "Updated Name",
  phone: "+1987654321",
  // ... other fields
});
```

### Medical History Management

#### `addMedicalHistory`
Adds a medical history entry.
```typescript
await addMedicalHistory({
  patientId: "patient_id",
  condition: "Hypertension",
  diagnosisDate: "2023-01-15",
  notes: "Well controlled with medication"
});
```

#### `getPatientMedicalHistory`
Retrieves all medical history for a patient.
```typescript
const history = await getPatientMedicalHistory({ patientId: "patient_id" });
```

### Allergy Management

#### `addAllergy`
Adds an allergy record.
```typescript
await addAllergy({
  patientId: "patient_id",
  allergen: "Peanuts",
  reaction: "Anaphylaxis",
  severity: "Severe"
});
```

#### `getPatientAllergies`
Retrieves all allergies for a patient.
```typescript
const allergies = await getPatientAllergies({ patientId: "patient_id" });
```

### Insurance Management

#### `addInsurance`
Adds insurance information.
```typescript
await addInsurance({
  patientId: "patient_id",
  providerName: "Blue Cross Blue Shield",
  policyNumber: "BC123456789",
  coverageDetails: "Full coverage with $500 deductible",
  validFrom: "2024-01-01",
  validUntil: "2024-12-31"
});
```

## UI Components

### Profile Page Structure
The patient profile page is organized into four main tabs:

#### 1. Personal Information Tab
- **Basic Information**: Name, date of birth, gender, blood group
- **Contact Information**: Email, phone, address
- **Personal Details**: Nationality, ethnicity, marital status, language
- **Employment Information**: Occupation, employer details
- **Emergency Contact**: Name and phone number
- **Identification**: Government ID number

#### 2. Medical Information Tab
- **Medical History**: Add/view/delete medical conditions
- **Allergies**: Add/view/delete allergy information with severity levels

#### 3. Insurance Tab
- **Insurance Policies**: Add/view/delete insurance information
- **Coverage Details**: Policy numbers, validity periods, coverage descriptions

#### 4. Privacy & Consent Tab
- **Communication Preferences**: Consent to contact settings
- **Data Sharing**: Consent to data sharing with healthcare providers
- **Account Type**: Patient vs Guardian/Caregiver designation
- **Privacy Rights**: Information about data privacy and user rights

## Form Validation

### Validation Rules
- **Names**: 2-100 characters, required
- **Email**: Valid email format, optional
- **Phone**: International phone number format, optional
- **Date of Birth**: Valid date, age 0-150 years
- **Government ID**: Up to 50 characters
- **Medical Conditions**: Up to 500 characters
- **Allergies**: Allergen required, reaction and severity optional
- **Insurance**: Provider name and policy number required

### Zod Schemas
All forms use Zod validation schemas for type safety and validation:
- `patientProfileSchema`: Main profile validation
- `medicalHistorySchema`: Medical history validation
- `allergySchema`: Allergy information validation
- `insuranceSchema`: Insurance information validation

## Default Values

### New Patient Profile Defaults
```typescript
{
  address: "",
  nationality: "",
  ethnicity: "",
  maritalStatus: undefined,
  occupation: "",
  employerName: "",
  employerContact: "",
  governmentId: "",
  preferredLanguage: "English",
  profileImageUrl: undefined,
  emergencyContactName: "",
  emergencyContactPhone: "",
  bloodGroup: "",
  consentToContact: false,
  consentToDataShare: false,
  accountType: "Patient"
}
```

## Features

### User Experience
- **Tabbed Interface**: Organized information into logical sections
- **Real-time Validation**: Immediate feedback on form inputs
- **Auto-save**: Profile changes saved automatically
- **Responsive Design**: Works on all device sizes
- **Accessibility**: Proper ARIA labels and keyboard navigation

### Data Management
- **CRUD Operations**: Full create, read, update, delete functionality
- **Soft Validation**: Optional fields allow gradual profile completion
- **Data Integrity**: Foreign key relationships and constraints
- **Audit Trail**: Created/updated timestamps on all records

### Privacy & Security
- **Consent Management**: Granular consent controls
- **Data Encryption**: Sensitive data encrypted at rest
- **HIPAA Compliance**: Follows healthcare data privacy standards
- **User Rights**: Clear information about data privacy rights

## Integration Points

### Registration Flow
- Automatic patient profile creation during registration
- Basic profile populated from registration data
- User prompted to complete profile after first login

### Dashboard Integration
- Profile completion status displayed on dashboard
- Quick access to profile editing from user menu
- Profile data used throughout the application

### Future Enhancements
- Profile photo upload functionality
- Document attachment support
- Integration with external health systems
- Advanced privacy controls
- Multi-language support

## Usage Examples

### Creating a Complete Patient Profile
```typescript
// 1. Create basic profile during registration
const patientId = await createPatientProfile({
  userId: session.user.id,
  firstName: "John",
  lastName: "Doe",
  dateOfBirth: "1990-01-01",
  gender: "Male",
  email: "john@example.com"
});

// 2. Add medical history
await addMedicalHistory({
  patientId,
  condition: "Type 2 Diabetes",
  diagnosisDate: "2020-03-15",
  notes: "Managed with metformin"
});

// 3. Add allergies
await addAllergy({
  patientId,
  allergen: "Penicillin",
  reaction: "Rash",
  severity: "Moderate"
});

// 4. Add insurance
await addInsurance({
  patientId,
  providerName: "Health Insurance Co",
  policyNumber: "HIC123456",
  validFrom: "2024-01-01",
  validUntil: "2024-12-31"
});
```

This comprehensive patient profile system provides a solid foundation for managing patient data in the MedScribe application.
