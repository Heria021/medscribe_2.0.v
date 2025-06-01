import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Create patient profile with default values
export const createPatientProfile = mutation({
  args: {
    userId: v.id("users"),
    firstName: v.string(),
    lastName: v.string(),
    dateOfBirth: v.string(),
    gender: v.union(v.literal("Male"), v.literal("Female"), v.literal("Other")),
    email: v.optional(v.string()),
    phone: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    
    // Check if patient profile already exists
    const existingProfile = await ctx.db
      .query("patients")
      .withIndex("by_user_id", (q) => q.eq("userId", args.userId))
      .first();

    if (existingProfile) {
      throw new Error("Patient profile already exists");
    }

    const patientId = await ctx.db.insert("patients", {
      userId: args.userId,
      firstName: args.firstName,
      lastName: args.lastName,
      dateOfBirth: args.dateOfBirth,
      gender: args.gender,
      phone: args.phone,
      email: args.email,
      // Default values
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
      accountType: "Patient",
      createdAt: now,
      updatedAt: now,
    });

    return patientId;
  },
});

// Get patient profile by user ID
export const getPatientByUserId = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("patients")
      .withIndex("by_user_id", (q) => q.eq("userId", args.userId))
      .first();
  },
});

// Get patient profile by patient ID
export const getPatientById = query({
  args: { patientId: v.id("patients") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.patientId);
  },
});

// Update patient profile
export const updatePatientProfile = mutation({
  args: {
    patientId: v.id("patients"),
    firstName: v.optional(v.string()),
    lastName: v.optional(v.string()),
    dateOfBirth: v.optional(v.string()),
    gender: v.optional(v.union(v.literal("Male"), v.literal("Female"), v.literal("Other"))),
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
    consentToContact: v.optional(v.boolean()),
    consentToDataShare: v.optional(v.boolean()),
    accountType: v.optional(v.union(v.literal("Patient"), v.literal("Guardian"))),
  },
  handler: async (ctx, args) => {
    const { patientId, ...updates } = args;
    
    // Remove undefined values
    const cleanUpdates = Object.fromEntries(
      Object.entries(updates).filter(([_, value]) => value !== undefined)
    );

    await ctx.db.patch(patientId, {
      ...cleanUpdates,
      updatedAt: Date.now(),
    });

    return await ctx.db.get(patientId);
  },
});

// Get patient's medical history
export const getPatientMedicalHistory = query({
  args: { patientId: v.id("patients") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("patientMedicalHistory")
      .withIndex("by_patient_id", (q) => q.eq("patientId", args.patientId))
      .order("desc")
      .collect();
  },
});

// Add medical history entry
export const addMedicalHistory = mutation({
  args: {
    patientId: v.id("patients"),
    condition: v.string(),
    diagnosisDate: v.optional(v.string()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("patientMedicalHistory", {
      ...args,
      createdAt: Date.now(),
    });
  },
});

// Get patient's allergies
export const getPatientAllergies = query({
  args: { patientId: v.id("patients") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("patientAllergies")
      .withIndex("by_patient_id", (q) => q.eq("patientId", args.patientId))
      .collect();
  },
});

// Add allergy
export const addAllergy = mutation({
  args: {
    patientId: v.id("patients"),
    allergen: v.string(),
    reaction: v.optional(v.string()),
    severity: v.optional(v.union(
      v.literal("Mild"), 
      v.literal("Moderate"), 
      v.literal("Severe")
    )),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("patientAllergies", {
      ...args,
      createdAt: Date.now(),
    });
  },
});

// Get patient's insurance
export const getPatientInsurance = query({
  args: { patientId: v.id("patients") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("patientInsurance")
      .withIndex("by_patient_id", (q) => q.eq("patientId", args.patientId))
      .collect();
  },
});

// Add insurance
export const addInsurance = mutation({
  args: {
    patientId: v.id("patients"),
    providerName: v.string(),
    policyNumber: v.string(),
    coverageDetails: v.optional(v.string()),
    validFrom: v.optional(v.string()),
    validUntil: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("patientInsurance", {
      ...args,
      createdAt: Date.now(),
    });
  },
});

// Delete medical history entry
export const deleteMedicalHistory = mutation({
  args: { historyId: v.id("patientMedicalHistory") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.historyId);
  },
});

// Delete allergy
export const deleteAllergy = mutation({
  args: { allergyId: v.id("patientAllergies") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.allergyId);
  },
});

// Delete insurance
export const deleteInsurance = mutation({
  args: { insuranceId: v.id("patientInsurance") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.insuranceId);
  },
});
