import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Create a new doctor action
export const create = mutation({
  args: {
    soapNoteId: v.id("soapNotes"),
    patientId: v.id("patients"),
    doctorId: v.id("doctors"),
    actionType: v.union(
      v.literal("immediate_assistance"),
      v.literal("schedule_appointment"),
      v.literal("refer_to_specialist")
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
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    
    const actionId = await ctx.db.insert("doctorActions", {
      ...args,
      status: "pending",
      createdAt: now,
      updatedAt: now,
    });

    // Create notification for patient
    const patient = await ctx.db.get(args.patientId);
    const doctor = await ctx.db.get(args.doctorId);
    
    if (patient && doctor) {
      let notificationTitle = "";
      let notificationMessage = "";
      let notificationType: "assistance_provided" | "appointment_scheduled" | "referral_sent" = "assistance_provided";

      switch (args.actionType) {
        case "immediate_assistance":
          notificationTitle = "Immediate Assistance Provided";
          notificationMessage = `Dr. ${doctor.firstName} ${doctor.lastName} has provided immediate assistance for your SOAP note.`;
          notificationType = "assistance_provided";
          break;
        case "schedule_appointment":
          notificationTitle = "Appointment Scheduled";
          notificationMessage = `Dr. ${doctor.firstName} ${doctor.lastName} has scheduled an appointment with you.`;
          notificationType = "appointment_scheduled";
          break;
        case "refer_to_specialist":
          notificationTitle = "Referral to Specialist";
          notificationMessage = `Dr. ${doctor.firstName} ${doctor.lastName} has referred you to a specialist.`;
          notificationType = "referral_sent";
          break;
      }

      await ctx.db.insert("notifications", {
        recipientId: patient.userId,
        recipientType: "patient",
        type: notificationType,
        title: notificationTitle,
        message: notificationMessage,
        relatedSoapNoteId: args.soapNoteId,
        relatedActionId: actionId,
        fromDoctorId: args.doctorId,
        isRead: false,
        createdAt: now,
      });

      // If it's a referral, also notify the specialist
      if (args.actionType === "refer_to_specialist" && args.specialistId) {
        const specialist = await ctx.db.get(args.specialistId);
        if (specialist) {
          await ctx.db.insert("notifications", {
            recipientId: specialist.userId,
            recipientType: "doctor",
            type: "referral_received",
            title: "New Patient Referral",
            message: `Dr. ${doctor.firstName} ${doctor.lastName} has referred a patient (${patient.firstName} ${patient.lastName}) to you.`,
            relatedSoapNoteId: args.soapNoteId,
            relatedActionId: actionId,
            fromDoctorId: args.doctorId,
            isRead: false,
            createdAt: now,
          });
        }
      }

      // Assign patient to doctor if scheduling an appointment
      if (args.actionType === "schedule_appointment") {
        // Check if patient is already assigned to this doctor
        const existingRelationship = await ctx.db
          .query("doctorPatients")
          .withIndex("by_doctor_patient", (q) =>
            q.eq("doctorId", args.doctorId).eq("patientId", args.patientId)
          )
          .filter((q) => q.eq(q.field("isActive"), true))
          .first();

        if (!existingRelationship) {
          // Assign patient to doctor
          await ctx.db.insert("doctorPatients", {
            doctorId: args.doctorId,
            patientId: args.patientId,
            assignedBy: "appointment_scheduling",
            relatedActionId: actionId,
            assignedAt: now,
            isActive: true,
            notes: `Patient assigned via appointment scheduling. ${args.notes || ''}`,
          });
        }
      }
    }

    return actionId;
  },
});

// Update doctor action status
export const updateStatus = mutation({
  args: {
    actionId: v.id("doctorActions"),
    status: v.union(
      v.literal("pending"),
      v.literal("in_progress"),
      v.literal("completed"),
      v.literal("cancelled")
    ),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const action = await ctx.db.get(args.actionId);
    if (!action) {
      throw new Error("Action not found");
    }

    await ctx.db.patch(args.actionId, {
      status: args.status,
      notes: args.notes,
      updatedAt: Date.now(),
    });

    // Create notification for status update
    const patient = await ctx.db.get(action.patientId);
    const doctor = await ctx.db.get(action.doctorId);
    
    if (patient && doctor && args.status === "completed") {
      await ctx.db.insert("notifications", {
        recipientId: patient.userId,
        recipientType: "patient",
        type: "action_completed",
        title: "Action Completed",
        message: `Dr. ${doctor.firstName} ${doctor.lastName} has completed the ${action.actionType.replace('_', ' ')}.`,
        relatedSoapNoteId: action.soapNoteId,
        relatedActionId: args.actionId,
        fromDoctorId: action.doctorId,
        isRead: false,
        createdAt: Date.now(),
      });
    }

    return args.actionId;
  },
});

// Get actions by doctor
export const getByDoctor = query({
  args: { doctorId: v.id("doctors") },
  handler: async (ctx, args) => {
    const actions = await ctx.db
      .query("doctorActions")
      .withIndex("by_doctor_id", (q) => q.eq("doctorId", args.doctorId))
      .order("desc")
      .collect();

    // Get related data
    const actionsWithDetails = await Promise.all(
      actions.map(async (action) => {
        const patient = await ctx.db.get(action.patientId);
        const soapNote = await ctx.db.get(action.soapNoteId);
        const specialist = action.specialistId ? await ctx.db.get(action.specialistId) : null;

        return {
          ...action,
          patient,
          soapNote,
          specialist,
        };
      })
    );

    return actionsWithDetails;
  },
});

// Get actions by patient
export const getByPatient = query({
  args: { patientId: v.id("patients") },
  handler: async (ctx, args) => {
    const actions = await ctx.db
      .query("doctorActions")
      .withIndex("by_patient_id", (q) => q.eq("patientId", args.patientId))
      .order("desc")
      .collect();

    // Get related data
    const actionsWithDetails = await Promise.all(
      actions.map(async (action) => {
        const doctor = await ctx.db.get(action.doctorId);
        const soapNote = await ctx.db.get(action.soapNoteId);
        const specialist = action.specialistId ? await ctx.db.get(action.specialistId) : null;

        return {
          ...action,
          doctor,
          soapNote,
          specialist,
        };
      })
    );

    return actionsWithDetails;
  },
});

// Get actions by SOAP note
export const getBySoapNote = query({
  args: { soapNoteId: v.id("soapNotes") },
  handler: async (ctx, args) => {
    const actions = await ctx.db
      .query("doctorActions")
      .withIndex("by_soap_note_id", (q) => q.eq("soapNoteId", args.soapNoteId))
      .order("desc")
      .collect();

    // Get related data
    const actionsWithDetails = await Promise.all(
      actions.map(async (action) => {
        const doctor = await ctx.db.get(action.doctorId);
        const patient = await ctx.db.get(action.patientId);
        const specialist = action.specialistId ? await ctx.db.get(action.specialistId) : null;

        return {
          ...action,
          doctor,
          patient,
          specialist,
        };
      })
    );

    return actionsWithDetails;
  },
});

// Get referrals received by specialist
export const getReferralsBySpecialist = query({
  args: { specialistId: v.id("doctors") },
  handler: async (ctx, args) => {
    const referrals = await ctx.db
      .query("doctorActions")
      .withIndex("by_specialist_id", (q) => q.eq("specialistId", args.specialistId))
      .filter((q) => q.eq(q.field("actionType"), "refer_to_specialist"))
      .order("desc")
      .collect();

    // Get related data
    const referralsWithDetails = await Promise.all(
      referrals.map(async (referral) => {
        const doctor = await ctx.db.get(referral.doctorId);
        const patient = await ctx.db.get(referral.patientId);
        const soapNote = await ctx.db.get(referral.soapNoteId);

        return {
          ...referral,
          referringDoctor: doctor,
          patient,
          soapNote,
        };
      })
    );

    return referralsWithDetails;
  },
});

// Get referrals sent by a doctor
export const getReferralsBySender = query({
  args: { doctorId: v.id("doctors") },
  handler: async (ctx, args) => {
    const referrals = await ctx.db
      .query("doctorActions")
      .withIndex("by_doctor_id", (q) => q.eq("doctorId", args.doctorId))
      .filter((q) => q.eq(q.field("actionType"), "refer_to_specialist"))
      .order("desc")
      .collect();

    // Get related data for each referral
    const referralsWithData = await Promise.all(
      referrals.map(async (referral) => {
        const [patient, specialist, soapNote] = await Promise.all([
          ctx.db.get(referral.patientId),
          referral.specialistId ? ctx.db.get(referral.specialistId) : null,
          ctx.db.get(referral.soapNoteId),
        ]);

        return {
          ...referral,
          patient,
          specialist,
          soapNote,
        };
      })
    );

    return referralsWithData;
  },
});

// Accept a referral and share SOAP note
export const acceptReferral = mutation({
  args: {
    referralId: v.id("doctorActions"),
    specialistResponse: v.optional(v.string())
  },
  handler: async (ctx, args) => {
    const referral = await ctx.db.get(args.referralId);
    if (!referral) {
      throw new Error("Referral not found");
    }

    if (referral.actionType !== "refer_to_specialist") {
      throw new Error("Invalid action type");
    }

    const now = Date.now();

    // Update referral status to accepted
    await ctx.db.patch(args.referralId, {
      status: "accepted",
      specialistResponse: args.specialistResponse,
      acceptedAt: now,
      updatedAt: now,
    });

    // Share SOAP note with the specialist
    const sharedSoapId = await ctx.db.insert("sharedSoapNotes", {
      soapNoteId: referral.soapNoteId,
      patientId: referral.patientId,
      doctorId: referral.specialistId!,
      sharedBy: referral.doctorId, // Referring doctor shared it
      sharedByType: "doctor",
      shareType: "referral_share",
      relatedReferralId: args.referralId,
      message: `SOAP note shared via referral acceptance. ${args.specialistResponse || ''}`,
      isRead: false,
      createdAt: now,
      updatedAt: now,
    });

    // Update referral with SOAP sharing timestamp
    await ctx.db.patch(args.referralId, {
      soapSharedAt: now,
    });

    // Assign patient to the specialist doctor
    await ctx.db.insert("doctorPatients", {
      doctorId: referral.specialistId!,
      patientId: referral.patientId,
      assignedBy: "referral_acceptance",
      relatedActionId: args.referralId,
      assignedAt: now,
      isActive: true,
      notes: `Patient assigned via referral acceptance. ${args.specialistResponse || ''}`,
    });

    // Create notifications
    // 1. Notify the referring doctor
    await ctx.db.insert("notifications", {
      recipientId: (await ctx.db.get(referral.doctorId))!.userId,
      recipientType: "doctor",
      type: "referral_sent",
      title: "Referral Accepted",
      message: `Your referral has been accepted by the specialist. SOAP note has been shared.`,
      relatedSoapNoteId: referral.soapNoteId,
      relatedActionId: args.referralId,
      fromDoctorId: referral.specialistId,
      isRead: false,
      createdAt: now,
    });

    // 2. Notify the patient
    await ctx.db.insert("notifications", {
      recipientId: (await ctx.db.get(referral.patientId))!.userId,
      recipientType: "patient",
      type: "referral_received",
      title: "Specialist Accepted Your Referral",
      message: `The specialist has accepted your referral and can now review your medical records.`,
      relatedSoapNoteId: referral.soapNoteId,
      relatedActionId: args.referralId,
      fromDoctorId: referral.specialistId,
      isRead: false,
      createdAt: now,
    });

    return { success: true, sharedSoapId };
  },
});

// Decline a referral
export const declineReferral = mutation({
  args: {
    referralId: v.id("doctorActions"),
    specialistResponse: v.string()
  },
  handler: async (ctx, args) => {
    const referral = await ctx.db.get(args.referralId);
    if (!referral) {
      throw new Error("Referral not found");
    }

    if (referral.actionType !== "refer_to_specialist") {
      throw new Error("Invalid action type");
    }

    const now = Date.now();

    // Update referral status to declined
    await ctx.db.patch(args.referralId, {
      status: "declined",
      specialistResponse: args.specialistResponse,
      declinedAt: now,
      updatedAt: now,
    });

    // Create notifications
    // 1. Notify the referring doctor
    await ctx.db.insert("notifications", {
      recipientId: (await ctx.db.get(referral.doctorId))!.userId,
      recipientType: "doctor",
      type: "referral_sent",
      title: "Referral Declined",
      message: `Your referral has been declined by the specialist: ${args.specialistResponse}`,
      relatedSoapNoteId: referral.soapNoteId,
      relatedActionId: args.referralId,
      fromDoctorId: referral.specialistId,
      isRead: false,
      createdAt: now,
    });

    // 2. Notify the patient
    await ctx.db.insert("notifications", {
      recipientId: (await ctx.db.get(referral.patientId))!.userId,
      recipientType: "patient",
      type: "referral_received",
      title: "Referral Update",
      message: `The specialist has declined your referral. Please consult with your referring doctor for alternative options.`,
      relatedSoapNoteId: referral.soapNoteId,
      relatedActionId: args.referralId,
      fromDoctorId: referral.specialistId,
      isRead: false,
      createdAt: now,
    });

    return { success: true };
  },
});
