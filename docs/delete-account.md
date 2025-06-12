# Delete Account Feature

This document explains the comprehensive delete account functionality implemented in MedScribe.

## Overview

The delete account feature allows users to permanently delete their accounts and all associated data from the system. This includes a complete cascade deletion of all related records across all database tables.

## Security Features

- **Confirmation Required**: Users must type "DELETE MY ACCOUNT" to confirm
- **Session Validation**: Only authenticated users can delete their own accounts
- **Immediate Sign Out**: Users are automatically signed out after deletion
- **No Recovery**: Deleted data cannot be recovered

## Data Deletion Sequence

### For Patient Accounts

1. **Password Reset Tokens** - All reset tokens for the user
2. **Notifications** - All notifications sent to the user
3. **Chat Data** - All chat sessions and messages
4. **Medical Records**:
   - Patient medical history
   - Patient allergies
   - Patient insurance information
   - Audio recordings
5. **SOAP Notes**:
   - All SOAP notes for the patient
   - Shared SOAP notes involving the patient
   - Referrals related to SOAP notes
6. **Doctor-Patient Relationships**:
   - All doctor-patient relationships
   - Appointments with all doctors
   - Treatment plans and medications
7. **Referrals** - All referrals involving the patient
8. **Patient Profile** - The main patient record
9. **User Account** - The base user account

### For Doctor Accounts

1. **Password Reset Tokens** - All reset tokens for the user
2. **Notifications** - All notifications sent to the user
3. **Chat Data** - All chat sessions and messages
4. **Doctor-Patient Relationships**:
   - All relationships with patients
   - Appointments with all patients
   - Treatment plans and medications
5. **Referrals**:
   - Referrals sent by the doctor
   - Referrals received by the doctor
6. **Shared SOAP Notes**:
   - Notes shared with the doctor
   - Notes shared by the doctor
7. **Patient Updates** - Remove doctor as primary care physician
8. **Doctor Profile** - The main doctor record
9. **User Account** - The base user account

## Database Tables Affected

- `users` - Main user account
- `passwordResetTokens` - Password reset tokens
- `notifications` - User notifications
- `chatSessions` - Chat sessions
- `chatMessages` - Chat messages
- `patients` - Patient profiles
- `patientMedicalHistory` - Medical history
- `patientAllergies` - Allergy information
- `patientInsurance` - Insurance details
- `doctors` - Doctor profiles
- `audioRecordings` - Audio files
- `soapNotes` - SOAP notes
- `sharedSoapNotes` - Shared SOAP notes
- `doctorPatients` - Doctor-patient relationships
- `appointments` - Appointments
- `referrals` - Referrals
- `treatmentPlans` - Treatment plans
- `medications` - Medications

## API Endpoints

### DELETE /api/auth/delete-account

Deletes the authenticated user's account and all related data.

**Authentication**: Required (session-based)

**Response**:
```json
{
  "success": true,
  "message": "Account and all related data deleted successfully"
}
```

**Error Response**:
```json
{
  "error": "Error message"
}
```

## UI Components

### DeleteAccountDialog

A confirmation dialog component that:
- Shows detailed information about what will be deleted
- Requires typing "DELETE MY ACCOUNT" to confirm
- Displays user email and role
- Shows loading state during deletion
- Handles errors gracefully

**Props**:
- `userEmail`: string - User's email address
- `userRole`: string - User's role (doctor/patient)

## Usage

The delete account button is available in:
- **Patient Settings** → Security → Danger Zone
- **Doctor Settings** → Security → Danger Zone

## Implementation Details

### Convex Function: `deleteUserAccount`

```typescript
export const deleteUserAccount = mutation({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    // Comprehensive deletion logic
  }
});
```

### Helper Functions

- `deletePatientData(ctx, userId)` - Handles patient-specific deletions
- `deleteDoctorData(ctx, userId)` - Handles doctor-specific deletions

## Error Handling

- **Database Errors**: Wrapped in try-catch with rollback capability
- **Authentication Errors**: 401 Unauthorized for invalid sessions
- **Validation Errors**: Proper error messages for invalid requests
- **UI Errors**: Toast notifications for user feedback

## Testing

To test the delete account feature:

1. **Create a test account** (patient or doctor)
2. **Add some data** (appointments, SOAP notes, etc.)
3. **Navigate to Settings** → Security
4. **Click "Delete Account"**
5. **Type confirmation text**
6. **Confirm deletion**
7. **Verify account is deleted** and user is signed out
8. **Check database** to ensure all related data is removed

## Security Considerations

- **No Soft Delete**: All data is permanently removed
- **Cascade Deletion**: Ensures no orphaned records
- **Session Invalidation**: User is immediately signed out
- **Audit Trail**: Consider adding audit logs for compliance
- **Backup Strategy**: Ensure proper backups before deletion

## Compliance Notes

- **GDPR**: Supports right to erasure (right to be forgotten)
- **HIPAA**: Ensures complete removal of PHI
- **Data Retention**: Respects data retention policies
- **Legal Requirements**: May need to retain some data for legal purposes

## Future Enhancements

- **Soft Delete Option**: For regulatory compliance
- **Data Export**: Allow users to export data before deletion
- **Audit Logging**: Track deletion events
- **Admin Override**: Prevent deletion in certain cases
- **Scheduled Deletion**: Delay deletion for recovery period
