import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const create = mutation({
  args: {
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
    notes: v.optional(v.string()),
    insuranceVerified: v.optional(v.boolean()),
    copayAmount: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    const doctorPatient = await ctx.db.get(args.doctorPatientId);
    if (!doctorPatient) {
      throw new Error("Doctor-patient relationship not found");
    }

    const doctor = await ctx.db.get(doctorPatient.doctorId);
    if (!doctor) {
      throw new Error("Doctor not found");
    }

    const appointmentId = await ctx.db.insert("appointments", {
      ...args,
      status: "scheduled",
      scheduledAt: now,
      createdAt: now,
      updatedAt: now,
      createdBy: doctor.userId,
    });

    const patient = await ctx.db.get(doctorPatient.patientId);

    if (doctor && patient) {
      await ctx.db.insert("notifications", {
        recipientId: patient.userId,
        recipientType: "patient",
        category: "administrative",
        type: "appointment_scheduled",
        priority: "medium",
        title: "Appointment Scheduled",
        message: `Your appointment with Dr. ${doctor.firstName} ${doctor.lastName} has been scheduled for ${new Date(args.appointmentDateTime).toLocaleDateString()}.`,
        actionUrl: `/patient/appointments`,
        relatedRecords: {
          appointmentId,
          patientId: doctorPatient.patientId,
          doctorId: doctorPatient.doctorId,
        },
        channels: ["in_app", "email"],
        isRead: false,
        createdAt: now,
      });

      await ctx.db.insert("notifications", {
        recipientId: doctor.userId,
        recipientType: "doctor",
        category: "administrative",
        type: "appointment_scheduled",
        priority: "medium",
        title: "New Appointment Scheduled",
        message: `Appointment scheduled with ${patient.firstName} ${patient.lastName} for ${new Date(args.appointmentDateTime).toLocaleDateString()}.`,
        actionUrl: `/doctor/appointments`,
        relatedRecords: {
          appointmentId,
          patientId: doctorPatient.patientId,
          doctorId: doctorPatient.doctorId,
        },
        channels: ["in_app"],
        isRead: false,
        createdAt: now,
      });
    }

    return appointmentId;
  },
});

// Update appointment status
export const updateStatus = mutation({
  args: {
    appointmentId: v.id("appointments"),
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
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const appointment = await ctx.db.get(args.appointmentId);
    if (!appointment) {
      throw new Error("Appointment not found");
    }

    const now = Date.now();
    const updateData: any = {
      status: args.status,
      updatedAt: now,
    };

    // Add timestamp based on status
    switch (args.status) {
      case "confirmed":
        updateData.confirmedAt = now;
        break;
      case "checked_in":
        updateData.checkedInAt = now;
        break;
      case "in_progress":
        updateData.startedAt = now;
        break;
      case "completed":
        updateData.completedAt = now;
        break;
    }

    if (args.notes) {
      updateData.notes = args.notes;
    }

    await ctx.db.patch(args.appointmentId, updateData);

    const doctorPatient = await ctx.db.get(appointment.doctorPatientId);
    if (!doctorPatient) return args.appointmentId;

    const doctor = await ctx.db.get(doctorPatient.doctorId);
    const patient = await ctx.db.get(doctorPatient.patientId);

    if (doctor && patient && ["confirmed", "completed", "cancelled"].includes(args.status)) {
      const statusMap = {
        confirmed: { type: "appointment_confirmed", priority: "medium" as const },
        completed: { type: "appointment_completed", priority: "low" as const },
        cancelled: { type: "appointment_cancelled", priority: "high" as const }
      };

      const statusInfo = statusMap[args.status as keyof typeof statusMap];

      await ctx.db.insert("notifications", {
        recipientId: patient.userId,
        recipientType: "patient",
        category: "administrative",
        type: statusInfo.type,
        priority: statusInfo.priority,
        title: "Appointment Updated",
        message: `Your appointment with Dr. ${doctor.firstName} ${doctor.lastName} has been ${args.status}.`,
        actionUrl: `/patient/appointments`,
        relatedRecords: {
          appointmentId: args.appointmentId,
          patientId: doctorPatient.patientId,
          doctorId: doctorPatient.doctorId,
        },
        channels: args.status === "cancelled" ? ["in_app", "email", "sms"] : ["in_app", "email"],
        isRead: false,
        createdAt: now,
      });
    }

    return args.appointmentId;
  },
});

