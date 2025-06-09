import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    email: v.string(),
    passwordHash: v.string(),
    role: v.union(v.literal("doctor"), v.literal("patient"), v.literal("admin")),
    isActive: v.boolean(),
    lastLoginAt: v.optional(v.number()),
    emailVerifiedAt: v.optional(v.number()),
    twoFactorEnabled: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_email", ["email"])
    .index("by_role", ["role"])
    .index("by_active", ["isActive"])
    .index("by_role_active", ["role", "isActive"]),

  patients: defineTable({
    userId: v.id("users"),
    firstName: v.string(),
    lastName: v.string(),
    dateOfBirth: v.string(),
    gender: v.union(v.literal("M"), v.literal("F"), v.literal("O"), v.literal("U")),
    primaryPhone: v.string(),
    secondaryPhone: v.optional(v.string()),
    email: v.string(),
    addressLine1: v.string(),
    addressLine2: v.optional(v.string()),
    city: v.string(),
    state: v.string(),
    zipCode: v.string(),
    country: v.string(),
    mrn: v.string(),
    nationalId: v.optional(v.string()),
    bloodType: v.optional(v.union(
      v.literal("A+"), v.literal("A-"), v.literal("B+"), v.literal("B-"),
      v.literal("AB+"), v.literal("AB-"), v.literal("O+"), v.literal("O-")
    )),
    emergencyContactName: v.string(),
    emergencyContactPhone: v.string(),
    emergencyContactRelation: v.string(),
    primaryCarePhysicianId: v.optional(v.id("doctors")),
    preferredLanguage: v.optional(v.string()),
    consentForTreatment: v.boolean(),
    consentForDataSharing: v.boolean(),
    advanceDirectives: v.optional(v.string()),
    isActive: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
    createdBy: v.id("users"),
    lastModifiedBy: v.id("users"),
  })
    .index("by_user_id", ["userId"])
    .index("by_mrn", ["mrn"])
    .index("by_primary_care", ["primaryCarePhysicianId"])
    .index("by_name", ["lastName", "firstName"])
    .index("by_email", ["email"])
    .index("by_phone", ["primaryPhone"])
    .index("by_location", ["city", "state"])
    .index("by_active", ["isActive"]),

  patientMedicalHistory: defineTable({
    patientId: v.id("patients"),
    condition: v.string(),
    diagnosisDate: v.optional(v.string()),
    notes: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index("by_patient_id", ["patientId"]),

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

  patientInsurance: defineTable({
    patientId: v.id("patients"),
    providerName: v.string(),
    policyNumber: v.string(),
    coverageDetails: v.optional(v.string()),
    validFrom: v.optional(v.string()),
    validUntil: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index("by_patient_id", ["patientId"]),

  doctors: defineTable({
    userId: v.id("users"),
    firstName: v.string(),
    lastName: v.string(),
    title: v.optional(v.string()),
    licenseNumber: v.string(),
    npiNumber: v.optional(v.string()),
    deaNumber: v.optional(v.string()),
    primarySpecialty: v.string(),
    secondarySpecialties: v.optional(v.array(v.string())),
    boardCertifications: v.optional(v.array(v.string())),
    medicalSchool: v.optional(v.string()),
    residency: v.optional(v.string()),
    fellowship: v.optional(v.string()),
    yearsOfExperience: v.optional(v.number()),
    phone: v.string(),
    email: v.string(),
    practiceName: v.optional(v.string()),
    department: v.optional(v.string()),
    hospitalAffiliations: v.optional(v.array(v.string())),
    isAcceptingNewPatients: v.boolean(),
    consultationFee: v.optional(v.number()),
    availabilitySchedule: v.optional(v.object({
      monday: v.optional(v.object({ start: v.string(), end: v.string(), available: v.boolean() })),
      tuesday: v.optional(v.object({ start: v.string(), end: v.string(), available: v.boolean() })),
      wednesday: v.optional(v.object({ start: v.string(), end: v.string(), available: v.boolean() })),
      thursday: v.optional(v.object({ start: v.string(), end: v.string(), available: v.boolean() })),
      friday: v.optional(v.object({ start: v.string(), end: v.string(), available: v.boolean() })),
      saturday: v.optional(v.object({ start: v.string(), end: v.string(), available: v.boolean() })),
      sunday: v.optional(v.object({ start: v.string(), end: v.string(), available: v.boolean() })),
    })),
    languagesSpoken: v.optional(v.array(v.string())),
    bio: v.optional(v.string()),
    profileImageUrl: v.optional(v.string()),
    isActive: v.boolean(),
    isVerified: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
    lastActiveAt: v.optional(v.number()),
  })
    .index("by_user_id", ["userId"])
    .index("by_license", ["licenseNumber"])
    .index("by_npi", ["npiNumber"])
    .index("by_specialty", ["primarySpecialty"])
    .index("by_active_verified", ["isActive", "isVerified"])
    .index("by_accepting_patients", ["isAcceptingNewPatients", "isActive"])
    .index("by_name", ["lastName", "firstName"])
    .index("by_department", ["department"]),

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
    .index("by_status", ["status"])
    .index("by_created_at", ["createdAt"]),

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
    externalRecordId: v.optional(v.string()),
    googleDocUrl: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_patient_id", ["patientId"])
    .index("by_audio_recording_id", ["audioRecordingId"])
    .index("by_created_at", ["createdAt"]),

  sharedSoapNotes: defineTable({
    soapNoteId: v.id("soapNotes"),
    patientId: v.id("patients"),
    sharedBy: v.union(v.id("patients"), v.id("doctors")),
    sharedByType: v.union(v.literal("patient"), v.literal("doctor")),
    sharedWith: v.id("doctors"),
    shareType: v.union(
      v.literal("direct_share"),
      v.literal("referral_share")
    ),
    referralId: v.optional(v.id("referrals")),
    message: v.optional(v.string()),
    isRead: v.boolean(),
    readAt: v.optional(v.number()),
    // Action tracking fields
    actionStatus: v.optional(v.union(
      v.literal("pending"),
      v.literal("reviewed"),
      v.literal("assistance_provided"),
      v.literal("appointment_scheduled"),
      v.literal("referral_sent"),
      v.literal("treatment_initiated")
    )),
    actionTakenAt: v.optional(v.number()),
    actionDetails: v.optional(v.string()),
    relatedActionId: v.optional(v.union(
      v.id("appointments"),
      v.id("referrals"),
      v.id("treatmentPlans")
    )),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_soap_note_id", ["soapNoteId"])
    .index("by_shared_by", ["sharedBy"])
    .index("by_shared_by_type", ["sharedByType"])
    .index("by_shared_with", ["sharedWith"])
    .index("by_patient_id", ["patientId"])
    .index("by_share_type", ["shareType"])
    .index("by_referral_id", ["referralId"])
    .index("by_is_read", ["isRead"])
    .index("by_shared_with_unread", ["sharedWith", "isRead"])
    .index("by_shared_by_type_share", ["sharedByType", "shareType"]),

  doctorPatients: defineTable({
    doctorId: v.id("doctors"),
    patientId: v.id("patients"),
    assignedBy: v.union(
      v.literal("referral_acceptance"),
      v.literal("appointment_scheduling"),
      v.literal("direct_assignment")
    ),
    relatedActionId: v.optional(v.union(v.id("appointments"), v.id("referrals"))),
    assignedAt: v.number(),
    isActive: v.boolean(),
    notes: v.optional(v.string()),
  })
    .index("by_doctor_id", ["doctorId"])
    .index("by_patient_id", ["patientId"])
    .index("by_assigned_by", ["assignedBy"])
    .index("by_is_active", ["isActive"])
    .index("by_doctor_patient", ["doctorId", "patientId"])
    .index("by_assigned_at", ["assignedAt"]),

  appointments: defineTable({
    doctorPatientId: v.id("doctorPatients"),
    appointmentDateTime: v.number(),
    duration: v.number(),
    timeZone: v.string(),
    appointmentType: v.union(
      v.literal("new_patient"),
      v.literal("follow_up"),
      v.literal("consultation"),
      v.literal("procedure"),
      v.literal("telemedicine"),
      v.literal("emergency")
    ),
    visitReason: v.string(),
    location: v.object({
      type: v.union(v.literal("in_person"), v.literal("telemedicine")),
      address: v.optional(v.string()),
      room: v.optional(v.string()),
      meetingLink: v.optional(v.string())
    }),
    status: v.union(
      v.literal("scheduled"),
      v.literal("confirmed"),
      v.literal("checked_in"),
      v.literal("in_progress"),
      v.literal("completed"),
      v.literal("no_show"),
      v.literal("cancelled"),
      v.literal("rescheduled")
    ),
    preVisitQuestionnaire: v.optional(v.string()),
    chiefComplaint: v.optional(v.string()),
    vitals: v.optional(v.object({
      height: v.optional(v.number()),
      weight: v.optional(v.number()),
      bmi: v.optional(v.number()),
      bloodPressure: v.optional(v.string()),
      temperature: v.optional(v.number()),
      heartRate: v.optional(v.number()),
      respiratoryRate: v.optional(v.number()),
      oxygenSaturation: v.optional(v.number())
    })),
    insuranceVerified: v.optional(v.boolean()),
    copayAmount: v.optional(v.number()),
    notes: v.optional(v.string()),
    scheduledAt: v.number(),
    confirmedAt: v.optional(v.number()),
    checkedInAt: v.optional(v.number()),
    startedAt: v.optional(v.number()),
    completedAt: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
    createdBy: v.id("users"),
  })
    .index("by_doctor_patient", ["doctorPatientId"])
    .index("by_datetime", ["appointmentDateTime"])
    .index("by_status", ["status"])
    .index("by_doctor_patient_date", ["doctorPatientId", "appointmentDateTime"])
    .index("by_appointment_type", ["appointmentType"])
    .index("by_doctor_patient_status", ["doctorPatientId", "status"]),

  referrals: defineTable({
    fromDoctorId: v.id("doctors"),
    toDoctorId: v.id("doctors"),
    patientId: v.id("patients"),
    soapNoteId: v.id("soapNotes"),
    specialtyRequired: v.string(),
    urgency: v.union(v.literal("routine"), v.literal("urgent"), v.literal("stat")),
    reasonForReferral: v.string(),
    clinicalQuestion: v.optional(v.string()),
    status: v.union(
      v.literal("pending"),
      v.literal("accepted"),
      v.literal("declined"),
      v.literal("completed"),
      v.literal("cancelled")
    ),
    responseMessage: v.optional(v.string()),
    sentAt: v.number(),
    respondedAt: v.optional(v.number()),
    completedAt: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_from_doctor", ["fromDoctorId"])
    .index("by_to_doctor", ["toDoctorId"])
    .index("by_patient", ["patientId"])
    .index("by_soap_note", ["soapNoteId"])
    .index("by_status", ["status"])
    .index("by_specialty", ["specialtyRequired"])
    .index("by_urgency", ["urgency"])
    .index("by_to_doctor_status", ["toDoctorId", "status"])
    .index("by_specialty_status", ["specialtyRequired", "status"]),

  treatmentPlans: defineTable({
    doctorPatientId: v.id("doctorPatients"),
    soapNoteId: v.optional(v.id("soapNotes")),
    title: v.string(),
    diagnosis: v.string(),
    plan: v.string(),
    goals: v.array(v.string()),
    status: v.union(
      v.literal("active"),
      v.literal("completed"),
      v.literal("discontinued")
    ),
    startDate: v.string(),
    endDate: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_doctor_patient", ["doctorPatientId"])
    .index("by_status", ["status"])
    .index("by_doctor_patient_status", ["doctorPatientId", "status"]),

  medications: defineTable({
    treatmentPlanId: v.id("treatmentPlans"),
    medicationName: v.string(),
    dosage: v.string(),
    frequency: v.string(),
    instructions: v.string(),
    startDate: v.string(),
    endDate: v.optional(v.string()),
    status: v.union(
      v.literal("active"),
      v.literal("completed"),
      v.literal("discontinued")
    ),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_treatment_plan", ["treatmentPlanId"])
    .index("by_status", ["status"])
    .index("by_treatment_plan_status", ["treatmentPlanId", "status"]),

  notifications: defineTable({
    recipientId: v.id("users"),
    recipientType: v.union(v.literal("doctor"), v.literal("patient")),
    category: v.union(
      v.literal("clinical"),
      v.literal("administrative"),
      v.literal("system"),
      v.literal("alert"),
      v.literal("reminder")
    ),
    type: v.string(),
    priority: v.union(v.literal("low"), v.literal("medium"), v.literal("high"), v.literal("urgent")),
    title: v.string(),
    message: v.string(),
    actionUrl: v.optional(v.string()),
    relatedRecords: v.optional(v.object({
      patientId: v.optional(v.id("patients")),
      doctorId: v.optional(v.id("doctors")),
      appointmentId: v.optional(v.id("appointments")),
      referralId: v.optional(v.id("referrals")),
      soapNoteId: v.optional(v.id("soapNotes")),
    })),
    channels: v.array(v.union(v.literal("in_app"), v.literal("email"), v.literal("sms"), v.literal("push"))),
    isRead: v.boolean(),
    readAt: v.optional(v.number()),
    createdAt: v.number(),
    expiresAt: v.optional(v.number()),
  })
    .index("by_recipient", ["recipientId"])
    .index("by_category", ["category"])
    .index("by_priority", ["priority"])
    .index("by_unread", ["recipientId", "isRead"])
    .index("by_type", ["type"])
    .index("by_created_at", ["createdAt"]),

  chatSessions: defineTable({
    userId: v.id("users"),
    userType: v.union(v.literal("doctor"), v.literal("patient")),
    patientId: v.optional(v.id("patients")),
    doctorId: v.optional(v.id("doctors")),
    title: v.string(),
    summary: v.optional(v.string()),
    messageCount: v.number(),
    lastMessageAt: v.number(),
    isActive: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user_id", ["userId"])
    .index("by_user_type", ["userType"])
    .index("by_patient_id", ["patientId"])
    .index("by_doctor_id", ["doctorId"])
    .index("by_is_active", ["isActive"])
    .index("by_last_message", ["lastMessageAt"])
    .index("by_user_active", ["userId", "isActive"]),

  chatMessages: defineTable({
    sessionId: v.id("chatSessions"),
    userId: v.id("users"),
    content: v.string(),
    sender: v.union(v.literal("user"), v.literal("assistant")),
    contextUsed: v.optional(v.boolean()),
    relevantDocuments: v.optional(v.array(v.object({
      id: v.string(),
      event_type: v.string(),
      content_preview: v.string(),
      similarity_score: v.number(),
      created_at: v.string(),
      metadata: v.any(),
    }))),
    relevantDocumentsCount: v.optional(v.number()),
    processingTime: v.optional(v.number()),
    createdAt: v.number(),
  })
    .index("by_session_id", ["sessionId"])
    .index("by_user_id", ["userId"])
    .index("by_sender", ["sender"])
    .index("by_session_created", ["sessionId", "createdAt"])
    .index("by_created_at", ["createdAt"]),
});

