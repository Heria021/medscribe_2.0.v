import { NextRequest, NextResponse } from "next/server";
import { sendEmail, generateOtpVerificationEmail } from "@/lib/email";
import { otpStore } from "@/lib/otp-store";

function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function POST(request: NextRequest) {
  try {
    const { email, firstName } = await request.json();

    if (!email || !firstName) {
      return NextResponse.json(
        { error: "Email and first name are required" },
        { status: 400 }
      );
    }

    // Check if too many attempts
    const existing = otpStore.get(email);
    if (existing && existing.attempts >= 3) {
      return NextResponse.json(
        { error: "Too many attempts. Please try again later." },
        { status: 429 }
      );
    }

    // Generate new OTP
    const otp = generateOTP();
    const expires = Date.now() + 10 * 60 * 1000; // 10 minutes

    // Store OTP using shared store
    otpStore.set(email, {
      otp,
      expires,
      attempts: existing ? existing.attempts + 1 : 1
    });

    // Send email using existing Gmail API
    try {
      const emailOptions = generateOtpVerificationEmail(email, firstName, otp);
      const success = await sendEmail(emailOptions);

      if (success) {
        return NextResponse.json({
          success: true,
          message: "OTP sent successfully",
          expiresIn: 600 // 10 minutes in seconds
        });
      } else {
        throw new Error("Gmail API failed to send email");
      }

    } catch (emailError) {
      console.error("Failed to send OTP email:", emailError);
      return NextResponse.json(
        { error: "Failed to send verification email. Please try again." },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error("Send OTP error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