export const getByPatient = query({
  args: { patientId: v.id("patients") },
  handler: async (ctx, args) => {
    const doctorPatients = await ctx.db
      .query("doctorPatients")
      .withIndex("by_patient_id", (q) => q.eq("patientId", args.patientId))
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();

    const allAppointments = [];

    for (const doctorPatient of doctorPatients) {
      const appointments = await ctx.db
        .query("appointments")
        .withIndex("by_doctor_patient", (q) => q.eq("doctorPatientId", doctorPatient._id))
        .order("desc")
        .collect();

      const doctor = await ctx.db.get(doctorPatient.doctorId);
      const patient = await ctx.db.get(doctorPatient.patientId);

      for (const appointment of appointments) {
        allAppointments.push({
          ...appointment,
          doctorPatient,
          doctor,
          patient,
        });
      }
    }

    return allAppointments.sort((a, b) => b.appointmentDateTime - a.appointmentDateTime);
  },
});

export const getByDoctor = query({
  args: { doctorId: v.id("doctors") },
  handler: async (ctx, args) => {
    const doctorPatients = await ctx.db
      .query("doctorPatients")
      .withIndex("by_doctor_id", (q) => q.eq("doctorId", args.doctorId))
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();

    const allAppointments = [];

    for (const doctorPatient of doctorPatients) {
      const appointments = await ctx.db
        .query("appointments")
        .withIndex("by_doctor_patient", (q) => q.eq("doctorPatientId", doctorPatient._id))
        .order("desc")
        .collect();

      const doctor = await ctx.db.get(doctorPatient.doctorId);
      const patient = await ctx.db.get(doctorPatient.patientId);

      for (const appointment of appointments) {
        allAppointments.push({
          ...appointment,
          doctorPatient,
          doctor,
          patient,
        });
      }
    }

    return allAppointments.sort((a, b) => b.appointmentDateTime - a.appointmentDateTime);
  },
});

// Get upcoming appointments for a doctor
export const getUpcomingByDoctor = query({
  args: {
    doctorId: v.id("doctors"),
    limit: v.optional(v.number())
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const limit = args.limit || 10;

    // First get all doctorPatient relationships for this doctor
    const doctorPatients = await ctx.db
      .query("doctorPatients")
      .withIndex("by_doctor_id", (q) => q.eq("doctorId", args.doctorId))
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();

    const allAppointments = [];

    // Get appointments for each doctorPatient relationship
    for (const doctorPatient of doctorPatients) {
      const appointments = await ctx.db
        .query("appointments")
        .withIndex("by_doctor_patient_date", (q) =>
          q.eq("doctorPatientId", doctorPatient._id).gte("appointmentDateTime", now)
        )
        .filter((q) =>
          q.and(
            q.neq(q.field("status"), "cancelled"),
            q.neq(q.field("status"), "completed")
          )
        )
        .order("asc")
        .collect();

      const patient = await ctx.db.get(doctorPatient.patientId);

      for (const appointment of appointments) {
        allAppointments.push({
          ...appointment,
          doctorPatient,
          patient,
        });
      }
    }

    // Sort by appointment date and take the limit
    return allAppointments
      .sort((a, b) => a.appointmentDateTime - b.appointmentDateTime)
      .slice(0, limit);
  },
});

