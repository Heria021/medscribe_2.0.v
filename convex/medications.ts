import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const create = mutation({
  args: {
    treatmentPlanId: v.id("treatmentPlans"),
    medicationName: v.string(),
    dosage: v.string(),
    frequency: v.string(),
    instructions: v.string(),
    status: v.union(
      v.literal("active"),
      v.literal("completed"),
      v.literal("discontinued")
    ),
    startDate: v.string(),
    endDate: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    return await ctx.db.insert("medications", {
      ...args,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const getByTreatmentPlanId = query({
  args: { treatmentPlanId: v.id("treatmentPlans") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("medications")
      .withIndex("by_treatment_plan", (q) => q.eq("treatmentPlanId", args.treatmentPlanId))
      .order("desc")
      .collect();
  },
});

export const getActiveByTreatmentPlanId = query({
  args: { treatmentPlanId: v.id("treatmentPlans") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("medications")
      .withIndex("by_treatment_plan_status", (q) =>
        q.eq("treatmentPlanId", args.treatmentPlanId).eq("status", "active")
      )
      .order("desc")
      .collect();
  },
});

export const getByPatientId = query({
  args: { patientId: v.id("patients") },
  handler: async (ctx, args) => {
    const doctorPatients = await ctx.db
      .query("doctorPatients")
      .withIndex("by_patient_id", (q) => q.eq("patientId", args.patientId))
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();

    const allMedications = [];

    for (const doctorPatient of doctorPatients) {
      const treatmentPlans = await ctx.db
        .query("treatmentPlans")
        .withIndex("by_doctor_patient", (q) => q.eq("doctorPatientId", doctorPatient._id))
        .collect();

      for (const treatmentPlan of treatmentPlans) {
        const medications = await ctx.db
          .query("medications")
          .withIndex("by_treatment_plan", (q) => q.eq("treatmentPlanId", treatmentPlan._id))
          .collect();

        allMedications.push(...medications);
      }
    }

    return allMedications.sort((a, b) => b.createdAt - a.createdAt);
  },
});

export const getActiveByPatientId = query({
  args: { patientId: v.id("patients") },
  handler: async (ctx, args) => {
    const doctorPatients = await ctx.db
      .query("doctorPatients")
      .withIndex("by_patient_id", (q) => q.eq("patientId", args.patientId))
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();

    const allMedications = [];

    for (const doctorPatient of doctorPatients) {
      const treatmentPlans = await ctx.db
        .query("treatmentPlans")
        .withIndex("by_doctor_patient", (q) => q.eq("doctorPatientId", doctorPatient._id))
        .collect();

      for (const treatmentPlan of treatmentPlans) {
        const medications = await ctx.db
          .query("medications")
          .withIndex("by_treatment_plan", (q) => q.eq("treatmentPlanId", treatmentPlan._id))
          .filter((q) => q.eq(q.field("status"), "active"))
          .collect();

        allMedications.push(...medications);
      }
    }

    return allMedications.sort((a, b) => b.createdAt - a.createdAt);
  },
});

// Get a specific medication by ID
export const getById = query({
  args: { id: v.id("medications") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

// Update a medication
export const update = mutation({
  args: {
    id: v.id("medications"),
    medicationName: v.optional(v.string()),
    dosage: v.optional(v.string()),
    frequency: v.optional(v.string()),
    instructions: v.optional(v.string()),
    status: v.optional(v.union(
      v.literal("active"),
      v.literal("completed"),
      v.literal("discontinued")
    )),
    startDate: v.optional(v.string()),
    endDate: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    
    return await ctx.db.patch(id, {
      ...updates,
      updatedAt: Date.now(),
    });
  },
});

// Delete a medication
export const remove = mutation({
  args: { id: v.id("medications") },
  handler: async (ctx, args) => {
    return await ctx.db.delete(args.id);
  },
});

export const getWithDetailsByPatientId = query({
  args: { patientId: v.id("patients") },
  handler: async (ctx, args) => {
    const doctorPatients = await ctx.db
      .query("doctorPatients")
      .withIndex("by_patient_id", (q) => q.eq("patientId", args.patientId))
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();

    const allMedications = [];

    for (const doctorPatient of doctorPatients) {
      const treatmentPlans = await ctx.db
        .query("treatmentPlans")
        .withIndex("by_doctor_patient", (q) => q.eq("doctorPatientId", doctorPatient._id))
        .collect();

      const doctor = await ctx.db.get(doctorPatient.doctorId);
      const patient = await ctx.db.get(doctorPatient.patientId);

      for (const treatmentPlan of treatmentPlans) {
        const medications = await ctx.db
          .query("medications")
          .withIndex("by_treatment_plan", (q) => q.eq("treatmentPlanId", treatmentPlan._id))
          .collect();

        for (const medication of medications) {
          allMedications.push({
            ...medication,
            treatmentPlan,
            doctorPatient,
            doctor,
            patient,
          });
        }
      }
    }

    return allMedications.sort((a, b) => b.createdAt - a.createdAt);
  },
});

export const getWithDetailsByTreatmentPlanId = query({
  args: { treatmentPlanId: v.id("treatmentPlans") },
  handler: async (ctx, args) => {
    const medications = await ctx.db
      .query("medications")
      .withIndex("by_treatment_plan", (q) => q.eq("treatmentPlanId", args.treatmentPlanId))
      .order("desc")
      .collect();

    const treatmentPlan = await ctx.db.get(args.treatmentPlanId);
    if (!treatmentPlan) return [];

    const doctorPatient = await ctx.db.get(treatmentPlan.doctorPatientId);
    if (!doctorPatient) return [];

    const doctor = await ctx.db.get(doctorPatient.doctorId);
    const patient = await ctx.db.get(doctorPatient.patientId);

    return medications.map(medication => ({
      ...medication,
      treatmentPlan,
      doctorPatient,
      doctor,
      patient,
    }));
  },
});


