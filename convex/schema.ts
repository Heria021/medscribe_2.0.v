import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    name: v.string(),
    email: v.string(),
    passwordHash: v.string(),
    role: v.union(v.literal("doctor"), v.literal("patient")),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_email", ["email"])
    .index("by_role", ["role"]),

  // Patient Profile Schema
  patients: defineTable({
    userId: v.id("users"),
    firstName: v.string(),
    lastName: v.string(),
    dateOfBirth: v.string(),
    gender: v.union(v.literal("Male"), v.literal("Female"), v.literal("Other")),
    phone: v.optional(v.string()),
    email: v.optional(v.string()),
    address: v.optional(v.string()),
    nationality: v.optional(v.string()),
    ethnicity: v.optional(v.string()),
    maritalStatus: v.optional(v.union(
      v.literal("Single"),
      v.literal("Married"),
      v.literal("Divorced"),
      v.literal("Widowed")
    )),
    occupation: v.optional(v.string()),
    employerName: v.optional(v.string()),
    employerContact: v.optional(v.string()),
    governmentId: v.optional(v.string()),
    preferredLanguage: v.optional(v.string()),
    profileImageUrl: v.optional(v.string()),
    emergencyContactName: v.optional(v.string()),
    emergencyContactPhone: v.optional(v.string()),
    bloodGroup: v.optional(v.string()),
    consentToContact: v.boolean(),
    consentToDataShare: v.boolean(),
    accountType: v.union(v.literal("Patient"), v.literal("Guardian")),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user_id", ["userId"])
    .index("by_email", ["email"]),

  // Patient Medical History Schema
  patientMedicalHistory: defineTable({
    patientId: v.id("patients"),
    condition: v.string(),
    diagnosisDate: v.optional(v.string()), // ISO date string
    notes: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index("by_patient_id", ["patientId"]),

  // Patient Allergies Schema
  patientAllergies: defineTable({
    patientId: v.id("patients"),
    allergen: v.string(),
    reaction: v.optional(v.string()),
    severity: v.optional(v.union(
      v.literal("Mild"),
      v.literal("Moderate"),
      v.literal("Severe")
    )),
    createdAt: v.number(),
  })
    .index("by_patient_id", ["patientId"]),

  // Patient Insurance Schema
  patientInsurance: defineTable({
    patientId: v.id("patients"),
    providerName: v.string(),
    policyNumber: v.string(),
    coverageDetails: v.optional(v.string()),
    validFrom: v.optional(v.string()), // ISO date string
    validUntil: v.optional(v.string()), // ISO date string
    createdAt: v.number(),
  })
    .index("by_patient_id", ["patientId"]),

  // Audio Recordings Schema
  audioRecordings: defineTable({
    patientId: v.id("patients"),
    fileName: v.string(),
    fileSize: v.number(),
    duration: v.optional(v.number()), 
    mimeType: v.string(),
    storageId: v.optional(v.string()),
    status: v.union(
      v.literal("uploaded"),
      v.literal("processing"),
      v.literal("processed"),
      v.literal("failed")
    ),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_patient_id", ["patientId"])
    .index("by_status", ["status"]),

  // SOAP Notes Schema
  soapNotes: defineTable({
    patientId: v.id("patients"),
    audioRecordingId: v.optional(v.id("audioRecordings")),
    subjective: v.string(),
    objective: v.string(),
    assessment: v.string(),
    plan: v.string(),
    highlightedHtml: v.optional(v.string()),
    qualityScore: v.optional(v.number()),
    processingTime: v.optional(v.string()),
    recommendations: v.optional(v.array(v.string())),
    externalRecordId: v.optional(v.string()), // EHR integration ID
    googleDocUrl: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_patient_id", ["patientId"])
    .index("by_audio_recording_id", ["audioRecordingId"])
    .index("by_created_at", ["createdAt"]),

  // Shared SOAP Notes Schema
  sharedSoapNotes: defineTable({
    soapNoteId: v.id("soapNotes"),
    patientId: v.id("patients"),
    doctorId: v.id("doctors"),
    sharedBy: v.union(v.id("patients"), v.id("doctors")), // Who shared it (patient or doctor via referral)
    sharedByType: v.union(v.literal("patient"), v.literal("doctor")), // Type of sharer
    message: v.optional(v.string()), // Optional message
    shareType: v.union(
      v.literal("direct_share"), // Patient directly shared
      v.literal("referral_share") // Shared via referral acceptance
    ),
    relatedReferralId: v.optional(v.id("doctorActions")), // Link to referral if shared via referral
    isRead: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_soap_note_id", ["soapNoteId"])
    .index("by_doctor_id", ["doctorId"])
    .index("by_patient_id", ["patientId"])
    .index("by_shared_by", ["sharedBy"])
    .index("by_shared_by_type", ["sharedByType"])
    .index("by_share_type", ["shareType"])
    .index("by_related_referral_id", ["relatedReferralId"])
    .index("by_is_read", ["isRead"]),

  // Doctor Profile Schema
  doctors: defineTable({
    userId: v.id("users"),
    firstName: v.string(),
    lastName: v.string(),
    specialization: v.string(),
    licenseNumber: v.string(),
    qualification: v.optional(v.string()),
    experienceYears: v.optional(v.number()),
    department: v.optional(v.string()),
    phone: v.optional(v.string()),
    email: v.optional(v.string()),
    consultationFee: v.optional(v.number()),
    availableHours: v.optional(v.object({
      monday: v.optional(v.object({
        start: v.string(),
        end: v.string(),
        isAvailable: v.boolean(),
      })),
      tuesday: v.optional(v.object({
        start: v.string(),
        end: v.string(),
        isAvailable: v.boolean(),
      })),
      wednesday: v.optional(v.object({
        start: v.string(),
        end: v.string(),
        isAvailable: v.boolean(),
      })),
      thursday: v.optional(v.object({
        start: v.string(),
        end: v.string(),
        isAvailable: v.boolean(),
      })),
      friday: v.optional(v.object({
        start: v.string(),
        end: v.string(),
        isAvailable: v.boolean(),
      })),
      saturday: v.optional(v.object({
        start: v.string(),
        end: v.string(),
        isAvailable: v.boolean(),
      })),
      sunday: v.optional(v.object({
        start: v.string(),
        end: v.string(),
        isAvailable: v.boolean(),
      })),
    })),
    profileImageUrl: v.optional(v.string()),
    bio: v.optional(v.string()),
    languages: v.optional(v.array(v.string())),
    hospitalAffiliations: v.optional(v.array(v.string())),
    isActive: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user_id", ["userId"])
    .index("by_email", ["email"])
    .index("by_license_number", ["licenseNumber"])
    .index("by_specialization", ["specialization"])
    .index("by_is_active", ["isActive"]),

  // Doctor Actions on SOAP Notes
  doctorActions: defineTable({
    soapNoteId: v.id("soapNotes"),
    patientId: v.id("patients"),
    doctorId: v.id("doctors"),
    actionType: v.union(
      v.literal("immediate_assistance"),
      v.literal("schedule_appointment"),
      v.literal("refer_to_specialist")
    ),
    status: v.union(
      v.literal("pending"),
      v.literal("in_progress"),
      v.literal("completed"),
      v.literal("cancelled"),
      v.literal("accepted"), // For referrals accepted by specialist
      v.literal("declined")  // For referrals declined by specialist
    ),
    notes: v.optional(v.string()),
    // For immediate assistance
    assistanceProvided: v.optional(v.string()),
    // For appointments
    appointmentDate: v.optional(v.number()),
    appointmentTime: v.optional(v.string()),
    appointmentType: v.optional(v.string()),
    appointmentLocation: v.optional(v.string()),
    // For referrals
    specialistId: v.optional(v.id("doctors")),
    referralReason: v.optional(v.string()),
    urgencyLevel: v.optional(v.union(
      v.literal("low"),
      v.literal("medium"),
      v.literal("high"),
      v.literal("urgent")
    )),
    // For referral responses
    specialistResponse: v.optional(v.string()), // Response from specialist when accepting/declining
    acceptedAt: v.optional(v.number()), // When referral was accepted
    declinedAt: v.optional(v.number()), // When referral was declined
    soapSharedAt: v.optional(v.number()), // When SOAP was shared after acceptance
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_doctor_id", ["doctorId"])
    .index("by_patient_id", ["patientId"])
    .index("by_soap_note_id", ["soapNoteId"])
    .index("by_specialist_id", ["specialistId"])
    .index("by_status", ["status"])
    .index("by_action_type", ["actionType"]),

  // Notifications System
  notifications: defineTable({
    recipientId: v.id("users"),
    recipientType: v.union(v.literal("patient"), v.literal("doctor")),
    type: v.union(
      v.literal("soap_shared"),
      v.literal("assistance_provided"),
      v.literal("appointment_scheduled"),
      v.literal("referral_received"),
      v.literal("referral_sent"),
      v.literal("action_completed"),
      v.literal("action_updated")
    ),
    title: v.string(),
    message: v.string(),
    relatedSoapNoteId: v.optional(v.id("soapNotes")),
    relatedActionId: v.optional(v.id("doctorActions")),
    fromDoctorId: v.optional(v.id("doctors")),
    fromPatientId: v.optional(v.id("patients")),
    isRead: v.boolean(),
    createdAt: v.number(),
  })
    .index("by_recipient_id", ["recipientId"])
    .index("by_recipient_type", ["recipientType"])
    .index("by_type", ["type"])
    .index("by_is_read", ["isRead"])
    .index("by_created_at", ["createdAt"]),

  // Doctor-Patient Relationships Schema
  doctorPatients: defineTable({
    doctorId: v.id("doctors"),
    patientId: v.id("patients"),
    assignedBy: v.union(
      v.literal("referral_acceptance"), // Assigned when doctor accepts referral
      v.literal("appointment_scheduling"), // Assigned when doctor schedules appointment
      v.literal("direct_assignment") // Manually assigned
    ),
    relatedActionId: v.optional(v.id("doctorActions")), // Link to the action that caused assignment
    assignedAt: v.number(),
    isActive: v.boolean(), // Can be deactivated if patient switches doctors
    notes: v.optional(v.string()),
  })
    .index("by_doctor_id", ["doctorId"])
    .index("by_patient_id", ["patientId"])
    .index("by_assigned_by", ["assignedBy"])
    .index("by_is_active", ["isActive"])
    .index("by_doctor_patient", ["doctorId", "patientId"])
    .index("by_assigned_at", ["assignedAt"]),

  // Appointments Schema
  appointments: defineTable({
    patientId: v.id("patients"),
    doctorId: v.id("doctors"),
    appointmentDate: v.number(), // Timestamp for the appointment date
    appointmentTime: v.string(), // Time in HH:MM format
    appointmentType: v.string(), // "consultation", "follow-up", "check-up", etc.
    appointmentLocation: v.optional(v.string()), // "clinic", "virtual", specific address
    status: v.union(
      v.literal("scheduled"),
      v.literal("confirmed"),
      v.literal("in_progress"),
      v.literal("completed"),
      v.literal("cancelled"),
      v.literal("no_show")
    ),
    notes: v.optional(v.string()),
    duration: v.optional(v.number()), // Duration in minutes
    relatedSoapNoteId: v.optional(v.id("soapNotes")), // If appointment was created from SOAP note
    relatedActionId: v.optional(v.id("doctorActions")), // If appointment was created from doctor action
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_patient_id", ["patientId"])
    .index("by_doctor_id", ["doctorId"])
    .index("by_appointment_date", ["appointmentDate"])
    .index("by_status", ["status"])
    .index("by_patient_date", ["patientId", "appointmentDate"])
    .index("by_doctor_date", ["doctorId", "appointmentDate"]),
});