// Get upcoming appointments for a patient
export const getUpcomingByPatient = query({
  args: {
    patientId: v.id("patients"),
    limit: v.optional(v.number())
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const limit = args.limit || 10;

    // First get all doctorPatient relationships for this patient
    const doctorPatients = await ctx.db
      .query("doctorPatients")
      .withIndex("by_patient_id", (q) => q.eq("patientId", args.patientId))
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();

    const allAppointments = [];

    // Get appointments for each doctorPatient relationship
    for (const doctorPatient of doctorPatients) {
      const appointments = await ctx.db
        .query("appointments")
        .withIndex("by_doctor_patient_date", (q) =>
          q.eq("doctorPatientId", doctorPatient._id).gte("appointmentDateTime", now)
        )
        .filter((q) =>
          q.and(
            q.neq(q.field("status"), "cancelled"),
            q.neq(q.field("status"), "completed")
          )
        )
        .order("asc")
        .collect();

      const doctor = await ctx.db.get(doctorPatient.doctorId);

      for (const appointment of appointments) {
        allAppointments.push({
          ...appointment,
          doctorPatient,
          doctor,
        });
      }
    }

    // Sort by appointment date and take the limit
    return allAppointments
      .sort((a, b) => a.appointmentDateTime - b.appointmentDateTime)
      .slice(0, limit);
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

    const doctorPatient = await ctx.db.get(appointment.doctorPatientId);
    if (!doctorPatient) {
      return null;
    }

    const patient = await ctx.db.get(doctorPatient.patientId);
    const doctor = await ctx.db.get(doctorPatient.doctorId);

    return {
      ...appointment,
      doctorPatient,
      patient,
      doctor,
    };
  },
});

// Reschedule appointment
export const reschedule = mutation({
  args: {
    appointmentId: v.id("appointments"),
    newDateTime: v.number(),
    reason: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const appointment = await ctx.db.get(args.appointmentId);
    if (!appointment) {
      throw new Error("Appointment not found");
    }

    const now = Date.now();

    await ctx.db.patch(args.appointmentId, {
      appointmentDateTime: args.newDateTime,
      status: "rescheduled",
      notes: args.reason ? `Rescheduled: ${args.reason}` : appointment.notes,
      updatedAt: now,
    });

    // Create notification
    const doctorPatient = await ctx.db.get(appointment.doctorPatientId);
    if (!doctorPatient) {
      throw new Error("Doctor-patient relationship not found");
    }

    const doctor = await ctx.db.get(doctorPatient.doctorId);
    const patient = await ctx.db.get(doctorPatient.patientId);

    if (doctor && patient) {
      await ctx.db.insert("notifications", {
        recipientId: patient.userId,
        recipientType: "patient",
        category: "administrative",
        type: "appointment_rescheduled",
        priority: "medium",
        title: "Appointment Rescheduled",
        message: `Your appointment with Dr. ${doctor.firstName} ${doctor.lastName} has been rescheduled to ${new Date(args.newDateTime).toLocaleDateString()}.`,
        actionUrl: `/patient/appointments`,
        relatedRecords: {
          appointmentId: args.appointmentId,
          patientId: doctorPatient.patientId,
          doctorId: doctorPatient.doctorId,
        },
        channels: ["in_app", "email"],
        isRead: false,
        createdAt: now,
      });
    }

    return args.appointmentId;
  },
});

// Get today's appointments for a doctor
export const getTodayByDoctor = query({
  args: {
    doctorId: v.id("doctors"),
    limit: v.optional(v.number())
  },
  handler: async (ctx, args) => {
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1).getTime() - 1;
    const limit = args.limit || 20;

    // First get all doctorPatient relationships for this doctor
    const doctorPatients = await ctx.db
      .query("doctorPatients")
      .withIndex("by_doctor_id", (q) => q.eq("doctorId", args.doctorId))
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();

    const allAppointments = [];

    // Get appointments for each doctorPatient relationship
    for (const doctorPatient of doctorPatients) {
      const appointments = await ctx.db
        .query("appointments")
        .withIndex("by_doctor_patient_date", (q) =>
          q.eq("doctorPatientId", doctorPatient._id)
           .gte("appointmentDateTime", startOfDay)
           .lt("appointmentDateTime", endOfDay)
        )
        .filter((q) =>
          q.and(
            q.neq(q.field("status"), "cancelled"),
            q.neq(q.field("status"), "no_show")
          )
        )
        .order("asc")
        .collect();

      const patient = await ctx.db.get(doctorPatient.patientId);

      for (const appointment of appointments) {
        allAppointments.push({
          ...appointment,
          doctorPatient,
          patient,
        });
      }
    }

    // Sort by appointment date and take the limit
    return allAppointments
      .sort((a, b) => a.appointmentDateTime - b.appointmentDateTime)
      .slice(0, limit);
  },
});

