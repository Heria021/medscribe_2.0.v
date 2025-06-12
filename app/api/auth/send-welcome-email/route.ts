import { NextRequest, NextResponse } from "next/server";
import { sendEmail, generateWelcomeEmail } from "@/lib/email";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, firstName, role } = body;

    // Validate input
    if (!email || !firstName || !role) {
      return NextResponse.json(
        { error: "Missing required fields: email, firstName, role" },
        { status: 400 }
      );
    }

    // Generate welcome email
    const emailOptions = generateWelcomeEmail(email, firstName, role);

    // Send the email
    try {
      await sendEmail(emailOptions);
      return NextResponse.json({
        success: true,
        message: "Welcome email sent successfully!",
      });
    } catch (emailError) {
      console.error("Failed to send welcome email:", emailError);
      return NextResponse.json(
        {
          error: "Failed to send welcome email. Please ensure Gmail API is enabled and configured properly.",
          details: emailError instanceof Error ? emailError.message : "Unknown email error"
        },
        { status: 500 }
      );
    }

  } catch (error: any) {
    console.error("Welcome email error:", error);
    return NextResponse.json(
      { 
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}
