import { NextRequest, NextResponse } from "next/server";
import { sendEmail, generateAppointmentConfirmationEmail } from "@/lib/email";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { patientEmail, patientName, doctorName, appointmentDetails } = body;

    // Validate input
    if (!patientEmail || !patientName || !doctorName || !appointmentDetails) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Generate appointment confirmation email
    const emailOptions = generateAppointmentConfirmationEmail(
      patientEmail,
      patientName,
      doctorName,
      appointmentDetails
    );

    // Send the email
    try {
      await sendEmail(emailOptions);
      return NextResponse.json({
        success: true,
        message: "Appointment confirmation email sent successfully!",
      });
    } catch (emailError) {
      console.error("Failed to send appointment confirmation email:", emailError);
      return NextResponse.json(
        {
          error: "Failed to send appointment confirmation email. Please ensure Gmail API is enabled and configured properly.",
          details: emailError instanceof Error ? emailError.message : "Unknown email error"
        },
        { status: 500 }
      );
    }

  } catch (error: any) {
    console.error("Appointment confirmation email error:", error);
    return NextResponse.json(
      { 
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}