// Get this week's appointments for a doctor
export const getWeekByDoctor = query({
  args: {
    doctorId: v.id("doctors"),
    limit: v.optional(v.number())
  },
  handler: async (ctx, args) => {
    const now = new Date();
    const startOfWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay()).getTime();
    const endOfWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay() + 7).getTime() - 1;
    const limit = args.limit || 50;

    // First get all doctorPatient relationships for this doctor
    const doctorPatients = await ctx.db
      .query("doctorPatients")
      .withIndex("by_doctor_id", (q) => q.eq("doctorId", args.doctorId))
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();

    const allAppointments = [];

    // Get appointments for each doctorPatient relationship
    for (const doctorPatient of doctorPatients) {
      const appointments = await ctx.db
        .query("appointments")
        .withIndex("by_doctor_patient_date", (q) =>
          q.eq("doctorPatientId", doctorPatient._id)
           .gte("appointmentDateTime", startOfWeek)
           .lt("appointmentDateTime", endOfWeek)
        )
        .filter((q) =>
          q.and(
            q.neq(q.field("status"), "cancelled"),
            q.neq(q.field("status"), "no_show")
          )
        )
        .order("asc")
        .collect();

      const patient = await ctx.db.get(doctorPatient.patientId);

      for (const appointment of appointments) {
        allAppointments.push({
          ...appointment,
          doctorPatient,
          patient,
        });
      }
    }

    // Sort by appointment date and take the limit
    return allAppointments
      .sort((a, b) => a.appointmentDateTime - b.appointmentDateTime)
      .slice(0, limit);
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

    const now = Date.now();

    await ctx.db.patch(args.appointmentId, {
      status: "cancelled",
      notes: args.reason,
      updatedAt: now,
    });

    // Notify both patient and doctor
    const doctorPatient = await ctx.db.get(appointment.doctorPatientId);
    if (!doctorPatient) {
      throw new Error("Doctor-patient relationship not found");
    }

    const patient = await ctx.db.get(doctorPatient.patientId);
    const doctor = await ctx.db.get(doctorPatient.doctorId);

    if (patient && doctor) {
      // Notify patient
      await ctx.db.insert("notifications", {
        recipientId: patient.userId,
        recipientType: "patient",
        category: "administrative",
        type: "appointment_cancelled",
        priority: "high",
        title: "Appointment Cancelled",
        message: `Your appointment with Dr. ${doctor.firstName} ${doctor.lastName} has been cancelled.`,
        actionUrl: `/patient/appointments`,
        relatedRecords: {
          appointmentId: args.appointmentId,
          patientId: doctorPatient.patientId,
          doctorId: doctorPatient.doctorId,
        },
        channels: ["in_app", "email", "sms"],
        isRead: false,
        createdAt: now,
      });

      // Notify doctor
      await ctx.db.insert("notifications", {
        recipientId: doctor.userId,
        recipientType: "doctor",
        category: "administrative",
        type: "appointment_cancelled",
        priority: "medium",
        title: "Appointment Cancelled",
        message: `Appointment with ${patient.firstName} ${patient.lastName} has been cancelled.`,
        actionUrl: `/doctor/appointments`,
        relatedRecords: {
          appointmentId: args.appointmentId,
          patientId: doctorPatient.patientId,
          doctorId: doctorPatient.doctorId,
        },
        channels: ["in_app"],
        isRead: false,
        createdAt: now,
      });
    }

    return args.appointmentId;
  },
});
