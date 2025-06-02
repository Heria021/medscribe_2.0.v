import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Create a new appointment
export const create = mutation({
  args: {
    patientId: v.id("patients"),
    doctorId: v.id("doctors"),
    appointmentDate: v.number(),
    appointmentTime: v.string(),
    appointmentType: v.string(),
    appointmentLocation: v.optional(v.string()),
    notes: v.optional(v.string()),
    duration: v.optional(v.number()),
    relatedSoapNoteId: v.optional(v.id("soapNotes")),
    relatedActionId: v.optional(v.id("doctorActions")),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    
    const appointmentId = await ctx.db.insert("appointments", {
      ...args,
      status: "scheduled",
      createdAt: now,
      updatedAt: now,
    });

    // Create notification for patient
    const patient = await ctx.db.get(args.patientId);
    const doctor = await ctx.db.get(args.doctorId);
    
    if (patient && doctor) {
      await ctx.db.insert("notifications", {
        recipientId: patient.userId,
        recipientType: "patient",
        type: "appointment_scheduled",
        title: "Appointment Scheduled",
        message: `Your appointment with Dr. ${doctor.firstName} ${doctor.lastName} has been scheduled for ${new Date(args.appointmentDate).toLocaleDateString()}.`,
        relatedActionId: args.relatedActionId,
        fromDoctorId: args.doctorId,
        isRead: false,
        createdAt: now,
      });
    }

    return appointmentId;
  },
});

// Get appointments for a patient
export const getPatientAppointments = query({
  args: { patientId: v.id("patients") },
  handler: async (ctx, args) => {
    const appointments = await ctx.db
      .query("appointments")
      .withIndex("by_patient_id", (q) => q.eq("patientId", args.patientId))
      .order("desc")
      .collect();

    // Get doctor details for each appointment
    const appointmentsWithDoctors = await Promise.all(
      appointments.map(async (appointment) => {
        const doctor = await ctx.db.get(appointment.doctorId);
        return {
          ...appointment,
          doctor,
        };
      })
    );

    return appointmentsWithDoctors;
  },
});

// Get appointments for a doctor
export const getDoctorAppointments = query({
  args: { doctorId: v.id("doctors") },
  handler: async (ctx, args) => {
    const appointments = await ctx.db
      .query("appointments")
      .withIndex("by_doctor_id", (q) => q.eq("doctorId", args.doctorId))
      .order("desc")
      .collect();

    // Get patient details for each appointment
    const appointmentsWithPatients = await Promise.all(
      appointments.map(async (appointment) => {
        const patient = await ctx.db.get(appointment.patientId);
        return {
          ...appointment,
          patient,
        };
      })
    );

    return appointmentsWithPatients;
  },
});

// Get today's appointments for a doctor
export const getDoctorTodayAppointments = query({
  args: { doctorId: v.id("doctors") },
  handler: async (ctx, args) => {
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
    const endOfDay = startOfDay + 24 * 60 * 60 * 1000 - 1;

    const appointments = await ctx.db
      .query("appointments")
      .withIndex("by_doctor_date", (q) => 
        q.eq("doctorId", args.doctorId)
         .gte("appointmentDate", startOfDay)
         .lte("appointmentDate", endOfDay)
      )
      .order("asc")
      .collect();

    // Get patient details for each appointment
    const appointmentsWithPatients = await Promise.all(
      appointments.map(async (appointment) => {
        const patient = await ctx.db.get(appointment.patientId);
        return {
          ...appointment,
          patient,
        };
      })
    );

    return appointmentsWithPatients;
  },
});

// Get upcoming appointments for a patient
export const getPatientUpcomingAppointments = query({
  args: { patientId: v.id("patients") },
  handler: async (ctx, args) => {
    const now = Date.now();

    const appointments = await ctx.db
      .query("appointments")
      .withIndex("by_patient_date", (q) => 
        q.eq("patientId", args.patientId)
         .gte("appointmentDate", now)
      )
      .filter((q) => 
        q.or(
          q.eq(q.field("status"), "scheduled"),
          q.eq(q.field("status"), "confirmed")
        )
      )
      .order("asc")
      .collect();

    // Get doctor details for each appointment
    const appointmentsWithDoctors = await Promise.all(
      appointments.map(async (appointment) => {
        const doctor = await ctx.db.get(appointment.doctorId);
        return {
          ...appointment,
          doctor,
        };
      })
    );

    return appointmentsWithDoctors;
  },
});

// Update appointment status
export const updateStatus = mutation({
  args: {
    appointmentId: v.id("appointments"),
    status: v.union(
      v.literal("scheduled"),
      v.literal("confirmed"),
      v.literal("in_progress"),
      v.literal("completed"),
      v.literal("cancelled"),
      v.literal("no_show")
    ),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const appointment = await ctx.db.get(args.appointmentId);
    if (!appointment) {
      throw new Error("Appointment not found");
    }

    await ctx.db.patch(args.appointmentId, {
      status: args.status,
      notes: args.notes,
      updatedAt: Date.now(),
    });

    return await ctx.db.get(args.appointmentId);
  },
});

// Cancel appointment
export const cancel = mutation({
  args: {
    appointmentId: v.id("appointments"),
    reason: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const appointment = await ctx.db.get(args.appointmentId);
    if (!appointment) {
      throw new Error("Appointment not found");
    }

    await ctx.db.patch(args.appointmentId, {
      status: "cancelled",
      notes: args.reason,
      updatedAt: Date.now(),
    });

    // Notify both patient and doctor
    const patient = await ctx.db.get(appointment.patientId);
    const doctor = await ctx.db.get(appointment.doctorId);
    const now = Date.now();

    if (patient && doctor) {
      // Notify patient
      await ctx.db.insert("notifications", {
        recipientId: patient.userId,
        recipientType: "patient",
        type: "action_updated",
        title: "Appointment Cancelled",
        message: `Your appointment with Dr. ${doctor.firstName} ${doctor.lastName} has been cancelled.`,
        isRead: false,
        createdAt: now,
      });

      // Notify doctor
      await ctx.db.insert("notifications", {
        recipientId: doctor.userId,
        recipientType: "doctor",
        type: "action_updated",
        title: "Appointment Cancelled",
        message: `Appointment with ${patient.firstName} ${patient.lastName} has been cancelled.`,
        isRead: false,
        createdAt: now,
      });
    }

    return await ctx.db.get(args.appointmentId);
  },
});

// Get appointment by ID
export const getById = query({
  args: { appointmentId: v.id("appointments") },
  handler: async (ctx, args) => {
    const appointment = await ctx.db.get(args.appointmentId);
    if (!appointment) {
      return null;
    }

    const patient = await ctx.db.get(appointment.patientId);
    const doctor = await ctx.db.get(appointment.doctorId);

    return {
      ...appointment,
      patient,
      doctor,
    };
  },
});
