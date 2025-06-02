import { mutation } from "./_generated/server";

// Seed some sample appointments for testing
export const seedSampleAppointments = mutation({
  args: {},
  handler: async (ctx) => {
    // Get some sample patients and doctors
    const patients = await ctx.db.query("patients").take(3);
    const doctors = await ctx.db.query("doctors").take(2);

    if (patients.length === 0 || doctors.length === 0) {
      throw new Error("Need at least one patient and one doctor to seed appointments");
    }

    const now = Date.now();
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    const nextWeek = new Date(today);
    nextWeek.setDate(today.getDate() + 7);

    // Sample appointments
    const sampleAppointments = [
      {
        patientId: patients[0]._id,
        doctorId: doctors[0]._id,
        appointmentDate: today.getTime(),
        appointmentTime: "09:00",
        appointmentType: "consultation",
        appointmentLocation: "Clinic Room 101",
        status: "scheduled" as const,
        notes: "Initial consultation",
        duration: 30,
        createdAt: now,
        updatedAt: now,
      },
      {
        patientId: patients[0]._id,
        doctorId: doctors[0]._id,
        appointmentDate: today.getTime(),
        appointmentTime: "14:30",
        appointmentType: "follow-up",
        appointmentLocation: "Virtual Meeting",
        status: "confirmed" as const,
        notes: "Follow-up appointment",
        duration: 20,
        createdAt: now,
        updatedAt: now,
      },
      {
        patientId: patients[1]._id,
        doctorId: doctors[0]._id,
        appointmentDate: tomorrow.getTime(),
        appointmentTime: "10:15",
        appointmentType: "check-up",
        appointmentLocation: "Clinic Room 102",
        status: "scheduled" as const,
        notes: "Regular check-up",
        duration: 25,
        createdAt: now,
        updatedAt: now,
      },
      {
        patientId: patients[2]._id,
        doctorId: doctors[1]._id,
        appointmentDate: nextWeek.getTime(),
        appointmentTime: "11:00",
        appointmentType: "consultation",
        appointmentLocation: "Clinic Room 103",
        status: "scheduled" as const,
        notes: "New patient consultation",
        duration: 45,
        createdAt: now,
        updatedAt: now,
      },
    ];

    // Insert appointments
    const appointmentIds = [];
    for (const appointment of sampleAppointments) {
      const id = await ctx.db.insert("appointments", appointment);
      appointmentIds.push(id);
    }

    return {
      message: `Created ${appointmentIds.length} sample appointments`,
      appointmentIds,
    };
  },
});

// Clear all appointments (for testing)
export const clearAllAppointments = mutation({
  args: {},
  handler: async (ctx) => {
    const appointments = await ctx.db.query("appointments").collect();
    
    for (const appointment of appointments) {
      await ctx.db.delete(appointment._id);
    }

    return {
      message: `Deleted ${appointments.length} appointments`,
    };
  },
});
