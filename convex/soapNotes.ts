import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Create a new SOAP note
export const create = mutation({
  args: {
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
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    
    return await ctx.db.insert("soapNotes", {
      ...args,
      createdAt: now,
      updatedAt: now,
    });
  },
});

// Get SOAP notes by patient ID
export const getByPatientId = query({
  args: { patientId: v.id("patients") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("soapNotes")
      .withIndex("by_patient_id", (q) => q.eq("patientId", args.patientId))
      .order("desc")
      .collect();
  },
});

// Get a specific SOAP note by ID
export const getById = query({
  args: { id: v.id("soapNotes") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

// Update a SOAP note
export const update = mutation({
  args: {
    id: v.id("soapNotes"),
    subjective: v.optional(v.string()),
    objective: v.optional(v.string()),
    assessment: v.optional(v.string()),
    plan: v.optional(v.string()),
    highlightedHtml: v.optional(v.string()),
    qualityScore: v.optional(v.number()),
    recommendations: v.optional(v.array(v.string())),
    googleDocUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    
    return await ctx.db.patch(id, {
      ...updates,
      updatedAt: Date.now(),
    });
  },
});

// Delete a SOAP note
export const remove = mutation({
  args: { id: v.id("soapNotes") },
  handler: async (ctx, args) => {
    return await ctx.db.delete(args.id);
  },
});

// Get recent SOAP notes for a patient (last 5)
export const getRecentByPatientId = query({
  args: { patientId: v.id("patients") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("soapNotes")
      .withIndex("by_patient_id", (q) => q.eq("patientId", args.patientId))
      .order("desc")
      .take(5);
  },
});

// Get SOAP notes statistics for a patient
export const getStatsByPatientId = query({
  args: { patientId: v.id("patients") },
  handler: async (ctx, args) => {
    const soapNotes = await ctx.db
      .query("soapNotes")
      .withIndex("by_patient_id", (q) => q.eq("patientId", args.patientId))
      .collect();

    const totalNotes = soapNotes.length;
    const averageQuality = totalNotes > 0 
      ? soapNotes
          .filter(note => note.qualityScore !== undefined)
          .reduce((sum, note) => sum + (note.qualityScore || 0), 0) / 
        soapNotes.filter(note => note.qualityScore !== undefined).length
      : 0;
    
    const excellentQualityCount = soapNotes.filter(note => 
      (note.qualityScore || 0) >= 90
    ).length;

    return {
      totalNotes,
      averageQuality: Math.round(averageQuality),
      excellentQualityCount,
    };
  },
});

// Search SOAP notes by content
export const searchByContent = query({
  args: { 
    patientId: v.id("patients"),
    searchTerm: v.string(),
  },
  handler: async (ctx, args) => {
    const allNotes = await ctx.db
      .query("soapNotes")
      .withIndex("by_patient_id", (q) => q.eq("patientId", args.patientId))
      .collect();

    const searchTermLower = args.searchTerm.toLowerCase();
    
    return allNotes.filter(note => 
      note.subjective.toLowerCase().includes(searchTermLower) ||
      note.objective.toLowerCase().includes(searchTermLower) ||
      note.assessment.toLowerCase().includes(searchTermLower) ||
      note.plan.toLowerCase().includes(searchTermLower)
    );
  },
});
