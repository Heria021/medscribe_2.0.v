import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Create or update doctor profile
export const createOrUpdateDoctorProfile = mutation({
  args: {
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
    bio: v.optional(v.string()),
    languages: v.optional(v.array(v.string())),
    hospitalAffiliations: v.optional(v.array(v.string())),
    profileImageUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Check if doctor profile already exists
    const existingDoctor = await ctx.db
      .query("doctors")
      .withIndex("by_user_id", (q) => q.eq("userId", args.userId))
      .first();

    const now = Date.now();

    if (existingDoctor) {
      // Update existing profile
      await ctx.db.patch(existingDoctor._id, {
        firstName: args.firstName,
        lastName: args.lastName,
        specialization: args.specialization,
        licenseNumber: args.licenseNumber,
        qualification: args.qualification,
        experienceYears: args.experienceYears,
        department: args.department,
        phone: args.phone,
        email: args.email,
        consultationFee: args.consultationFee,
        bio: args.bio,
        languages: args.languages,
        hospitalAffiliations: args.hospitalAffiliations,
        profileImageUrl: args.profileImageUrl,
        updatedAt: now,
      });
      return existingDoctor._id;
    } else {
      // Create new profile
      const doctorId = await ctx.db.insert("doctors", {
        userId: args.userId,
        firstName: args.firstName,
        lastName: args.lastName,
        specialization: args.specialization,
        licenseNumber: args.licenseNumber,
        qualification: args.qualification,
        experienceYears: args.experienceYears,
        department: args.department,
        phone: args.phone,
        email: args.email,
        consultationFee: args.consultationFee,
        bio: args.bio,
        languages: args.languages,
        hospitalAffiliations: args.hospitalAffiliations,
        profileImageUrl: args.profileImageUrl,
        isActive: true,
        createdAt: now,
        updatedAt: now,
      });
      return doctorId;
    }
  },
});

// Get doctor profile by user ID
export const getDoctorProfile = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const doctor = await ctx.db
      .query("doctors")
      .withIndex("by_user_id", (q) => q.eq("userId", args.userId))
      .first();
    
    return doctor;
  },
});

// Get doctor profile by doctor ID
export const getDoctorById = query({
  args: { doctorId: v.id("doctors") },
  handler: async (ctx, args) => {
    const doctor = await ctx.db.get(args.doctorId);
    return doctor;
  },
});

// Get all doctors except current doctor (for referrals)
export const getAll = query({
  args: { excludeDoctorId: v.optional(v.id("doctors")) },
  handler: async (ctx, args) => {
    const doctors = await ctx.db
      .query("doctors")
      .withIndex("by_is_active", (q) => q.eq("isActive", true))
      .collect();

    // Filter out the current doctor if excludeDoctorId is provided
    if (args.excludeDoctorId) {
      return doctors.filter(doctor => doctor._id !== args.excludeDoctorId);
    }

    return doctors;
  },
});

// Get all active doctors
export const getAllActiveDoctors = query({
  args: {},
  handler: async (ctx) => {
    const doctors = await ctx.db
      .query("doctors")
      .withIndex("by_is_active", (q) => q.eq("isActive", true))
      .collect();

    return doctors;
  },
});

// Get doctors by specialization
export const getDoctorsBySpecialization = query({
  args: { specialization: v.string() },
  handler: async (ctx, args) => {
    const doctors = await ctx.db
      .query("doctors")
      .withIndex("by_specialization", (q) => q.eq("specialization", args.specialization))
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();
    
    return doctors;
  },
});

// Update doctor availability status
export const updateDoctorStatus = mutation({
  args: {
    doctorId: v.id("doctors"),
    isActive: v.boolean(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.doctorId, {
      isActive: args.isActive,
      updatedAt: Date.now(),
    });
  },
});

// Update doctor availability hours
export const updateDoctorAvailability = mutation({
  args: {
    doctorId: v.id("doctors"),
    availableHours: v.object({
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
    }),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.doctorId, {
      availableHours: args.availableHours,
      updatedAt: Date.now(),
    });
  },
});

// Check if doctor profile is complete
export const isDoctorProfileComplete = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const doctor = await ctx.db
      .query("doctors")
      .withIndex("by_user_id", (q) => q.eq("userId", args.userId))
      .first();
    
    if (!doctor) {
      return {
        isComplete: false,
        completedSteps: [],
        missingSteps: ["personal", "professional", "availability", "billing"],
      };
    }

    const completedSteps = [];
    const missingSteps = [];

    // Check personal information
    if (doctor.firstName && doctor.lastName && doctor.phone && doctor.email) {
      completedSteps.push("personal");
    } else {
      missingSteps.push("personal");
    }

    // Check professional information
    if (doctor.specialization && doctor.licenseNumber) {
      completedSteps.push("professional");
    } else {
      missingSteps.push("professional");
    }

    // Check availability (optional)
    if (doctor.availableHours) {
      completedSteps.push("availability");
    } else {
      missingSteps.push("availability");
    }

    // Check billing information (optional)
    if (doctor.consultationFee !== undefined && doctor.consultationFee > 0) {
      completedSteps.push("billing");
    } else {
      missingSteps.push("billing");
    }

    const requiredSteps = ["personal", "professional"];
    const completedRequiredSteps = completedSteps.filter(step => requiredSteps.includes(step));
    const isComplete = completedRequiredSteps.length === requiredSteps.length;

    return {
      isComplete,
      completedSteps,
      missingSteps,
      completionPercentage: (completedSteps.length / 4) * 100,
    };
  },
});
