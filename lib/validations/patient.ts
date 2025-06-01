import { z } from "zod";

// Patient Profile Schema
export const patientProfileSchema = z.object({
  firstName: z
    .string()
    .min(2, "First name must be at least 2 characters")
    .max(100, "First name must be less than 100 characters"),
  lastName: z
    .string()
    .min(2, "Last name must be at least 2 characters")
    .max(100, "Last name must be less than 100 characters"),
  dateOfBirth: z
    .string()
    .min(1, "Date of birth is required")
    .refine((date) => {
      const birthDate = new Date(date);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      return age >= 0 && age <= 150;
    }, "Please enter a valid date of birth"),
  gender: z.enum(["Male", "Female", "Other"], {
    required_error: "Please select a gender",
  }),
  phone: z
    .string()
    .optional()
    .refine((phone) => {
      if (!phone) return true;
      return /^[\+]?[1-9][\d]{0,15}$/.test(phone.replace(/[\s\-\(\)]/g, ""));
    }, "Please enter a valid phone number"),
  email: z
    .string()
    .email("Please enter a valid email address")
    .optional()
    .or(z.literal("")),
  address: z
    .string()
    .max(500, "Address must be less than 500 characters")
    .optional(),
  nationality: z
    .string()
    .max(50, "Nationality must be less than 50 characters")
    .optional(),
  ethnicity: z
    .string()
    .max(50, "Ethnicity must be less than 50 characters")
    .optional(),
  maritalStatus: z
    .enum(["Single", "Married", "Divorced", "Widowed"])
    .optional(),
  occupation: z
    .string()
    .max(100, "Occupation must be less than 100 characters")
    .optional(),
  employerName: z
    .string()
    .max(100, "Employer name must be less than 100 characters")
    .optional(),
  employerContact: z
    .string()
    .max(50, "Employer contact must be less than 50 characters")
    .optional(),
  governmentId: z
    .string()
    .max(50, "Government ID must be less than 50 characters")
    .optional(),
  preferredLanguage: z
    .string()
    .max(50, "Preferred language must be less than 50 characters")
    .optional(),
  emergencyContactName: z
    .string()
    .max(100, "Emergency contact name must be less than 100 characters")
    .optional(),
  emergencyContactPhone: z
    .string()
    .optional()
    .refine((phone) => {
      if (!phone) return true;
      return /^[\+]?[1-9][\d]{0,15}$/.test(phone.replace(/[\s\-\(\)]/g, ""));
    }, "Please enter a valid emergency contact phone number"),
  bloodGroup: z
    .string()
    .max(5, "Blood group must be less than 5 characters")
    .optional(),
  consentToContact: z.boolean().default(false),
  consentToDataShare: z.boolean().default(false),
  accountType: z.enum(["Patient", "Guardian"]).default("Patient"),
});

// Medical History Schema
export const medicalHistorySchema = z.object({
  condition: z
    .string()
    .min(1, "Condition is required")
    .max(500, "Condition must be less than 500 characters"),
  diagnosisDate: z
    .string()
    .optional()
    .refine((date) => {
      if (!date) return true;
      const diagnosisDate = new Date(date);
      const today = new Date();
      return diagnosisDate <= today;
    }, "Diagnosis date cannot be in the future"),
  notes: z
    .string()
    .max(1000, "Notes must be less than 1000 characters")
    .optional(),
});

// Allergy Schema
export const allergySchema = z.object({
  allergen: z
    .string()
    .min(1, "Allergen is required")
    .max(200, "Allergen must be less than 200 characters"),
  reaction: z
    .string()
    .max(500, "Reaction must be less than 500 characters")
    .optional(),
  severity: z
    .enum(["Mild", "Moderate", "Severe"])
    .optional(),
});

// Insurance Schema
export const insuranceSchema = z.object({
  providerName: z
    .string()
    .min(1, "Provider name is required")
    .max(100, "Provider name must be less than 100 characters"),
  policyNumber: z
    .string()
    .min(1, "Policy number is required")
    .max(100, "Policy number must be less than 100 characters"),
  coverageDetails: z
    .string()
    .max(1000, "Coverage details must be less than 1000 characters")
    .optional(),
  validFrom: z
    .string()
    .optional()
    .refine((date) => {
      if (!date) return true;
      return new Date(date) instanceof Date;
    }, "Please enter a valid start date"),
  validUntil: z
    .string()
    .optional()
    .refine((date) => {
      if (!date) return true;
      return new Date(date) instanceof Date;
    }, "Please enter a valid end date"),
}).refine((data) => {
  if (data.validFrom && data.validUntil) {
    return new Date(data.validFrom) <= new Date(data.validUntil);
  }
  return true;
}, {
  message: "End date must be after start date",
  path: ["validUntil"],
});

// Type exports
export type PatientProfileFormData = z.infer<typeof patientProfileSchema>;
export type MedicalHistoryFormData = z.infer<typeof medicalHistorySchema>;
export type AllergyFormData = z.infer<typeof allergySchema>;
export type InsuranceFormData = z.infer<typeof insuranceSchema>;

// Blood group options
export const bloodGroupOptions = [
  "A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"
];

// Language options
export const languageOptions = [
  "English", "Spanish", "French", "German", "Italian", "Portuguese", 
  "Chinese", "Japanese", "Korean", "Arabic", "Hindi", "Russian", "Other"
];

// Nationality options (common ones)
export const nationalityOptions = [
  "American", "British", "Canadian", "Australian", "German", "French", 
  "Italian", "Spanish", "Chinese", "Japanese", "Indian", "Brazilian", 
  "Mexican", "Russian", "Other"
];

// Ethnicity options (common ones)
export const ethnicityOptions = [
  "White", "Black or African American", "Asian", "Hispanic or Latino", 
  "Native American", "Pacific Islander", "Mixed Race", "Other", "Prefer not to say"
];
