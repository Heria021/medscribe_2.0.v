import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Share a SOAP note with a doctor
export const shareSOAPNote = mutation({
  args: {
    soapNoteId: v.id("soapNotes"),
    doctorId: v.id("doctors"),
    message: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Get the SOAP note to verify it exists and get patient info
    const soapNote = await ctx.db.get(args.soapNoteId);
    if (!soapNote) {
      throw new Error("SOAP note not found");
    }

    // Check if already shared with this doctor
    const existingShare = await ctx.db
      .query("sharedSoapNotes")
      .withIndex("by_soap_note_id", (q) => q.eq("soapNoteId", args.soapNoteId))
      .filter((q) => q.eq(q.field("doctorId"), args.doctorId))
      .first();

    if (existingShare) {
      throw new Error("SOAP note already shared with this doctor");
    }

    const now = Date.now();
    
    return await ctx.db.insert("sharedSoapNotes", {
      soapNoteId: args.soapNoteId,
      patientId: soapNote.patientId,
      doctorId: args.doctorId,
      sharedBy: soapNote.patientId,
      sharedByType: "patient",
      shareType: "direct_share",
      message: args.message,
      isRead: false,
      createdAt: now,
      updatedAt: now,
    });
  },
});

// Get shared SOAP notes for a doctor
export const getSharedSOAPNotesForDoctor = query({
  args: { doctorId: v.id("doctors") },
  handler: async (ctx, args) => {
    const sharedNotes = await ctx.db
      .query("sharedSoapNotes")
      .withIndex("by_doctor_id", (q) => q.eq("doctorId", args.doctorId))
      .order("desc")
      .collect();

    // Get the actual SOAP notes and related info
    const enrichedNotes = await Promise.all(
      sharedNotes.map(async (shared) => {
        const soapNote = await ctx.db.get(shared.soapNoteId);
        const patient = await ctx.db.get(shared.patientId);

        // Get sharer info based on type
        let sharedByInfo = null;
        if (shared.sharedByType === "patient") {
          sharedByInfo = await ctx.db.get(shared.sharedBy);
        } else if (shared.sharedByType === "doctor") {
          sharedByInfo = await ctx.db.get(shared.sharedBy);
        }

        // Get referral info if shared via referral
        let referralInfo = null;
        if (shared.relatedReferralId) {
          referralInfo = await ctx.db.get(shared.relatedReferralId);
        }

        return {
          ...shared,
          soapNote,
          patient,
          sharedByInfo,
          referralInfo,
        };
      })
    );

    return enrichedNotes.filter(note => note.soapNote && note.patient);
  },
});

// Get shared SOAP notes by a patient
export const getSharedSOAPNotesByPatient = query({
  args: { patientId: v.id("patients") },
  handler: async (ctx, args) => {
    const sharedNotes = await ctx.db
      .query("sharedSoapNotes")
      .withIndex("by_patient_id", (q) => q.eq("patientId", args.patientId))
      .order("desc")
      .collect();

    // Get the actual SOAP notes and doctor info
    const enrichedNotes = await Promise.all(
      sharedNotes.map(async (shared) => {
        const soapNote = await ctx.db.get(shared.soapNoteId);
        const doctor = await ctx.db.get(shared.doctorId);
        
        return {
          ...shared,
          soapNote,
          doctor,
        };
      })
    );

    return enrichedNotes.filter(note => note.soapNote && note.doctor);
  },
});

// Mark shared SOAP note as read
export const markAsRead = mutation({
  args: { sharedSoapNoteId: v.id("sharedSoapNotes") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.sharedSoapNoteId, {
      isRead: true,
      updatedAt: Date.now(),
    });
  },
});

// Get unread count for a doctor
export const getUnreadCountForDoctor = query({
  args: { doctorId: v.id("doctors") },
  handler: async (ctx, args) => {
    const unreadNotes = await ctx.db
      .query("sharedSoapNotes")
      .withIndex("by_doctor_id", (q) => q.eq("doctorId", args.doctorId))
      .filter((q) => q.eq(q.field("isRead"), false))
      .collect();

    return unreadNotes.length;
  },
});

// Remove shared SOAP note
export const removeSharedSOAPNote = mutation({
  args: { sharedSoapNoteId: v.id("sharedSoapNotes") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.sharedSoapNoteId);
  },
});
