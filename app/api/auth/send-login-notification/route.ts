import { NextRequest, NextResponse } from "next/server";
import { sendEmail, generateLoginNotificationEmail } from "@/lib/email";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, firstName, loginDetails } = body;

    // Validate input
    if (!email || !firstName || !loginDetails) {
      return NextResponse.json(
        { error: "Missing required fields: email, firstName, loginDetails" },
        { status: 400 }
      );
    }

    // Generate login notification email
    const emailOptions = generateLoginNotificationEmail(email, firstName, loginDetails);

    // Send the email
    try {
      await sendEmail(emailOptions);
      return NextResponse.json({
        success: true,
        message: "Login notification email sent successfully!",
      });
    } catch (emailError) {
      console.error("Failed to send login notification email:", emailError);
      return NextResponse.json(
        {
          error: "Failed to send login notification email. Please ensure Gmail API is enabled and configured properly.",
          details: emailError instanceof Error ? emailError.message : "Unknown email error"
        },
        { status: 500 }
      );
    }

  } catch (error: any) {
    console.error("Login notification email error:", error);
    return NextResponse.json(
      { 
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}
